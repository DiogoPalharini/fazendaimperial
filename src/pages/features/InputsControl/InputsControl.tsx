import { useMemo, useState } from 'react'
import { Plus, Search, Filter, PackageSearch, AlertTriangle, Calendar, ClipboardList } from 'lucide-react'
import InputDetailsModal from './components/InputDetailsModal'
import AddInputModal from './components/AddInputModal'
import type { InputItem, MovementEntry, StockStatus, InputCategory } from './types'
import { INITIAL_INPUTS, INITIAL_MOVEMENTS } from './constants'
import '../FeaturePage.css'
import './InputsControl.css'

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR')

const getStatus = (item: InputItem): StockStatus => {
  if (item.estoqueAtual <= item.estoqueMinimo) {
    return 'Estoque baixo'
  }

  return 'Em dia'
}

export default function InputsControl() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<InputCategory | 'Todas'>('Todas')
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'Todos'>('Todos')
  const [items, setItems] = useState<InputItem[]>(INITIAL_INPUTS)
  const [movements, setMovements] = useState<MovementEntry[]>(INITIAL_MOVEMENTS)
  const [selectedItem, setSelectedItem] = useState<InputItem | null>(null)
  const [addInputModalOpen, setAddInputModalOpen] = useState(false)

  const augmentedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      status: getStatus(item),
    }))
  }, [items])

  const filteredItems = useMemo(() => {
    return augmentedItems.filter((item) => {
      const searchTerm = search.toLowerCase()
      const matchesSearch = !searchTerm || item.nome.toLowerCase().includes(searchTerm)

      const matchesCategory = categoryFilter === 'Todas' || item.categoria === categoryFilter
      const matchesStatus = statusFilter === 'Todos' || item.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [augmentedItems, search, categoryFilter, statusFilter])

  const summary = useMemo(() => {
    const totalItens = items.length
    const estoqueBaixo = augmentedItems.filter((item) => item.status === 'Estoque baixo').length
    const quantidadeTotal = items.reduce((acc, item) => acc + item.estoqueAtual, 0)

    return { totalItens, estoqueBaixo, quantidadeTotal }
  }, [items, augmentedItems])

  const handleSaveInput = (inputData: Omit<InputItem, 'id'>) => {
    const newInput: InputItem = {
      id: `ins-${Date.now()}`,
      ...inputData,
    }
    setItems((prev) => [newInput, ...prev])
    setAddInputModalOpen(false)
  }

  const handleSaveMovement = (movementData: Omit<MovementEntry, 'id' | 'itemNome' | 'unidade'>) => {
    if (!selectedItem) return

    const quantityNumber = movementData.quantidade

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== selectedItem.id) {
          return item
        }

        const newStock =
          movementData.tipo === 'Entrada'
            ? item.estoqueAtual + quantityNumber
            : Math.max(0, item.estoqueAtual - quantityNumber)

        return {
          ...item,
          estoqueAtual: newStock,
        }
      })
    )

    const newMovement: MovementEntry = {
      id: `mov-${Date.now()}`,
      ...movementData,
      itemNome: selectedItem.nome,
      unidade: selectedItem.unidade,
    }

    setMovements((prev) => [newMovement, ...prev])
  }

  return (
    <div className="inputs-page">
      <header className="inputs-header">
        <div>
          <h2>Controle de Insumos</h2>
          <p>Acompanhe entradas e saídas, monitorando estoque mínimo, validade e custo médio por insumo.</p>
        </div>
      </header>

      <section className="inputs-summary">
        <article className="summary-card">
          <PackageSearch size={24} />
          <div>
            <span>Total de insumos</span>
            <strong>{summary.totalItens}</strong>
          </div>
        </article>
        <article className="summary-card">
          <ClipboardList size={24} />
          <div>
            <span>Quantidade total em estoque</span>
            <strong>{summary.quantidadeTotal.toLocaleString('pt-BR')}</strong>
          </div>
        </article>
        <article className="summary-card warning">
          <AlertTriangle size={24} />
          <div>
            <span>Estoque crítico</span>
            <strong>{summary.estoqueBaixo}</strong>
          </div>
        </article>
      </section>

      <section className="inputs-toolbar">
        <div className="search-group">
          <Search size={18} />
          <input
            type="search"
            placeholder="Buscar por insumo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="select-group">
            <Filter size={16} />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as InputCategory | 'Todas')}
            >
              <option value="Todas">Todas as categorias</option>
              {['Fertilizantes', 'Defensivos', 'Sementes', 'Nutrição foliar'].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <Filter size={16} />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StockStatus | 'Todos')}>
              <option value="Todos">Todos os status</option>
              <option value="Em dia">Em dia</option>
              <option value="Estoque baixo">Estoque baixo</option>
            </select>
          </div>
        </div>
      </section>

      <div className="inputs-table-header">
        <button type="button" className="primary-button" onClick={() => setAddInputModalOpen(true)}>
          <Plus size={18} /> Adicionar Insumo
        </button>
      </div>

      <section className="inputs-table-wrapper">
        <table className="inputs-table">
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Categoria</th>
              <th>Estoque atual</th>
              <th>Estoque mínimo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className="input-row"
                onClick={() => setSelectedItem(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedItem(item)
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <td>
                  <div className="item-name">
                    <strong>{item.nome}</strong>
                    <span>{item.unidade}</span>
                  </div>
                </td>
                <td>{item.categoria}</td>
                <td>{item.estoqueAtual.toLocaleString('pt-BR')} {item.unidade}</td>
                <td>{item.estoqueMinimo.toLocaleString('pt-BR')} {item.unidade}</td>
                <td>
                  <span className={`stock-chip status-${item.status.replace(' ', '-').toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">Nenhum insumo corresponde aos filtros selecionados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {addInputModalOpen && (
        <AddInputModal
          onClose={() => setAddInputModalOpen(false)}
          onSave={handleSaveInput}
        />
      )}

      {selectedItem && (
        <InputDetailsModal
          item={selectedItem}
          movements={movements}
          onClose={() => setSelectedItem(null)}
          onSaveMovement={handleSaveMovement}
        />
      )}
    </div>
  )
}

