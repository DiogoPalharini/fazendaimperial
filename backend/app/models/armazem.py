"""Modelo Armazem - Armazéns de Destino"""
from __future__ import annotations

import uuid
from sqlalchemy import Boolean, Float, String, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Armazem(Base):
    """Armazém de destino para carregamentos"""
    __tablename__ = 'armazens'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome: Mapped[str] = mapped_column(String(160), nullable=False)
    cnpj: Mapped[str | None] = mapped_column(String(20), nullable=True)
    inscricao_estadual: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(120), nullable=True)
    telefone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    
    logradouro: Mapped[str | None] = mapped_column(String(200), nullable=True)
    numero: Mapped[str | None] = mapped_column(String(20), nullable=True)
    bairro: Mapped[str | None] = mapped_column(String(100), nullable=True)
    municipio: Mapped[str | None] = mapped_column(String(100), nullable=True)
    uf: Mapped[str | None] = mapped_column(String(2), nullable=True)
    cep: Mapped[str | None] = mapped_column(String(10), nullable=True)
    
    # Parâmetros de desconto padrão do armazém
    umidade_padrao: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=14.0)
    fator_umidade: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=1.5)
    impurezas_padrao: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=1.0)
    
    eh_proprio: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
