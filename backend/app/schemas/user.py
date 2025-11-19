from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole
from app.schemas.base import ORMModel


class UserBase(ORMModel):
    id: UUID
    name: str
    email: EmailStr
    role: UserRole
    phone: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserCreate(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    role: UserRole = UserRole.EMPLOYEE
    farm_id: UUID | None = None
    phone: str | None = Field(default=None, max_length=32)


class UserRead(UserBase):
    farm_id: UUID | None = None

