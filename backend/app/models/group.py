"""Modelo Group - Grupo de fazendas"""
from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.farm import Farm


class Group(Base):
    """Grupo de fazendas pertencente a um único owner"""
    __tablename__ = 'groups'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    owner_id: Mapped[int | None] = mapped_column(Integer, ForeignKey('users.id'), nullable=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    # Token da Focus NFe (Multi-Tenant)
    focus_nfe_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relacionamentos
    owner: Mapped['User'] = relationship(
        'User',
        back_populates='owned_group',
        foreign_keys=[owner_id],
        post_update=True
    )
    farms: Mapped[list['Farm']] = relationship(
        'Farm',
        back_populates='group',
        cascade='all, delete-orphan'
    )
    users: Mapped[list['User']] = relationship(
        'User',
        back_populates='group',
        foreign_keys='User.group_id',
        cascade='all, delete-orphan'
    )

