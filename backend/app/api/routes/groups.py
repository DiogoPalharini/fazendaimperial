import traceback
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_current_system_admin
from app.crud import group as group_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.group import GroupCreate, GroupRead, GroupUpdate
from app.schemas.group_with_owner_farm import GroupWithOwnerFarmCreate
from app.schemas.group_with_farms import GroupWithFarms, FarmInGroup, OwnerInGroup
from app.schemas.group_with_owner_farm_update import GroupWithOwnerFarmUpdate

router = APIRouter()


@router.post('', response_model=GroupRead, status_code=status.HTTP_201_CREATED)
def create_group(
    group_in: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_system_admin),
) -> GroupRead:
    """Criar um novo grupo (apenas system_admin)"""
    db_group = group_crud.create(db, obj_in=group_in)
    db.commit()
    db.refresh(db_group)
    return GroupRead(
        id=db_group.id,
        owner_id=db_group.owner_id,
        name=db_group.name,
        focus_nfe_token=db_group.focus_nfe_token,
        created_at=db_group.created_at,
    )


@router.post('/with-owner-farm', response_model=GroupRead, status_code=status.HTTP_201_CREATED)
def create_group_with_owner_farm(
    payload: GroupWithOwnerFarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_system_admin),
) -> GroupRead:
    """Criar grupo, owner e fazenda em uma única operação (apenas system_admin)"""
    try:
        db_group = group_crud.create_with_owner_and_farm(
            db,
            group_name=payload.group.name,
            owner_name=payload.owner.name,
            owner_cpf=payload.owner.cpf,
            owner_email=payload.owner.email,
            owner_password=payload.owner.password,
            farm_name=payload.farm.name if payload.farm else None,
            farm_certificate_a1=payload.farm.certificate_a1 if payload.farm else None,
            farm_modules=payload.farm.modules if payload.farm else None,
            # Novos Campos
            focus_nfe_token=payload.group.focus_nfe_token, 
            farm_nfe_data=payload.farm.dict(exclude={'name', 'certificate_a1', 'modules'}) if payload.farm else None
        )
        return GroupRead(
            id=db_group.id,
            owner_id=db_group.owner_id,
            name=db_group.name,
            focus_nfe_token=db_group.focus_nfe_token,
            created_at=db_group.created_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get('', response_model=List[GroupWithFarms])
def get_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_system_admin),
) -> List[GroupWithFarms]:
    """Listar todos os grupos com suas fazendas e owners (apenas system_admin)"""
    try:
        groups = group_crud.get_multi(db, include_farms=True)
        result = []
        for group in groups:
            farms = [
                FarmInGroup(
                    id=farm.id,
                    name=farm.name,
                    certificate_a1=farm.certificate_a1,
                    modules=farm.modules,
                    # Fiscal
                    cnpj=farm.cnpj,
                    inscricao_estadual=farm.inscricao_estadual,
                    regime_tributario=farm.regime_tributario,
                    telefone=farm.telefone,
                    cep=farm.cep,
                    logradouro=farm.logradouro,
                    numero=farm.numero,
                    bairro=farm.bairro,
                    municipio=farm.municipio,
                    uf=farm.uf,
                    created_at=farm.created_at,
                )
                for farm in group.farms
            ]
            
            # Carregar owner se existir
            owner = None
            if group.owner:
                owner = OwnerInGroup(
                    id=group.owner.id,
                    name=group.owner.name,
                    cpf=group.owner.cpf,
                    email=group.owner.email,
                )
            
            result.append(
                GroupWithFarms(
                    id=group.id,
                    owner_id=group.owner_id,

                    name=group.name,
                    focus_nfe_token=group.focus_nfe_token,
                    created_at=group.created_at,
                    farms=farms,
                    owner=owner,
                )
            )
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao buscar grupos: {str(e)}")


