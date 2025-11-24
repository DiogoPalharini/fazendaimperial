from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.base import ORMModel


class GroupBase(ORMModel):
    id: int
    owner_id: Optional[int]
    name: str
    created_at: datetime


class GroupCreate(BaseModel):
    name: str = Field(min_length=3, max_length=160)


class GroupRead(GroupBase):
    pass


class GroupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=160)
    owner_id: Optional[int] = None

