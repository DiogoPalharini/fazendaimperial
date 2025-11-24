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


class FarmCreate(BaseModel):
    group_id: int
    name: str = Field(min_length=3, max_length=160)
    certificate_a1: Optional[str] = Field(None, max_length=255)
    modules: Optional[dict] = None


class FarmRead(FarmBase):
    pass
