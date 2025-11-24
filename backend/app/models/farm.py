"""Modelo Farm - Fazendas"""
from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.group import Group
    from app.models.user_farm_permissions import UserFarmPermissions


class Farm(Base):
    """Fazenda pertencente a um grupo"""
    __tablename__ = 'farms'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    group_id: Mapped[int] = mapped_column(Integer, ForeignKey('groups.id'), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    certificate_a1: Mapped[str | None] = mapped_column(String(255), nullable=True)
    modules: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relacionamentos
    group: Mapped['Group'] = relationship(
        'Group',
        back_populates='farms',
        foreign_keys=[group_id]
    )
    user_permissions: Mapped[list['UserFarmPermissions']] = relationship(
        'UserFarmPermissions',
        back_populates='farm',
        cascade='all, delete-orphan'
    )
