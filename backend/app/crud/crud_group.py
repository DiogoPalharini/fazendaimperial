from __future__ import annotations

from typing import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.group import Group
from app.models.user import User
from app.models.permissions_enum import BaseRole
from app.schemas.group import GroupCreate, GroupUpdate


class CRUDGroup:
    def get(self, db: Session, *, group_id: int, include_farms: bool = False, include_owner: bool = False) -> Group | None:
        query = select(Group).where(Group.id == group_id)
        if include_farms:
            query = query.options(joinedload(Group.farms))
        if include_owner:
            query = query.options(joinedload(Group.owner))
        result = db.execute(query)
        if include_farms:
            # Quando há joinedload de coleções, precisamos usar unique()
            group = result.scalars().unique().first()
        else:
            group = result.scalar_one_or_none()
        return group

    def get_multi(self, db: Session, include_farms: bool = True) -> Sequence[Group]:
        # Carregar grupos com fazendas e owner
        query = select(Group)
        if include_farms:
            query = query.options(joinedload(Group.farms))
        # Sempre carregar owner também
        query = query.options(joinedload(Group.owner))
        return (
            db.execute(
                query.order_by(Group.created_at.desc())
            )
            .scalars()
            .unique()
            .all()
        )

    def create(self, db: Session, *, obj_in: GroupCreate) -> Group:
        db_group = Group(name=obj_in.name, owner_id=None)
        db.add(db_group)
        db.flush()
        return db_group

    def update(self, db: Session, *, db_obj: Group, obj_in: GroupUpdate) -> Group:
        if obj_in.name is not None:
            db_obj.name = obj_in.name
        if obj_in.owner_id is not None:
            # Validar que o owner existe e pertence ao grupo
            owner = db.get(User, obj_in.owner_id)
            if owner and owner.group_id == db_obj.id and owner.base_role == BaseRole.OWNER:
                db_obj.owner_id = obj_in.owner_id
        db.add(db_obj)
        db.flush()
        return db_obj

    def create_with_owner_and_farm(
        self,
        db: Session,
        *,
        group_name: str,
        owner_name: str,
        owner_cpf: str,
        owner_email: str,
        owner_password: str,
        farm_name: str | None = None,
        # Argumentos antigos mantidos por compatibilidade ou atualizados
        farm_certificate_a1: str | None = None,
        farm_modules: dict | None = None,
        # Novos argumentos NFe
        focus_nfe_token: str | None = None,
        farm_nfe_data: dict | None = None, 
    ) -> Group:
        """Cria grupo, owner e fazenda em uma transação"""
        from app.core.security import get_password_hash
        from app.models.farm import Farm

        # Verificar se email já existe
        if db.query(User).filter(User.email == owner_email.lower()).first():
            raise ValueError("Email já está em uso")

        # Criar grupo
        db_group = Group(
            name=group_name, 
            owner_id=None,
            focus_nfe_token=focus_nfe_token
        )
        db.add(db_group)
        db.flush()

        # Criar owner
        db_owner = User(
            group_id=db_group.id,
            name=owner_name,
            cpf=owner_cpf,
            email=owner_email.lower(),
            password_hash=get_password_hash(owner_password),
            base_role=BaseRole.OWNER,
        )
        db.add(db_owner)
        db.flush()

        # Associar owner ao grupo
        db_group.owner_id = db_owner.id
        db.add(db_group)
        db.flush()

        # Criar fazenda se fornecida
        if farm_name:
            farm_kwargs = {
                "group_id": db_group.id,
                "name": farm_name,
                "certificate_a1": farm_certificate_a1,
                "modules": farm_modules,
            }
            # Adicionar dados NFe se fornecidos
            if farm_nfe_data:
                # Filtrar chaves que existem no modelo Farm
                allowed_keys = [
                    'cnpj', 'inscricao_estadual', 'telefone',
                    'logradouro', 'numero', 'bairro', 'municipio', 'uf', 'cep',
                    'regime_tributario', 'default_cfop', 'default_natureza_operacao'
                ]
                for key in allowed_keys:
                    if key in farm_nfe_data:
                         farm_kwargs[key] = farm_nfe_data[key]

            db_farm = Farm(**farm_kwargs)
            db.add(db_farm)
            db.flush()

        db.commit()
        db.refresh(db_group)
        return db_group

    def update_with_owner_and_farms(
        self,
        db: Session,
        *,
        group_id: int,
        group_name: str | None = None,
        owner_name: str | None = None,
        owner_cpf: str | None = None,
        owner_email: str | None = None,
        owner_password: str | None = None,

        focus_nfe_token: str | None = None,
        farms_data: list[dict] | None = None,
    ) -> Group:
        """Atualiza grupo, owner e fazendas em uma transação"""
        from app.core.security import get_password_hash
        from app.models.farm import Farm

        db_group = db.get(Group, group_id)
        if not db_group:
            raise ValueError("Grupo não encontrado")

        # Atualizar nome do grupo
        if group_name is not None:
            db_group.name = group_name
        
        if focus_nfe_token is not None:
            db_group.focus_nfe_token = focus_nfe_token
            
        if group_name is not None or focus_nfe_token is not None:
            db.add(db_group)
            db.flush()

        # Atualizar owner se existir
        if db_group.owner_id:
            db_owner = db.get(User, db_group.owner_id)
            if db_owner:
                if owner_name is not None:
                    db_owner.name = owner_name
                if owner_cpf is not None:
                    db_owner.cpf = owner_cpf
                if owner_email is not None:
                    # Verificar se email já existe em outro usuário
                    existing_user = db.query(User).filter(
                        User.email == owner_email.lower(),
                        User.id != db_owner.id
                    ).first()
                    if existing_user:
                        raise ValueError("Email já está em uso")
                    db_owner.email = owner_email.lower()
                if owner_password is not None:
                    db_owner.password_hash = get_password_hash(owner_password)
                db.add(db_owner)
                db.flush()

        # Atualizar fazendas
        if farms_data is not None:
            # Atualizar fazendas existentes ou criar novas
            for farm_data in farms_data:
                if farm_data.get('id'):
                    # Atualizar fazenda existente
                    db_farm = db.get(Farm, farm_data['id'])
                    if db_farm and db_farm.group_id == group_id:
                        if 'name' in farm_data:
                            db_farm.name = farm_data['name']
                        if 'certificate_a1' in farm_data:
                            db_farm.certificate_a1 = farm_data['certificate_a1']
                        if 'modules' in farm_data:
                            db_farm.modules = farm_data['modules']
                        
                        # Campos Fiscais / NFe
                        if 'cnpj' in farm_data: 
                            db_farm.cnpj = farm_data['cnpj']
                        if 'inscricao_estadual' in farm_data:
                            db_farm.inscricao_estadual = farm_data['inscricao_estadual']
                        if 'regime_tributario' in farm_data:
                            db_farm.regime_tributario = farm_data['regime_tributario']
                        if 'telefone' in farm_data:
                            db_farm.telefone = farm_data['telefone']
                        
                        # Endereço
                        if 'cep' in farm_data: db_farm.cep = farm_data['cep']
                        if 'logradouro' in farm_data: db_farm.logradouro = farm_data['logradouro']
                        if 'numero' in farm_data: db_farm.numero = farm_data['numero']
                        if 'bairro' in farm_data: db_farm.bairro = farm_data['bairro']
                        if 'municipio' in farm_data: db_farm.municipio = farm_data['municipio']
                        if 'uf' in farm_data: db_farm.uf = farm_data['uf']

                        db.add(db_farm)
                else:
                    # Criar nova fazenda
                    db_farm = Farm(
                        group_id=group_id,
                        name=farm_data.get('name', ''),
                        certificate_a1=farm_data.get('certificate_a1'),
                        modules=farm_data.get('modules'),
                        # Novos campos
                        cnpj=farm_data.get('cnpj'),
                        inscricao_estadual=farm_data.get('inscricao_estadual'),
                        regime_tributario=farm_data.get('regime_tributario', '1'),
                        telefone=farm_data.get('telefone'),
                        cep=farm_data.get('cep'),
                        logradouro=farm_data.get('logradouro'),
                        numero=farm_data.get('numero'),
                        bairro=farm_data.get('bairro'),
                        municipio=farm_data.get('municipio'),
                        uf=farm_data.get('uf'),
                    )
                    db.add(db_farm)
            db.flush()

        db.commit()
        db.refresh(db_group)
        return db_group

    def delete(self, db: Session, *, group_id: int) -> Group | None:
        """Deletar um grupo (cascade deleta fazendas e usuários)"""
        db_group = db.get(Group, group_id)
        if db_group:
            # Desvincular owner primeiro para evitar dependência circular
            db_group.owner_id = None
            db.add(db_group)
            db.commit() # Commit para efetivar o update no banco
            db.refresh(db_group) # Recarregar estado

            db.delete(db_group)
            db.flush()
        return db_group


group = CRUDGroup()

