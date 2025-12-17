from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.base import ORMModel


class FarmBase(ORMModel):
    id: int
    group_id: int
    name: str
    certificate_a1: Optional[str]
    modules: Optional[dict]
    created_at: datetime
    
    # NFe
    cnpj: Optional[str]
    inscricao_estadual: Optional[str]
    telefone: Optional[str]
    logradouro: Optional[str]
    numero: Optional[str]
    bairro: Optional[str]
    municipio: Optional[str]
    uf: Optional[str]
    cep: Optional[str]
    regime_tributario: str
    default_cfop: Optional[str]
    default_natureza_operacao: Optional[str]


class FarmCreate(BaseModel):
    group_id: int
    name: str = Field(min_length=3, max_length=160)
    certificate_a1: Optional[str] = Field(None, max_length=255)
    modules: Optional[dict] = None
    
    # NFe
    cnpj: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    telefone: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    municipio: Optional[str] = None
    uf: Optional[str] = None
    cep: Optional[str] = None
    regime_tributario: str = '1'
    default_cfop: Optional[str] = None
    default_natureza_operacao: Optional[str] = None


class FarmRead(FarmBase):
    pass
