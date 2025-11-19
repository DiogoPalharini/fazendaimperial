from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class FarmModule(Base):
    __tablename__ = 'farm_modules'

    farm_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey('farms.id', ondelete='CASCADE'), primary_key=True
    )
    module_key: Mapped[str] = mapped_column(String(64), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    farm = relationship('Farm', back_populates='feature_modules')

