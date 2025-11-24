from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class FarmInGroup(BaseModel):
    id: int
    name: str
    certificate_a1: Optional[str]
    modules: Optional[dict]
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
    created_at: datetime
    farms: List[FarmInGroup]
    owner: Optional[OwnerInGroup] = None

