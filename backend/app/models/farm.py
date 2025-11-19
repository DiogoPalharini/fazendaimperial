from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class FarmStatus(str, enum.Enum):
    ACTIVE = 'active'
    INACTIVE = 'inactive'


class Farm(Base):
    __tablename__ = 'farms'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    code: Mapped[str] = mapped_column(String(32), nullable=False, unique=True, index=True)
    city_state: Mapped[str] = mapped_column(String(160), nullable=False)
    hectares: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[FarmStatus] = mapped_column(Enum(FarmStatus, name='farm_status'), default=FarmStatus.ACTIVE)
    owner_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship('User', back_populates='owned_farm', foreign_keys=[owner_id])
    users = relationship('User', back_populates='farm', foreign_keys='User.farm_id')
    feature_modules = relationship('FarmModule', back_populates='farm', cascade='all, delete-orphan')

    @property
    def module_keys(self) -> list[str]:
        return [module.module_key for module in self.feature_modules]

    @property
    def total_users_count(self) -> int:
        return len(self.users)



