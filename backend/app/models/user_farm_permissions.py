"""Modelo UserFarmPermissions - Permissões de usuário por fazenda"""
from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.farm import Farm


class UserFarmPermissions(Base):
    """Permissões de módulos por usuário em cada fazenda"""
    __tablename__ = 'user_farm_permissions'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    farm_id: Mapped[int] = mapped_column(Integer, ForeignKey('farms.id'), nullable=False)
    allowed_modules: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relacionamentos
    user: Mapped['User'] = relationship(
        'User',
        back_populates='farms_permissions',
        foreign_keys=[user_id]
    )
    farm: Mapped['Farm'] = relationship(
        'Farm',
        back_populates='user_permissions',
        foreign_keys=[farm_id]
    )

