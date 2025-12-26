"""Modelo Carregamento - Carregamentos de Caminhão"""
from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

import enum
import uuid
from sqlalchemy import DateTime, Float, Integer, String, Numeric, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class TipoCarregamento(str, enum.Enum):
    interno = "interno"
    remessa = "remessa"
    venda = "venda"


class Carregamento(Base):
    """Carregamento de caminhão com emissão de NFe"""
    __tablename__ = 'carregamentos'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    truck: Mapped[str] = mapped_column(String(10), nullable=False)  # Placa do caminhão
    driver: Mapped[str] = mapped_column(String(120), nullable=False)  # Nome do motorista
    driver_document: Mapped[str | None] = mapped_column(String(20), nullable=True) # CPF/CNPJ do Motorista
    farm: Mapped[str] = mapped_column(String(160), nullable=False)  # Nome da fazenda
    field: Mapped[str] = mapped_column(String(120), nullable=False)  # Talhão
    product: Mapped[str] = mapped_column(String(80), nullable=False)  # Produto (ex: soja, milho, cana)
    variety: Mapped[str | None] = mapped_column(String(120), nullable=True) # Variedade (Snapshot do talhão ou manual)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)  # Quantidade (mantido para compatibilidade, mas ideal usar peso_liquido)
    unit: Mapped[str] = mapped_column(String(10), nullable=False)  # Unidade (ex: "ton", "sc", "kg")
    destination: Mapped[str] = mapped_column(String(160), nullable=False)  # Nome do destino/cliente
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)  # Data/hora programada
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    
    # Tipo de Carregamento (Enum)
    type: Mapped[TipoCarregamento] = mapped_column(Enum(TipoCarregamento), nullable=False, default=TipoCarregamento.remessa)

    # Novos campos de Pesagem e Qualidade
    peso_estimado_kg: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    peso_bruto_kg: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    tara_kg: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    peso_liquido_kg: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)  # Calculado: bruto - tara
    
    umidade_percent: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    impurezas_percent: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    
    # Pesos com Desconto (Calculados)
    peso_com_desconto_fazenda: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    peso_com_desconto_armazem: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    peso_recebido_final_kg: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)

    # Configurações de Pesagem (Snapshot por carregamento)
    umidade_padrao: Mapped[float] = mapped_column(Numeric(4, 2), default=14.0, nullable=False)
    fator_umidade: Mapped[float] = mapped_column(Numeric(4, 2), default=1.5, nullable=False)
    impurezas_padrao: Mapped[float] = mapped_column(Numeric(4, 2), default=1.0, nullable=False)

    # Campos de Comparação (Empresa/Destino Real)
    umidade_empresa_percent: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    impurezas_empresa_percent: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    peso_com_desconto_empresa: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)

    # Relacionamento com Armazém
    armazem_destino_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey('armazens.id'), nullable=True)
    
    
    # Campos relacionados à NFe
    nfe_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)  # Referência enviada para Focus NFe
    nfe_status: Mapped[str | None] = mapped_column(String(50), nullable=True)  # pendente, processando, autorizado, erro, cancelado
    nfe_protocolo: Mapped[str | None] = mapped_column(String(255), nullable=True)  # Protocolo da NFe
    nfe_chave: Mapped[str | None] = mapped_column(String(44), nullable=True)  # Chave de 44 dígitos
    nfe_xml_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # URL do XML
    nfe_danfe_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # URL do DANFE

    # Campos Fiscais (Snapshot/Override)
    cfop: Mapped[str | None] = mapped_column(String(5), nullable=True)
    natureza_operacao: Mapped[str | None] = mapped_column(String(160), nullable=True)
    ncm: Mapped[str | None] = mapped_column(String(10), nullable=True)
    valor_unitario: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)


