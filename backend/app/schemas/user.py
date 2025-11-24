from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.permissions_enum import BaseRole
from app.schemas.base import ORMModel


class UserBase(ORMModel):
    id: int
    group_id: int
    name: str
    cpf: str
    email: EmailStr
    base_role: BaseRole
    active: bool
    created_at: datetime


class UserCreate(BaseModel):
    group_id: int
    name: str = Field(min_length=3, max_length=120)
    cpf: str = Field(min_length=11, max_length=14)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    base_role: BaseRole = BaseRole.OPERATIONAL


class UserRead(UserBase):
    pass

