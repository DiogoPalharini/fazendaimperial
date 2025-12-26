from datetime import datetime
from typing import Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.base import ORMModel


class CarregamentoBase(ORMModel):
    id: int
    truck: str
    driver: str
    driver_document: Optional[str] = None
    farm: str
    field: str
    product: str
    product: str
    variety: Optional[str] = None
    quantity: float
    unit: str
    destination: str
    scheduled_at: datetime
    created_at: datetime
    type: str
    
    # Novos campos
    peso_estimado_kg: Optional[float] = None
    peso_bruto_kg: Optional[float] = None
    tara_kg: Optional[float] = None
    peso_liquido_kg: Optional[float] = None
    umidade_percent: Optional[float] = None
    impurezas_percent: Optional[float] = None
    peso_com_desconto_fazenda: Optional[float] = None
    peso_com_desconto_armazem: Optional[float] = None
    peso_recebido_final_kg: Optional[float] = None
    
    # Configs
    umidade_padrao: Optional[float] = 14.0
    fator_umidade: Optional[float] = 1.5
    impurezas_padrao: Optional[float] = 1.0

    impurezas_empresa_percent: Optional[float] = None
    peso_com_desconto_empresa: Optional[float] = None

    armazem_destino_id: Optional[Union[UUID, str]] = None  # UUID as string
    
    nfe_ref: Optional[str] = None
    nfe_status: Optional[str] = None
    nfe_protocolo: Optional[str] = None
    nfe_chave: Optional[str] = None
    nfe_xml_url: Optional[str] = None
    nfe_danfe_url: Optional[str] = None
    
    # Overrides
    cfop: Optional[str] = None
    natureza_operacao: Optional[str] = None
    ncm: Optional[str] = None
    valor_unitario: Optional[float] = None


class CarregamentoForm(BaseModel):
    """Schema para receber dados do frontend"""
    scheduledAt: str = Field(..., description='Data/hora programada no formato ISO')
    type: str = Field(..., description='Tipo de carregamento: interno, remessa, venda')
    truck: str = Field(..., min_length=1, max_length=10, description='Placa do caminhão')
    driver: str = Field(..., min_length=1, max_length=120, description='Nome do motorista')
    driver_document: Optional[str] = Field(None, max_length=20, description='CPF/CNPJ do Motorista')
    farm: str = Field(..., min_length=1, max_length=160, description='Nome da fazenda')
    field: str = Field(..., min_length=1, max_length=120, description='Talhão')
    product: str = Field(..., min_length=1, max_length=80, description='Produto (ex: soja, milho, cana)')
    variety: Optional[str] = Field(None, max_length=120, description='Variedade')
    quantity: str = Field(..., description='Quantidade como string')
    unit: str = Field(..., min_length=1, max_length=10, description='Unidade (ex: ton, sc, kg)')
    destination: str = Field(..., min_length=1, max_length=160, description='Nome do destino/cliente')

    # Novos campos de Pesagem (Opcionais no form inicial, obrigatórios dependendo do fluxo)
    peso_estimado_kg: Optional[float] = None
    peso_bruto_kg: Optional[float] = None
    tara_kg: Optional[float] = None
    umidade_percent: Optional[float] = None
    impurezas_percent: Optional[float] = None
    armazem_destino_id: Optional[str] = None
    peso_recebido_final_kg: Optional[float] = None
    peso_liquido_kg: Optional[float] = None
    peso_com_desconto_fazenda: Optional[float] = None
    peso_com_desconto_armazem: Optional[float] = None
    
    # Configs (Agora enviadas pelo front)
    umidade_padrao: Optional[float] = 14.0
    fator_umidade: Optional[float] = 1.5
    impurezas_padrao: Optional[float] = 1.0

    # Campos de Comparação Empresa
    umidade_empresa_percent: Optional[float] = None
    impurezas_empresa_percent: Optional[float] = None
    peso_com_desconto_empresa: Optional[float] = None

    # Campos NFe Opcionais (mas obrigatórios se type=venda/remessa)
    natureza_operacao: Optional[str] = None
    cfop: Optional[str] = None
    ncm: Optional[str] = None
    valor_unitario: Optional[str] = None
    
    # Emitente
    cnpj_emitente: Optional[str] = None
    nome_emitente: Optional[str] = None
    logradouro_emitente: Optional[str] = None
    numero_emitente: Optional[str] = None
    bairro_emitente: Optional[str] = None
    municipio_emitente: Optional[str] = None
    uf_emitente: Optional[str] = None
    cep_emitente: Optional[str] = None
    inscricao_estadual_emitente: Optional[str] = None

    # Destinatário
    cnpj_destinatario: Optional[str] = None
    nome_destinatario: Optional[str] = None
    logradouro_destinatario: Optional[str] = None
    numero_destinatario: Optional[str] = None
    bairro_destinatario: Optional[str] = None
    municipio_destinatario: Optional[str] = None
    uf_destinatario: Optional[str] = None
    cep_destinatario: Optional[str] = None
    indicador_inscricao_estadual_destinatario: Optional[str] = None
    inscricao_estadual_destinatario: Optional[str] = None

    # Transportador
    nome_transportador: Optional[str] = None
    cnpj_transportador: Optional[str] = None
    placa_veiculo: Optional[str] = None
    uf_veiculo: Optional[str] = None


class CarregamentoRead(CarregamentoBase):
    """Schema para resposta da API"""
    # Campos Hidratados (Destination)
    cnpj_destinatario: Optional[str] = None
    nome_destinatario: Optional[str] = None
    logradouro_destinatario: Optional[str] = None
    numero_destinatario: Optional[str] = None
    bairro_destinatario: Optional[str] = None
    municipio_destinatario: Optional[str] = None
    uf_destinatario: Optional[str] = None
    cep_destinatario: Optional[str] = None
    inscricao_estadual_destinatario: Optional[str] = None
    indicador_inscricao_estadual_destinatario: Optional[str] = None

    # Campos Hidratados (Transport/Emitter if needed)
    nome_transportador: Optional[str] = None
    cnpj_transportador: Optional[str] = None
    placa_veiculo: Optional[str] = None
    uf_veiculo: Optional[str] = None



class CarregamentoCreate(BaseModel):
    """Schema interno para criação no banco"""
    truck: str
    driver: str
    driver_document: Optional[str] = None
    farm: str
    field: str
    product: str
    variety: Optional[str] = None
    quantity: float
    unit: str
    destination: str
    type: str
    scheduled_at: datetime
    nfe_status: Optional[str] = 'pendente'
    
    # Novos campos
    peso_estimado_kg: Optional[float] = None
    peso_bruto_kg: Optional[float] = None
    tara_kg: Optional[float] = None
    peso_liquido_kg: Optional[float] = None
    umidade_percent: Optional[float] = None
    impurezas_percent: Optional[float] = None
    peso_com_desconto_fazenda: Optional[float] = None
    peso_com_desconto_armazem: Optional[float] = None
    peso_recebido_final_kg: Optional[float] = None
    armazem_destino_id: Optional[Union[UUID, str]] = None
    
    # Configs
    umidade_padrao: Optional[float] = 14.0
    fator_umidade: Optional[float] = 1.5
    impurezas_padrao: Optional[float] = 1.0

    umidade_empresa_percent: Optional[float] = None
    impurezas_empresa_percent: Optional[float] = None
    peso_com_desconto_empresa: Optional[float] = None


