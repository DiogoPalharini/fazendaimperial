import { useMemo, useState } from 'react'
import { Plus, Search, Filter, FileText, AlertTriangle, Calendar, DollarSign } from 'lucide-react'
import NotafiscalDetailsModal from './components/NotafiscalDetailsModal'
import AddNotafiscalModal from './components/AddNotafiscalModal'
import type { Invoice, InvoiceType, InvoiceStatus } from './types'
import { INITIAL_INVOICES, INVOICE_TYPES } from './constants'
import { formatCurrency, formatDate } from './utils'
import '../FeaturePage.css'
import './Notafiscal.css'

export default function Notafiscal() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<InvoiceType | 'Todas'>('Todas')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'Todos'>('Todos')
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [addInvoiceModalOpen, setAddInvoiceModalOpen] = useState(false)

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const searchTerm = search.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        invoice.numero.toLowerCase().includes(searchTerm) ||
        invoice.cliente?.toLowerCase().includes(searchTerm) ||
        invoice.fornecedor?.toLowerCase().includes(searchTerm) ||
        invoice.tipo.toLowerCase().includes(searchTerm)

      const matchesType = typeFilter === 'Todas' || invoice.tipo === typeFilter
      const matchesStatus = statusFilter === 'Todos' || invoice.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [invoices, search, typeFilter, statusFilter])

  const summary = useMemo(() => {
    const totalNotas = invoices.length
    const pendentes = invoices.filter((invoice) => invoice.status === 'Pendente').length
    const valorTotal = invoices.filter((invoice) => invoice.status !== 'Cancelada').reduce((acc, invoice) => acc + invoice.valorTotal, 0)

    return { totalNotas, pendentes, valorTotal }
  }, [invoices])

  const handleSaveInvoice = (invoiceData: Omit<Invoice, 'id' | 'numero' | 'status'>) => {
    const numero = `NF-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      numero,
      status: 'Pendente',
      ...invoiceData,
    }
    setInvoices((prev) => [newInvoice, ...prev])
    setAddInvoiceModalOpen(false)
  }

  return (
    <div className="inputs-page">
      <header className="inputs-header">
        <div>
          <h2>Notafiscal</h2>
          <p>Gerencie notafiscais de diferentes tipos: carregamentos, compras, vendas e serviços agrícolas.</p>
        </div>
      </header>

      <section className="inputs-summary">
        <article className="summary-card">
          <FileText size={24} />
          <div>
            <span>Total de notafiscais</span>
            <strong>{summary.totalNotas}</strong>
          </div>
        </article>
        <article className="summary-card">
          <DollarSign size={24} />
          <div>
            <span>Valor total</span>
            <strong>{formatCurrency(summary.valorTotal)}</strong>
          </div>
        </article>
        <article className="summary-card warning">
          <AlertTriangle size={24} />
          <div>
            <span>Pendentes</span>
            <strong>{summary.pendentes}</strong>
          </div>
        </article>
      </section>

      <section className="inputs-toolbar">
        <div className="search-group">
          <Search size={18} />
          <input
            type="search"
            placeholder="Buscar por número, cliente, fornecedor ou tipo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="select-group">
            <Filter size={16} />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as InvoiceType | 'Todas')}
            >
              <option value="Todas">Todos os tipos</option>
              {INVOICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <Filter size={16} />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as InvoiceStatus | 'Todos')}>
              <option value="Todos">Todos os status</option>
              <option value="Pendente">Pendente</option>
              <option value="Emitida">Emitida</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </section>

      <div className="inputs-table-header">
        <button type="button" className="primary-button" onClick={() => setAddInvoiceModalOpen(true)}>
          <Plus size={18} /> Adicionar Notafiscal
        </button>
      </div>

      <section className="inputs-table-wrapper">
        <table className="inputs-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Cliente/Fornecedor</th>
              <th>Data de Emissão</th>
              <th>Valor Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="input-row"
                onClick={() => setSelectedInvoice(invoice)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedInvoice(invoice)
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <td>
                  <div className="item-name">
                    <strong>{invoice.numero}</strong>
                  </div>
                </td>
                <td>{invoice.tipo}</td>
                <td>{invoice.cliente || invoice.fornecedor || '-'}</td>
                <td>{formatDate(invoice.dataEmissao)}</td>
                <td>{formatCurrency(invoice.valorTotal)}</td>
                <td>
                  <span className={`stock-chip status-${invoice.status.toLowerCase()}`}>{invoice.status}</span>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  Nenhuma notafiscal corresponde aos filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {addInvoiceModalOpen && (
        <AddNotafiscalModal
          onClose={() => setAddInvoiceModalOpen(false)}
          onSave={handleSaveInvoice}
        />
      )}

      {selectedInvoice && (
        <NotafiscalDetailsModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  )
}

