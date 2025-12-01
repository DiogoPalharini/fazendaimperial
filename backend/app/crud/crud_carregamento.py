from __future__ import annotations

from typing import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.carregamento import Carregamento
from app.schemas.carregamento import CarregamentoCreate


class CRUDCarregamento:
    def create(self, db: Session, *, obj_in: CarregamentoCreate, commit: bool = True) -> Carregamento:
        """Cria um novo carregamento no banco"""
        db_obj = Carregamento(
            truck=obj_in.truck,
            driver=obj_in.driver,
            farm=obj_in.farm,
            field=obj_in.field,
            product=obj_in.product,
            quantity=obj_in.quantity,
            unit=obj_in.unit,
            destination=obj_in.destination,
            scheduled_at=obj_in.scheduled_at,
            nfe_status=obj_in.nfe_status,
        )
        db.add(db_obj)
        if commit:
            db.commit()
            db.refresh(db_obj)
        else:
            db.flush()  # Para obter o ID sem fazer commit
        return db_obj

    def get(self, db: Session, id: int) -> Carregamento | None:
        """Busca um carregamento por ID"""
        return db.execute(select(Carregamento).where(Carregamento.id == id)).scalar_one_or_none()

    def update_nfe_data(
        self,
        db: Session,
        *,
        db_obj: Carregamento,
        nfe_ref: str | None = None,
        nfe_status: str | None = None,
        nfe_protocolo: str | None = None,
        nfe_chave: str | None = None,
        nfe_xml_url: str | None = None,
        nfe_danfe_url: str | None = None,
        commit: bool = True,
    ) -> Carregamento:
        """Atualiza os dados da NFe no carregamento"""
        if nfe_ref is not None:
            db_obj.nfe_ref = nfe_ref
        if nfe_status is not None:
            db_obj.nfe_status = nfe_status
        if nfe_protocolo is not None:
            db_obj.nfe_protocolo = nfe_protocolo
        if nfe_chave is not None:
            db_obj.nfe_chave = nfe_chave
        if nfe_xml_url is not None:
            db_obj.nfe_xml_url = nfe_xml_url
        if nfe_danfe_url is not None:
            db_obj.nfe_danfe_url = nfe_danfe_url

        db.add(db_obj)
        if commit:
            db.commit()
            db.refresh(db_obj)
        else:
            db.flush()
        return db_obj

    def get_multi(self, db: Session) -> Sequence[Carregamento]:
        """Lista todos os carregamentos"""
        return db.execute(select(Carregamento).order_by(Carregamento.created_at.desc())).scalars().all()


carregamento = CRUDCarregamento()

