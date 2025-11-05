import { useMemo, useState, ChangeEvent, FormEvent } from 'react'
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  FileText,
  Clock8,
} from 'lucide-react'
import './FeaturePage.css'
import './FinanceControl.css'

type EntryType = 'Entrada' | 'Saída'
type CostCenter = 'Cultivo' | 'Logística' | 'Manutenção' | 'Administração'
type PaymentStatus = 'Pendente' | 'Pago' | 'Recebido'

type FinanceEntry = {
  id: string
  tipo: EntryType
  descricao: string
  centroCusto: CostCenter
  data: string
  valor: number
  status: PaymentStatus
  documento?: string
}

type CashFlowProjection = {
  id: string
  data: string
  saldoProjetado: number
  entradas: number
  saidas: number
}

type PendingItem = {
  id: string
  tipo: 'Pagar' | 'Receber'
  descricao: string
  dataVencimento: string
  valor: number
  status: PaymentStatus
}

const ENTRY_TYPES: EntryType[] = ['Entrada', 'Saída']
const COST_CENTERS: CostCenter[] = ['Cultivo', 'Logística', 'Manutenção', 'Administração']
const PAYMENT_STATUSES: PaymentStatus[] = ['Pendente', 'Pago', 'Recebido']

const INITIAL_ENTRIES: FinanceEntry[] = [
  {
    id: 'fin-1',
    tipo: 'Entrada',
    descricao: 'Venda de soja - Cooperativa Alvorada',
    centroCusto: 'Cultivo',
    data: '2025-08-15',
    valor: 185000,
    status: 'Recebido',
    documento: 'NF-e 485920',
  },
  {
    id: 'fin-2',
    tipo: 'Saída',
    descricao: 'Compra de fertilizante - Safra verão',
    centroCusto: 'Cultivo',
    data: '2025-08-16',
    valor: 48000,
    status: 'Pendente',
    documento: 'NF-e 127639',
  },
  {
    id: 'fin-3',
    tipo: 'Saída',
    descricao: 'Manutenção caminhão Volvo FH',
    centroCusto: 'Manutenção',
    data: '2025-08-12',
    valor: 8700,
    status: 'Pago',
    documento: 'OS 00987',
  },
  {
    id: 'fin-4',
    tipo: 'Entrada',
    descricao: 'Prestação de serviço agrícola',
    centroCusto: 'Logística',
    data: '2025-08-10',
    valor: 23500,
    status: 'Recebido',
    documento: 'NF-e 485901',
  },
]

const INITIAL_PROJECTIONS: CashFlowProjection[] = [
  { id: 'proj-1', data: '2025-08-17', saldoProjetado: 285000, entradas: 65000, saidas: 32000 },
  { id: 'proj-2', data: '2025-08-18', saldoProjetado: 272000, entradas: 15000, saidas: 28000 },
  { id: 'proj-3', data: '2025-08-19', saldoProjetado: 298500, entradas: 48200, saidas: 21500 },
  { id: 'proj-4', data: '2025-08-20', saldoProjetado: 305800, entradas: 38000, saidas: 30100 },
]

const INITIAL_PENDINGS: PendingItem[] = [
  {
    id: 'pend-1',
    tipo: 'Pagar',
    descricao: 'Pagamento de defensivos - Protecta Brasil',
    dataVencimento: '2025-08-25',
    valor: 23000,
    status: 'Pendente',
  },
  {
    id: 'pend-2',
    tipo: 'Receber',
    descricao: 'Venda de milho - Cliente NorteGrãos',
    dataVencimento: '2025-08-21',
    valor: 64000,
    status: 'Pendente',
  },
  {
    id: 'pend-3',
    tipo: 'Pagar',
    descricao: 'Folha de pagamento - Agosto',
    dataVencimento: '2025-08-30',
    valor: 98000,
    status: 'Pendente',
  },
]

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR')

type FinanceForm = {
  tipo: EntryType
  descricao: string
  centroCusto: CostCenter
  data: string
  valor: string
  status: PaymentStatus
  documento: string
}

