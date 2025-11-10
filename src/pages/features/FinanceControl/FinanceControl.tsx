import { useMemo, useState } from 'react'
import { Plus, Search, Filter, TrendingUp, TrendingDown, Wallet, AlertTriangle, DollarSign } from 'lucide-react'
import AddFinanceEntryModal from './components/AddFinanceEntryModal'
import FinanceEntryDetailsModal from './components/FinanceEntryDetailsModal'
import type { FinanceEntry, EntryType, PaymentStatus, CostCenter } from './types'
import { INITIAL_ENTRIES, ENTRY_TYPES, COST_CENTERS, PAYMENT_STATUSES } from './constants'
import { formatCurrency, formatDate } from './utils'
import '../FeaturePage.css'
import './FinanceControl.css'

export default function FinanceControl() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<EntryType | 'Todos'>('Todos')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'Todos'>('Todos')
  const [costCenterFilter, setCostCenterFilter] = useState<CostCenter | 'Todos'>('Todos')
  const [entries, setEntries] = useState<FinanceEntry[]>(INITIAL_ENTRIES)
  const [selectedEntry, setSelectedEntry] = useState<FinanceEntry | null>(null)
  const [addEntryModalOpen, setAddEntryModalOpen] = useState(false)

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const searchTerm = search.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        entry.descricao.toLowerCase().includes(searchTerm) ||
        entry.documento?.toLowerCase().includes(searchTerm) ||
        entry.centroCusto.toLowerCase().includes(searchTerm)

      const matchesType = typeFilter === 'Todos' || entry.tipo === typeFilter
      const matchesStatus = statusFilter === 'Todos' || entry.status === statusFilter
      const matchesCostCenter = costCenterFilter === 'Todos' || entry.centroCusto === costCenterFilter

      return matchesSearch && matchesType && matchesStatus && matchesCostCenter
    })
  }, [entries, search, typeFilter, statusFilter, costCenterFilter])

  const summary = useMemo(() => {
    const totalEntradas = entries
      .filter((entry) => entry.tipo === 'Entrada' && entry.status !== 'Pendente')
      .reduce((acc, entry) => acc + entry.valor, 0)

    const totalSaidas = entries
      .filter((entry) => entry.tipo === 'Saída' && entry.status !== 'Pendente')
      .reduce((acc, entry) => acc + entry.valor, 0)

    const saldoAtual = totalEntradas - totalSaidas

    const pendenteReceber = entries
      .filter((entry) => entry.tipo === 'Entrada' && entry.status === 'Pendente')
      .reduce((acc, entry) => acc + entry.valor, 0)

    const pendentePagar = entries
      .filter((entry) => entry.tipo === 'Saída' && entry.status === 'Pendente')
      .reduce((acc, entry) => acc + entry.valor, 0)

    return {
      totalEntradas,
      totalSaidas,
      saldoAtual,
      pendenteReceber,
      pendentePagar,
    }
  }, [entries])

  const handleSaveEntry = (entryData: Omit<FinanceEntry, 'id'>) => {
    const newEntry: FinanceEntry = {
      id: `fin-${Date.now()}`,
      ...entryData,
    }
    setEntries((prev) => [newEntry, ...prev])
    setAddEntryModalOpen(false)
  }

  const handleEditEntry = (updatedEntry: FinanceEntry) => {
    setEntries((prev) => prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))
    setSelectedEntry(null)
  }

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
    setSelectedEntry(null)
  }

  return (
    <div className="inputs-page">
      <header className="inputs-header">
        <div>
          <h2>Controle Financeiro</h2>
          <p>Gerencie entradas, saídas e acompanhe o fluxo de caixa da fazenda.</p>
        </div>
      </header>

      <section className="inputs-summary">
        <article className="summary-card">
          <TrendingUp size={24} />
          <div>
            <span>Total de entradas</span>
            <strong>{formatCurrency(summary.totalEntradas)}</strong>
          </div>
        </article>
        <article className="summary-card warning">
          <TrendingDown size={24} />
          <div>
            <span>Total de saídas</span>
            <strong>{formatCurrency(summary.totalSaidas)}</strong>
          </div>
        </article>
        <article className="summary-card">
          <Wallet size={24} />
          <div>
            <span>Saldo atual</span>
            <strong className={summary.saldoAtual >= 0 ? 'positive' : 'negative'}>
              {formatCurrency(summary.saldoAtual)}
            </strong>
          </div>
        </article>
        <article className="summary-card warning">
          <AlertTriangle size={24} />
          <div>
            <span>Pendências</span>
            <strong>
              {formatCurrency(summary.pendenteReceber - summary.pendentePagar)}
            </strong>
          </div>
        </article>
      </section>

      <section className="inputs-toolbar">
        <div className="search-group">
          <Search size={18} />
          <input
            type="search"
            placeholder="Buscar por descrição, documento ou centro de custo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="select-group">
            <Filter size={16} />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as EntryType | 'Todos')}
            >
              <option value="Todos">Todos os tipos</option>
              {ENTRY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as PaymentStatus | 'Todos')}
            >
              <option value="Todos">Todos os status</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <Filter size={16} />
            <select
              value={costCenterFilter}
              onChange={(event) => setCostCenterFilter(event.target.value as CostCenter | 'Todos')}
            >
              <option value="Todos">Todos os centros</option>
              {COST_CENTERS.map((center) => (
                <option key={center} value={center}>
                  {center}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="inputs-table-header">
        <button type="button" className="primary-button" onClick={() => setAddEntryModalOpen(true)}>
          <Plus size={18} /> Adicionar Lançamento
        </button>
      </div>

      <section className="inputs-table-wrapper">
        <table className="inputs-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Centro de Custo</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Documento</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => (
              <tr
                key={entry.id}
                className="input-row"
                onClick={() => setSelectedEntry(entry)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedEntry(entry)
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <td>
                  <div className="item-name">
                    <strong>{entry.descricao}</strong>
                  </div>
                </td>
                <td>
                  <span className={`stock-chip entry-${entry.tipo === 'Entrada' ? 'entrada' : 'saida'}`}>
                    {entry.tipo}
                  </span>
                </td>
                <td>{entry.centroCusto}</td>
                <td>{formatDate(entry.data)}</td>
                <td>
                  <strong className={entry.tipo === 'Entrada' ? 'positive-value' : 'negative-value'}>
                    {entry.tipo === 'Entrada' ? '+' : '-'} {formatCurrency(entry.valor)}
                  </strong>
                </td>
                <td>
                  <span className={`stock-chip status-${entry.status.toLowerCase()}`}>{entry.status}</span>
                </td>
                <td>{entry.documento || '—'}</td>
              </tr>
            ))}
            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">
                  Nenhum lançamento corresponde aos filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {addEntryModalOpen && (
        <AddFinanceEntryModal
          onClose={() => setAddEntryModalOpen(false)}
          onSave={handleSaveEntry}
        />
      )}

      {selectedEntry && (
        <FinanceEntryDetailsModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      )}
    </div>
  )
}

