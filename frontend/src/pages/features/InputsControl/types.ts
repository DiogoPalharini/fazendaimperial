export type InputCategory = 'Fertilizantes' | 'Defensivos' | 'Sementes' | 'Nutrição foliar'
export type StockStatus = 'Em dia' | 'Estoque baixo' | 'Vencendo' | 'Vencido'
export type MovementType = 'Entrada' | 'Saída'

export type InputItem = {
  id: string
  nome: string
  categoria: InputCategory
  estoqueAtual: number
  unidade: string
  estoqueMinimo: number
}

export type MovementEntry = {
  id: string
  tipo: MovementType
  itemId: string
  itemNome: string
  quantidade: number
  unidade: string
  data: string
  responsavel: string
  fornecedor?: string
  valorPago?: number
  parcelado?: boolean
  observacao?: string
}

