from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional

class ArmazemBase(BaseModel):
    nome: str
    cnpj: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    municipio: Optional[str] = None
    uf: Optional[str] = None
    cep: Optional[str] = None
    umidade_padrao: float = 14.0
    fator_umidade: float = 1.5
    impurezas_padrao: float = 1.0
    eh_proprio: bool = False

class ArmazemCreate(ArmazemBase):
    pass

class ArmazemUpdate(ArmazemBase):
    pass

class Armazem(ArmazemBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)
