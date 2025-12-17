from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.base import ORMModel


class GroupBase(ORMModel):
    id: int
    owner_id: Optional[int] = None
    name: str
    focus_nfe_token: Optional[str] = None
    created_at: datetime


class GroupCreate(BaseModel):
    name: str = Field(min_length=3, max_length=160)
    focus_nfe_token: Optional[str] = None


class GroupRead(GroupBase):
    pass


class GroupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=160)
    owner_id: Optional[int] = None
    focus_nfe_token: Optional[str] = None

