from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.base import ORMModel


class CarregamentoBase(ORMModel):
    id: int
    truck: str
    driver: str
    farm: str
    field: str
    product: str
    quantity: float
    unit: str
    destination: str
    scheduled_at: datetime
    created_at: datetime
    nfe_ref: Optional[str] = None
    nfe_status: Optional[str] = None
    nfe_protocolo: Optional[str] = None
    nfe_chave: Optional[str] = None
    nfe_xml_url: Optional[str] = None
    nfe_danfe_url: Optional[str] = None


class CarregamentoForm(BaseModel):
    """Schema para receber dados do frontend"""
    scheduledAt: str = Field(..., description='Data/hora programada no formato ISO')
    truck: str = Field(..., min_length=1, max_length=10, description='Placa do caminhão')
    driver: str = Field(..., min_length=1, max_length=120, description='Nome do motorista')
    farm: str = Field(..., min_length=1, max_length=160, description='Nome da fazenda')
    field: str = Field(..., min_length=1, max_length=120, description='Talhão')
    product: str = Field(..., min_length=1, max_length=80, description='Produto (ex: soja, milho, cana)')
    quantity: str = Field(..., description='Quantidade como string')
    unit: str = Field(..., min_length=1, max_length=10, description='Unidade (ex: ton, sc, kg)')
    destination: str = Field(..., min_length=1, max_length=160, description='Nome do destino/cliente')


class CarregamentoRead(CarregamentoBase):
    """Schema para resposta da API"""
    pass


class CarregamentoCreate(BaseModel):
    """Schema interno para criação no banco"""
    truck: str
    driver: str
    farm: str
    field: str
    product: str
    quantity: float
    unit: str
    destination: str
    scheduled_at: datetime
    nfe_status: Optional[str] = 'pendente'