@router.get('/{group_id}', response_model=GroupWithFarms)
def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> GroupWithFarms:
    """Obter um grupo específico com suas fazendas e owner (usuário do grupo ou admin)"""
    # Se não for admin, verificar se o usuário pertence ao grupo solicitado
    if current_user.base_role != 'system_admin' and current_user.group_id != group_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized so access this group')

    db_group = group_crud.get(db, group_id=group_id, include_farms=True, include_owner=True)
    if not db_group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Group not found')
    
    # Carregar fazendas
    farms = [
        FarmInGroup(
            id=farm.id,
            name=farm.name,
            certificate_a1=farm.certificate_a1,
            modules=farm.modules,
            # Fiscal
            cnpj=farm.cnpj,
            inscricao_estadual=farm.inscricao_estadual,
            regime_tributario=farm.regime_tributario,
            telefone=farm.telefone,
            cep=farm.cep,
            logradouro=farm.logradouro,
            numero=farm.numero,
            bairro=farm.bairro,
            municipio=farm.municipio,
            uf=farm.uf,
            created_at=farm.created_at,
        )
        for farm in db_group.farms
    ]
    
    # Carregar owner se existir
    owner = None
    if db_group.owner:
        owner = OwnerInGroup(
            id=db_group.owner.id,
            name=db_group.owner.name,
            cpf=db_group.owner.cpf,
            email=db_group.owner.email,
        )
    
    return GroupWithFarms(
        id=db_group.id,
        owner_id=db_group.owner_id,
        name=db_group.name,
        focus_nfe_token=db_group.focus_nfe_token,
        created_at=db_group.created_at,
        farms=farms,
        owner=owner,
    )


@router.patch('/{group_id}', response_model=GroupRead)
def update_group(
    group_id: int,
    group_in: GroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_system_admin),
) -> GroupRead:
    """Atualizar um grupo (apenas system_admin)"""
    db_group = group_crud.get(db, group_id=group_id)
    if not db_group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Group not found')
    db_group = group_crud.update(db, db_obj=db_group, obj_in=group_in)
    db.commit()
    db.refresh(db_group)
    return GroupRead(
        id=db_group.id,
        owner_id=db_group.owner_id,
        name=db_group.name,
        focus_nfe_token=db_group.focus_nfe_token,
        created_at=db_group.created_at,
    )


@router.patch('/{group_id}/full', response_model=GroupWithFarms)
def update_group_full(
    group_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_system_admin),
) -> GroupWithFarms:
    """Atualizar grupo, owner e fazendas completamente (apenas system_admin)"""
    try:
        # Preparar dados para atualização
        group_name = payload.get('group', {}).get('name') if payload.get('group') else None
        focus_nfe_token = payload.get('group', {}).get('focus_nfe_token') if payload.get('group') else None
        owner_data = payload.get('owner')
        farms_data = payload.get('farms')

        # Converter farms_data para formato esperado
        farms_list = None
        if farms_data:
            farms_list = [
                {
                    'id': farm.get('id') if farm.get('id') else None,
                    'name': farm.get('name'),
                    'certificate_a1': farm.get('certificate_a1'),
                    'modules': farm.get('modules'),
                    # Campos Fiscais / NFe
                    'cnpj': farm.get('cnpj'),
                    'inscricao_estadual': farm.get('inscricao_estadual'),
                    'regime_tributario': farm.get('regime_tributario'),
                    'telefone': farm.get('telefone'),
                    # Endereço
                    'cep': farm.get('cep'),
                    'logradouro': farm.get('logradouro'),
                    'numero': farm.get('numero'),
                    'bairro': farm.get('bairro'),
                    'municipio': farm.get('municipio'),
                    'uf': farm.get('uf'),
                }
                for farm in farms_data
            ]

        db_group = group_crud.update_with_owner_and_farms(
            db,
            group_id=group_id,
            group_name=group_name,
            focus_nfe_token=focus_nfe_token,
            owner_name=owner_data.get('name') if owner_data else None,
            owner_cpf=owner_data.get('cpf') if owner_data else None,
            owner_email=owner_data.get('email') if owner_data else None,
            owner_password=owner_data.get('password') if owner_data else None,
            farms_data=farms_list,
        )

        # Retornar grupo atualizado com fazendas
        farms = [
            FarmInGroup(
                id=farm.id,
                name=farm.name,
                certificate_a1=farm.certificate_a1,
                modules=farm.modules,
                # Fiscal
                cnpj=farm.cnpj,
                inscricao_estadual=farm.inscricao_estadual,
                regime_tributario=farm.regime_tributario,
                telefone=farm.telefone,
                cep=farm.cep,
                logradouro=farm.logradouro,
                numero=farm.numero,
                bairro=farm.bairro,
                municipio=farm.municipio,
                uf=farm.uf,
                created_at=farm.created_at,
            )
            for farm in db_group.farms
        ]

        return GroupWithFarms(
            id=db_group.id,
            owner_id=db_group.owner_id,
            name=db_group.name,
            focus_nfe_token=db_group.focus_nfe_token,
            created_at=db_group.created_at,
            farms=farms,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao atualizar: {str(e)}")


@router.delete('/{group_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_system_admin),
):
    """Deletar um grupo e todos os seus relacionamentos (apenas system_admin)"""
    db_group = group_crud.get(db, group_id=group_id)
    if not db_group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Group not found')
    group_crud.delete(db, group_id=group_id)
    db.commit()
    return None

