"""Modelo Carregamento - Carregamentos de Caminhão"""
from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Carregamento(Base):
    """Carregamento de caminhão com emissão de NFe"""
    __tablename__ = 'carregamentos'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    truck: Mapped[str] = mapped_column(String(10), nullable=False)  # Placa do caminhão
    driver: Mapped[str] = mapped_column(String(120), nullable=False)  # Nome do motorista
    farm: Mapped[str] = mapped_column(String(160), nullable=False)  # Nome da fazenda
    field: Mapped[str] = mapped_column(String(120), nullable=False)  # Talhão
    product: Mapped[str] = mapped_column(String(80), nullable=False)  # Produto (ex: soja, milho, cana)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)  # Quantidade
    unit: Mapped[str] = mapped_column(String(10), nullable=False)  # Unidade (ex: "ton", "sc", "kg")
    destination: Mapped[str] = mapped_column(String(160), nullable=False)  # Nome do destino/cliente
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)  # Data/hora programada
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    
    # Campos relacionados à NFe
    nfe_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)  # Referência enviada para Focus NFe
    nfe_status: Mapped[str | None] = mapped_column(String(50), nullable=True)  # pendente, processando, autorizado, erro, cancelado
    nfe_protocolo: Mapped[str | None] = mapped_column(String(255), nullable=True)  # Protocolo da NFe
    nfe_chave: Mapped[str | None] = mapped_column(String(44), nullable=True)  # Chave de 44 dígitos
    nfe_xml_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # URL do XML
    nfe_danfe_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # URL do DANFE

