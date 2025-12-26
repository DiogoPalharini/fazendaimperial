from typing import List

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.farm import Farm
from app.schemas.farm import FarmCreate, FarmRead

class CRUDFarm(CRUDBase[Farm, FarmCreate, FarmRead]):
    def create_with_owner(self, db: Session, *, obj_in: FarmCreate) -> Farm:
        # Custom logic if needed, otherwise use super().create
        # Since FarmCreate has group_id, we can just create it directly.
        # Ensure we don't duplicate logic unnecessarily.
        
        # Check if user has permission handled in route.
        
        db_obj = Farm(
            group_id=obj_in.group_id,
            name=obj_in.name,
            certificate_a1=obj_in.certificate_a1,
            modules=obj_in.modules,
            # NFe fields
            cnpj=obj_in.cnpj,
            inscricao_estadual=obj_in.inscricao_estadual,
            telefone=obj_in.telefone,
            logradouro=obj_in.logradouro,
            numero=obj_in.numero,
            bairro=obj_in.bairro,
            municipio=obj_in.municipio,
            uf=obj_in.uf,
            cep=obj_in.cep,
            regime_tributario=obj_in.regime_tributario,
            default_cfop=obj_in.default_cfop,
            default_natureza_operacao=obj_in.default_natureza_operacao
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

farm = CRUDFarm(Farm)
