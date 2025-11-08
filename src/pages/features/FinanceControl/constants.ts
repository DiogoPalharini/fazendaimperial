import type { FinanceEntry, EntryType, CostCenter, PaymentStatus } from './types'

export const ENTRY_TYPES: EntryType[] = ['Entrada', 'Saída']
export const COST_CENTERS: CostCenter[] = ['Cultivo', 'Logística', 'Manutenção', 'Administração']
export const PAYMENT_STATUSES: PaymentStatus[] = ['Pendente', 'Pago', 'Recebido']

export const INITIAL_ENTRIES: FinanceEntry[] = [
  {
    id: 'fin-1',
    tipo: 'Entrada',
    descricao: 'Venda de soja - Cooperativa Alvorada',
    centroCusto: 'Cultivo',
    data: '2025-01-15',
    valor: 185000,
    status: 'Recebido',
    documento: 'NF-e 485920',
  },
  {
    id: 'fin-2',
    tipo: 'Saída',
    descricao: 'Compra de fertilizante - Safra verão',
    centroCusto: 'Cultivo',
    data: '2025-01-16',
    valor: 48000,
    status: 'Pendente',
    documento: 'NF-e 127639',
  },
  {
    id: 'fin-3',
    tipo: 'Saída',
    descricao: 'Manutenção caminhão Volvo FH',
    centroCusto: 'Manutenção',
    data: '2025-01-12',
    valor: 8700,
    status: 'Pago',
    documento: 'OS 00987',
  },
  {
    id: 'fin-4',
    tipo: 'Entrada',
    descricao: 'Prestação de serviço agrícola',
    centroCusto: 'Logística',
    data: '2025-01-10',
    valor: 23500,
    status: 'Recebido',
    documento: 'NF-e 485901',
  },
  {
    id: 'fin-5',
    tipo: 'Saída',
    descricao: 'Compra de defensivos agrícolas',
    centroCusto: 'Cultivo',
    data: '2025-01-18',
    valor: 32000,
    status: 'Pendente',
    documento: 'NF-e 128450',
  },
  {
    id: 'fin-6',
    tipo: 'Entrada',
    descricao: 'Venda de milho - Cliente NorteGrãos',
    centroCusto: 'Cultivo',
    data: '2025-01-20',
    valor: 64000,
    status: 'Recebido',
    documento: 'NF-e 486200',
  },
]

