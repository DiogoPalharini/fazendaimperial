from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.schemas.group import GroupCreate


class OwnerCreate(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    cpf: str = Field(min_length=11, max_length=14)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class FarmCreateInGroup(BaseModel):
    """Schema para criar fazenda dentro de um grupo (sem group_id, será preenchido automaticamente)"""
    name: str = Field(min_length=3, max_length=160)
    certificate_a1: Optional[str] = Field(None, max_length=255)
    modules: Optional[dict] = None


class GroupWithOwnerFarmCreate(BaseModel):
    """Schema para criar grupo, owner e fazenda em uma única operação"""
    group: GroupCreate
    owner: OwnerCreate
    farm: Optional[FarmCreateInGroup] = None

