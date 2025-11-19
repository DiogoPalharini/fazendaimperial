from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.farm import FarmStatus
from app.schemas.base import ORMModel


class FarmOwnerCreate(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: Annotated[str | None, Field(max_length=32)] = None


class FarmOwnerRead(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    phone: str | None = None


class FarmBase(BaseModel):
    name: str = Field(min_length=3, max_length=160)
    code: str | None = Field(default=None, max_length=32)
    city_state: str = Field(min_length=3, max_length=160)
    hectares: int = Field(default=0, ge=0, le=1_000_000)
    status: FarmStatus = FarmStatus.ACTIVE


class FarmCreate(FarmBase):
    modules: list[str] = Field(min_length=1)
    owner: FarmOwnerCreate


class FarmRead(ORMModel):
    id: UUID
    name: str
    code: str
    city_state: str
    hectares: int
    status: FarmStatus
    created_at: datetime
    updated_at: datetime
    modules: list[str]
    total_users: int
    owner: FarmOwnerRead | None = None

