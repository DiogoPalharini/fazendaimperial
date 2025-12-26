from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.base import ORMModel


class FieldBase(ORMModel):
    id: int
    farm_id: int
    name: str
    product: str
    variety: Optional[str]
    area_hectares: Optional[float]


class FieldCreate(BaseModel):
    farm_id: int
    name: str = Field(min_length=1, max_length=120)
    product: str = Field(min_length=1, max_length=80)
    variety: Optional[str] = Field(None, max_length=120)
    area_hectares: Optional[float] = None


class FieldRead(FieldBase):
    pass


class FieldUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    product: Optional[str] = Field(None, min_length=1, max_length=80)
    variety: Optional[str] = Field(None, max_length=120)
    area_hectares: Optional[float] = None