const emptyForm: FinanceForm = {
  tipo: 'Entrada',
  descricao: '',
  centroCusto: 'Cultivo',
  data: '',
  valor: '',
  status: 'Pendente',
  documento: '',
}

export default function FinanceControl() {
  const [entries, setEntries] = useState<FinanceEntry[]>(INITIAL_ENTRIES)
  const [projections] = useState<CashFlowProjection[]>(INITIAL_PROJECTIONS)
  const [pendings, setPendings] = useState<PendingItem[]>(INITIAL_PENDINGS)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<EntryType | 'Todos'>('Todos')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'Todos'>('Todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [formState, setFormState] = useState<FinanceForm>(emptyForm)

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const searchTerm = search.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        entry.descricao.toLowerCase().includes(searchTerm) ||
        entry.documento?.toLowerCase().includes(searchTerm)

      const matchesType = typeFilter === 'Todos' || entry.tipo === typeFilter
      const matchesStatus = statusFilter === 'Todos' || entry.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [entries, search, typeFilter, statusFilter])

  const summary = useMemo(() => {
    const totalEntradas = entries
      .filter((entry) => entry.tipo === 'Entrada')
      .reduce((acc, entry) => acc + entry.valor, 0)

    const totalSaidas = entries
      .filter((entry) => entry.tipo === 'Saída')
      .reduce((acc, entry) => acc + entry.valor, 0)

    const saldoAtual = totalEntradas - totalSaidas
    const pendenteReceber = pendings.filter((p) => p.tipo === 'Receber').reduce((acc, p) => acc + p.valor, 0)
    const pendentePagar = pendings.filter((p) => p.tipo === 'Pagar').reduce((acc, p) => acc + p.valor, 0)

    return {
      totalEntradas,
      totalSaidas,
      saldoAtual,
      pendenteReceber,
      pendentePagar,
    }
  }, [entries, pendings])

  const openModal = () => {
    setFormState(emptyForm)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setFormState(emptyForm)
  }

  const handleChange = (field: keyof FinanceForm) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.descricao || !formState.data || !formState.valor) {
      return
    }

    const valorNumber = Number(formState.valor)
    if (Number.isNaN(valorNumber) || valorNumber <= 0) {
      return
    }

    const newEntry: FinanceEntry = {
      id: `fin-${Date.now()}`,
      tipo: formState.tipo,
      descricao: formState.descricao,
      centroCusto: formState.centroCusto,
      data: formState.data,
      valor: valorNumber,
      status: formState.status,
      documento: formState.documento.trim() || undefined,
    }

    setEntries((prev) => [newEntry, ...prev])

    if (formState.status === 'Pendente') {
      const pendingItem: PendingItem = {
        id: `pend-${Date.now()}`,
        tipo: formState.tipo === 'Entrada' ? 'Receber' : 'Pagar',
        descricao: formState.descricao,
        dataVencimento: formState.data,
        valor: valorNumber,
        status: 'Pendente',
      }

      setPendings((prev) => [pendingItem, ...prev])
    }

    closeModal()
  }

  return (
    <div className="finance-page">
      <header className="finance-header">
        <div>
          <h2>Controle Financeiro</h2>
          <p>Visualize fluxo de caixa, pendências e registros financeiros consolidados em um único painel.</p>
        </div>
        <button type="button" className="primary-button" onClick={openModal}>
          <Plus size={18} /> Novo lançamento
        </button>
      </header>

      <section className="finance-summary">
        <article className="finance-card positive">
          <TrendingUp size={24} />
          <div>
            <span>Total de entradas</span>
            <strong>{formatCurrency(summary.totalEntradas)}</strong>
          </div>
        </article>
        <article className="finance-card negative">
          <TrendingDown size={24} />
          <div>
            <span>Total de saídas</span>
            <strong>{formatCurrency(summary.totalSaidas)}</strong>
          </div>
        </article>
        <article className="finance-card neutral">
          <Wallet size={24} />
          <div>
            <span>Saldo atual</span>
            <strong>{formatCurrency(summary.saldoAtual)}</strong>
          </div>
        </article>
        <article className="finance-card warning">
          <CreditCard size={24} />
          <div>
            <span>Pendências</span>
            <strong>{formatCurrency(summary.pendenteReceber - summary.pendentePagar)}</strong>
          </div>
        </article>
      </section>

      <section className="finance-toolbar">
        <div className="search-group">
          <Search size={18} />
          <input
            type="search"
            placeholder="Buscar por descrição ou documento"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="select-group">
            <Filter size={16} />
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as EntryType | 'Todos')}>
              <option value="Todos">Todos os tipos</option>
              {ENTRY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <Filter size={16} />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PaymentStatus | 'Todos')}>
              <option value="Todos">Todos os status</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="finance-panels">
        <div className="finance-table-wrapper">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Centro de custo</th>
                <th>Data</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Documento</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.descricao}</td>
                  <td>
                    <span className={`entry-chip entry-${entry.tipo === 'Entrada' ? 'entrada' : 'saida'}`}>
                      {entry.tipo}
                    </span>
                  </td>
                  <td>{entry.centroCusto}</td>
                  <td>{formatDate(entry.data)}</td>
                  <td>
                    <span className={`status-chip status-${entry.status.toLowerCase()}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td>{formatCurrency(entry.valor)}</td>
                  <td>{entry.documento || '—'}</td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty">Nenhum lançamento encontrado com os filtros selecionados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <aside className="finance-sidebar">
          <section className="projection-card">
            <header>
              <h3>Projeção diária</h3>
              <Clock8 size={18} />
            </header>
            <ul>
              {projections.map((projection) => (
                <li key={projection.id}>
                  <div>
                    <strong>{formatDate(projection.data)}</strong>
                    <span>Saldo projetado</span>
                  </div>
                  <div>
                    <span className="value">{formatCurrency(projection.saldoProjetado)}</span>
                    <small>Entradas {formatCurrency(projection.entradas)} • Saídas {formatCurrency(projection.saidas)}</small>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="pending-card">
            <header>
              <h3>Pendências</h3>
              <span>{pendings.length} registros</span>
            </header>
            <ul>
              {pendings.map((pending) => (
                <li key={pending.id}>
                  <div>
                    <strong>{pending.tipo === 'Pagar' ? 'A pagar' : 'A receber'}</strong>
                    <span>{pending.descricao}</span>
                  </div>
                  <div>
                    <span className="value">{formatCurrency(pending.valor)}</span>
                    <time>Vence em {formatDate(pending.dataVencimento)}</time>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </section>

      {modalOpen && (
        <div className="finance-modal" role="dialog" aria-modal="true">
          <div className="finance-modal__card">
            <header>
              <div>
                <h3>Novo lançamento financeiro</h3>
                <p>Preencha os dados para registrar uma entrada ou saída.</p>
              </div>
              <button type="button" className="close-btn" onClick={closeModal} aria-label="Fechar">
                ✕
              </button>
            </header>

            <form className="finance-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>
                  Tipo
                  <select value={formState.tipo} onChange={handleChange('tipo')} required>
                    {ENTRY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Centro de custo
                  <select value={formState.centroCusto} onChange={handleChange('centroCusto')} required>
                    {COST_CENTERS.map((center) => (
                      <option key={center} value={center}>{center}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Descrição
                  <input
                    type="text"
                    value={formState.descricao}
                    onChange={handleChange('descricao')}
                    placeholder="Ex: Venda de milho safra verão"
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Data
                  <input
                    type="date"
                    value={formState.data}
                    onChange={handleChange('data')}
                    required
                  />
                </label>
                <label>
                  Valor
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formState.valor}
                    onChange={handleChange('valor')}
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Status
                  <select value={formState.status} onChange={handleChange('status')} required>
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Documento (opcional)
                  <input
                    type="text"
                    value={formState.documento}
                    onChange={handleChange('documento')}
                    placeholder="NF-e, OS, recibo..."
                  />
                </label>
              </div>

              <footer>
                <button type="button" className="secondary-button" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="primary-button">Salvar lançamento</button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

