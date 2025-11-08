export type EntryType = 'Entrada' | 'Saída'
export type CostCenter = 'Cultivo' | 'Logística' | 'Manutenção' | 'Administração'
export type PaymentStatus = 'Pendente' | 'Pago' | 'Recebido'

export type FinanceEntry = {
  id: string
  tipo: EntryType
  descricao: string
  centroCusto: CostCenter
  data: string
  valor: number
  status: PaymentStatus
  documento?: string
  observacoes?: string
}

