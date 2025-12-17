from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class FarmInGroup(BaseModel):
    id: int
    name: str
    certificate_a1: Optional[str]
    modules: Optional[dict]
    # Fiscal
    cnpj: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    regime_tributario: Optional[str] = None
    telefone: Optional[str] = None
    cep: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    municipio: Optional[str] = None
    uf: Optional[str] = None
    created_at: datetime


class OwnerInGroup(BaseModel):
    id: int
    name: str
    cpf: str
    email: str


class GroupWithFarms(BaseModel):
    id: int
    owner_id: Optional[int]
    name: str
    focus_nfe_token: Optional[str] = None
    created_at: datetime
    farms: List[FarmInGroup]
    owner: Optional[OwnerInGroup] = None

