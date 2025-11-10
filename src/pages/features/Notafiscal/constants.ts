import type { Invoice, InvoiceType, InvoiceStatus } from './types'

export const INVOICE_TYPES: InvoiceType[] = [
  'Carregamento',
  'Compra de Insumos',
  'Serviços Agrícolas',
  'Venda de Gado',
  'Compra de Sementes',
  'Venda de Grãos',
  'Prestação de Serviços',
  'Compra de Máquinas',
  'Venda de Sementes',
]

export const INVOICE_STATUSES: InvoiceStatus[] = ['Pendente', 'Emitida', 'Cancelada']

export const CLIENTES = [
  'Cooperativa Agrícola Sul',
  'Agropecuária Central',
  'Distribuidora de Grãos LTDA',
  'Frigorífico Regional',
  'Exportadora Brasil',
  'Mercado Atacadista',
]

export const FORNECEDORES = [
  'Nutrimax Agro',
  'Protecta Brasil',
  'Sementes Aurora',
  'GreenLeaf',
  'AgroTech Solutions',
  'Fertilizantes Nacional',
  'Maquinário Agrícola SP',
]

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    numero: 'NF-2025-001',
    tipo: 'Carregamento',
    status: 'Emitida',
    dataEmissao: '2025-01-15T10:30',
    cliente: 'Cooperativa Agrícola Sul',
    valorTotal: 125000.0,
    carregamentoId: 'car-001',
    produtos: [
      {
        id: 'prod-1',
        descricao: 'Soja em Grãos',
        quantidade: 500,
        unidade: 'sc',
        valorUnitario: 250.0,
        valorTotal: 125000.0,
      },
    ],
  },
  {
    id: 'inv-2',
    numero: 'NF-2025-002',
    tipo: 'Compra de Insumos',
    status: 'Emitida',
    dataEmissao: '2025-01-14T14:20',
    fornecedor: 'Nutrimax Agro',
    valorTotal: 9800.0,
    produtos: [
      {
        id: 'prod-2',
        descricao: 'Ureia 45%',
        quantidade: 3500,
        unidade: 'kg',
        valorUnitario: 2.8,
        valorTotal: 9800.0,
      },
    ],
  },
  {
    id: 'inv-3',
    numero: 'NF-2025-003',
    tipo: 'Serviços Agrícolas',
    status: 'Pendente',
    dataEmissao: '2025-01-16T08:00',
    cliente: 'Agropecuária Central',
    valorTotal: 15000.0,
    servico: 'Aplicação de Defensivos',
    observacoes: 'Serviço realizado no talhão 07',
  },
]

