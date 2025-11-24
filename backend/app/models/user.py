"""Modelo User - Usuários"""
from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.permissions_enum import BaseRole

if TYPE_CHECKING:
    from app.models.group import Group
    from app.models.user_farm_permissions import UserFarmPermissions


class User(Base):
    """Usuário pertencente a um grupo"""
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    group_id: Mapped[int] = mapped_column(Integer, ForeignKey('groups.id'), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    cpf: Mapped[str] = mapped_column(String(14), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    base_role: Mapped[BaseRole] = mapped_column(
        Enum(BaseRole, name='base_role'),
        nullable=False
    )
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relacionamentos
    group: Mapped['Group'] = relationship(
        'Group',
        back_populates='users',
        foreign_keys=[group_id]
    )
    owned_group: Mapped['Group | None'] = relationship(
        'Group',
        back_populates='owner',
        foreign_keys='Group.owner_id',
        uselist=False
    )
    farms_permissions: Mapped[list['UserFarmPermissions']] = relationship(
        'UserFarmPermissions',
        back_populates='user',
        cascade='all, delete-orphan'
    )
