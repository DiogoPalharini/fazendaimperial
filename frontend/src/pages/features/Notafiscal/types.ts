export type InvoiceType =
  | 'Carregamento'
  | 'Compra de Insumos'
  | 'Serviços Agrícolas'
  | 'Venda de Gado'
  | 'Compra de Sementes'
  | 'Venda de Grãos'
  | 'Prestação de Serviços'
  | 'Compra de Máquinas'
  | 'Venda de Sementes'

export type InvoiceStatus = 'Pendente' | 'Emitida' | 'Cancelada'

export type Invoice = {
  id: string
  numero: string
  tipo: InvoiceType
  status: InvoiceStatus
  dataEmissao: string
  cliente?: string
  fornecedor?: string
  valorTotal: number
  // Campos específicos por tipo
  carregamentoId?: string
  produtos?: InvoiceProduct[]
  servico?: string
  observacoes?: string
}

export type InvoiceProduct = {
  id: string
  descricao: string
  quantidade: number
  unidade: string
  valorUnitario: number
  valorTotal: number
}

