"""Modelo Field - Talhões da Fazenda"""
from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.farm import Farm


class Field(Base):
    """Talhão pertencente a uma fazenda"""
    __tablename__ = 'fields'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    farm_id: Mapped[int] = mapped_column(Integer, ForeignKey('farms.id'), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False) # Identificação do Talhão
    product: Mapped[str] = mapped_column(String(80), nullable=False) # Produto (Soja, Milho, etc)
    variety: Mapped[str | None] = mapped_column(String(120), nullable=True) # Variedade (Intacta, etc)
    area_hectares: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Relacionamentos
    farm: Mapped['Farm'] = relationship(
        'Farm',
        back_populates='fields'
    )
