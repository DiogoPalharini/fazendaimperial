from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class OwnerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=120)
    cpf: Optional[str] = Field(None, min_length=11, max_length=14)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=128)


class FarmUpdateInGroup(BaseModel):
    id: Optional[int] = None  # Se None, cria nova fazenda
    name: Optional[str] = Field(None, min_length=3, max_length=160)
    certificate_a1: Optional[str] = Field(None, max_length=255)
    modules: Optional[dict] = None


class GroupWithOwnerFarmUpdate(BaseModel):
    """Schema para atualizar grupo, owner e fazendas"""
    group: Optional[dict] = None  # { name: str }
    owner: Optional[OwnerUpdate] = None
    farms: Optional[list[FarmUpdateInGroup]] = None

