import { useMemo, useState, ChangeEvent, FormEvent } from 'react'
import {
  Plus,
  Search,
  Filter,
  PackageSearch,
  AlertTriangle,
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  ClipboardList,
} from 'lucide-react'
import './FeaturePage.css'
import './InputsControl.css'

type InputCategory = 'Fertilizantes' | 'Defensivos' | 'Sementes' | 'Nutrição foliar'
type StockStatus = 'Em dia' | 'Estoque baixo' | 'Vencendo' | 'Vencido'
type MovementType = 'Entrada' | 'Saída'

type InputItem = {
  id: string
  nome: string
  categoria: InputCategory
  estoqueAtual: number
  unidade: string
  custoMedio: number
  validade: string
  estoqueMinimo: number
  fornecedor: string
}

type MovementEntry = {
  id: string
  tipo: MovementType
  itemId: string
  itemNome: string
  quantidade: number
  unidade: string
  data: string
  responsavel: string
  observacao?: string
}

const INPUT_CATEGORIES: InputCategory[] = ['Fertilizantes', 'Defensivos', 'Sementes', 'Nutrição foliar']
const MOVEMENT_TYPES: MovementType[] = ['Entrada', 'Saída']
const RESPONSAVEIS = ['Lucas Andrade', 'Paula Souza', 'Fernanda Lima', 'Equipe Estoque']

const INITIAL_INPUTS: InputItem[] = [
  {
    id: 'ins-1',
    nome: 'Ureia 45%',
    categoria: 'Fertilizantes',
    estoqueAtual: 12500,
    unidade: 'kg',
    custoMedio: 2.8,
    validade: '2026-03-10',
    estoqueMinimo: 8000,
    fornecedor: 'Nutrimax Agro',
  },
  {
    id: 'ins-2',
    nome: 'Glifosato 480 SL',
    categoria: 'Defensivos',
    estoqueAtual: 750,
    unidade: 'L',
    custoMedio: 38,
    validade: '2025-12-22',
    estoqueMinimo: 1000,
    fornecedor: 'Protecta Brasil',
  },
  {
    id: 'ins-3',
    nome: 'Sementes de Soja - IPRO',
    categoria: 'Sementes',
    estoqueAtual: 320,
    unidade: 'sc',
    custoMedio: 185,
    validade: '2025-10-05',
    estoqueMinimo: 250,
    fornecedor: 'Sementes Aurora',
  },
  {
    id: 'ins-4',
    nome: 'Zinco Foliar 12%',
    categoria: 'Nutrição foliar',
    estoqueAtual: 480,
    unidade: 'L',
    custoMedio: 22,
    validade: '2025-09-25',
    estoqueMinimo: 400,
    fornecedor: 'GreenLeaf',
  },
  {
    id: 'ins-5',
    nome: 'Fungicida Triazol',
    categoria: 'Defensivos',
    estoqueAtual: 410,
    unidade: 'L',
    custoMedio: 54,
    validade: '2025-08-18',
    estoqueMinimo: 450,
    fornecedor: 'Protecta Brasil',
  },
]

const INITIAL_MOVEMENTS: MovementEntry[] = [
  {
    id: 'mov-1',
    tipo: 'Saída',
    itemId: 'ins-2',
    itemNome: 'Glifosato 480 SL',
    quantidade: 120,
    unidade: 'L',
    data: '2025-08-16T09:30',
    responsavel: 'Paula Souza',
    observacao: 'Aplicação no talhão 07 - cenário pós-plantio',
  },
  {
    id: 'mov-2',
    tipo: 'Entrada',
    itemId: 'ins-1',
    itemNome: 'Ureia 45%',
    quantidade: 3500,
    unidade: 'kg',
    data: '2025-08-14T15:20',
    responsavel: 'Lucas Andrade',
    observacao: 'Compra programada do fornecedor Nutrimax',
  },
  {
    id: 'mov-3',
    tipo: 'Saída',
    itemId: 'ins-4',
    itemNome: 'Zinco Foliar 12%',
    quantidade: 90,
    unidade: 'L',
    data: '2025-08-13T07:50',
    responsavel: 'Equipe Estoque',
  },
]

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const formatDateTime = (value: string) => new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR')

const getStatus = (item: InputItem): StockStatus => {
  const today = new Date()
  const expiry = new Date(item.validade)
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return 'Vencido'
  }

  if (diffDays <= 15) {
    return 'Vencendo'
  }

  if (item.estoqueAtual <= item.estoqueMinimo) {
    return 'Estoque baixo'
  }

  return 'Em dia'
}

type MovementForm = {
  tipo: MovementType
  itemId: string
  quantidade: string
  data: string
  responsavel: string
  observacao: string
}

const emptyMovementForm: MovementForm = {
  tipo: 'Entrada',
  itemId: '',
  quantidade: '',
  data: '',
  responsavel: '',
  observacao: '',
}

export default function InputsControl() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<InputCategory | 'Todas'>('Todas')
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'Todos'>('Todos')
  const [items, setItems] = useState<InputItem[]>(INITIAL_INPUTS)
  const [movements, setMovements] = useState<MovementEntry[]>(INITIAL_MOVEMENTS)
  const [modalOpen, setModalOpen] = useState(false)
  const [formState, setFormState] = useState<MovementForm>(emptyMovementForm)

  const augmentedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      status: getStatus(item),
      valorTotal: item.estoqueAtual * item.custoMedio,
      diasParaVencer: Math.ceil((new Date(item.validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    }))
  }, [items])

  const filteredItems = useMemo(() => {
    return augmentedItems.filter((item) => {
      const searchTerm = search.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        item.nome.toLowerCase().includes(searchTerm) ||
        item.fornecedor.toLowerCase().includes(searchTerm)

      const matchesCategory = categoryFilter === 'Todas' || item.categoria === categoryFilter
      const matchesStatus = statusFilter === 'Todos' || item.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [augmentedItems, search, categoryFilter, statusFilter])

  const summary = useMemo(() => {
    const totalItens = items.length
    const valorEstoque = items.reduce((acc, item) => acc + item.estoqueAtual * item.custoMedio, 0)
    const estoqueBaixo = augmentedItems.filter((item) => item.status === 'Estoque baixo').length
    const vencendo = augmentedItems.filter((item) => item.status === 'Vencendo' || item.status === 'Vencido').length

    return { totalItens, valorEstoque, estoqueBaixo, vencendo }
  }, [items, augmentedItems])

  const openMovementModal = () => {
    setFormState(emptyMovementForm)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setFormState(emptyMovementForm)
  }

  const handleFormChange = (field: keyof MovementForm) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.itemId || !formState.quantidade || !formState.data || !formState.responsavel) {
      return
    }

    const selectedItem = items.find((item) => item.id === formState.itemId)
    if (!selectedItem) {
      return
    }

    const quantityNumber = Number(formState.quantidade)
    if (Number.isNaN(quantityNumber) || quantityNumber <= 0) {
      return
    }

    setItems((prev) => prev.map((item) => {
      if (item.id !== selectedItem.id) {
        return item
      }

      const newStock = formState.tipo === 'Entrada'
        ? item.estoqueAtual + quantityNumber
        : Math.max(0, item.estoqueAtual - quantityNumber)

      return {
        ...item,
        estoqueAtual: newStock,
      }
    }))

    const unit = selectedItem.unidade

    const newMovement: MovementEntry = {
      id: `mov-${Date.now()}`,
      tipo: formState.tipo,
      itemId: selectedItem.id,
      itemNome: selectedItem.nome,
      quantidade: quantityNumber,
      unidade: unit,
      data: formState.data,
      responsavel: formState.responsavel,
      observacao: formState.observacao.trim() || undefined,
    }

    setMovements((prev) => [newMovement, ...prev])

    closeModal()
  }

  return (
    <div className="inputs-page">
      <header className="inputs-header">
        <div>
          <h2>Controle de Insumos</h2>
          <p>Acompanhe entradas e saídas, monitorando estoque mínimo, validade e custo médio por insumo.</p>
        </div>
        <button type="button" className="primary-button" onClick={openMovementModal}>
          <Plus size={18} /> Nova movimentação
        </button>
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
            <span>Valor em estoque</span>
            <strong>{formatCurrency(summary.valorEstoque)}</strong>
          </div>
        </article>
        <article className="summary-card warning">
          <AlertTriangle size={24} />
          <div>
            <span>Estoque crítico</span>
            <strong>{summary.estoqueBaixo}</strong>
          </div>
        </article>
        <article className="summary-card neutral">
          <Calendar size={24} />
          <div>
            <span>Vencendo / vencidos</span>
            <strong>{summary.vencendo}</strong>
          </div>
        </article>
      </section>

      <section className="inputs-toolbar">
        <div className="search-group">
          <Search size={18} />
          <input
            type="search"
            placeholder="Buscar por insumo ou fornecedor"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="select-group">
            <Filter size={16} />
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as InputCategory | 'Todas')}>
              <option value="Todas">Todas as categorias</option>
              {INPUT_CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <Filter size={16} />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StockStatus | 'Todos')}>
              <option value="Todos">Todos os status</option>
              <option value="Em dia">Em dia</option>
              <option value="Estoque baixo">Estoque baixo</option>
              <option value="Vencendo">Vencendo</option>
              <option value="Vencido">Vencido</option>
            </select>
          </div>
        </div>
      </section>

      <section className="inputs-table-wrapper">
        <table className="inputs-table">
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Categoria</th>
              <th>Fornecedor</th>
              <th>Estoque atual</th>
              <th>Estoque mínimo</th>
              <th>Validade</th>
              <th>Status</th>
              <th>Valor total</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="item-name">
                    <strong>{item.nome}</strong>
                    <span>{item.unidade} • {formatCurrency(item.custoMedio)} (custo médio)</span>
                  </div>
                </td>
                <td>{item.categoria}</td>
                <td>{item.fornecedor}</td>
                <td>{item.estoqueAtual.toLocaleString('pt-BR')} {item.unidade}</td>
                <td>{item.estoqueMinimo.toLocaleString('pt-BR')} {item.unidade}</td>
                <td>{formatDate(item.validade)}</td>
                <td>
                  <span className={`stock-chip status-${item.status.replace(' ', '-').toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>{formatCurrency(item.valorTotal)}</td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">Nenhum insumo corresponde aos filtros selecionados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="movements-log">
        <header>
          <h3>Movimentações recentes</h3>
          <span>{movements.length} registros</span>
        </header>
        <ul>
          {movements.map((movement) => (
            <li key={movement.id}>
              <div className={`movement-icon movement-${movement.tipo === 'Entrada' ? 'entrada' : 'saida'}`}>
                {movement.tipo === 'Entrada' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
              </div>
              <div className="movement-body">
                <div className="movement-header">
                  <strong>{movement.itemNome}</strong>
                  <span>{movement.tipo} • {movement.quantidade.toLocaleString('pt-BR')} {movement.unidade}</span>
                </div>
                <div className="movement-meta">
                  <time>{formatDateTime(movement.data)}</time>
                  <span>Responsável: {movement.responsavel}</span>
                </div>
                {movement.observacao && <p>{movement.observacao}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {modalOpen && (
        <div className="inputs-modal" role="dialog" aria-modal="true">
          <div className="inputs-modal__card">
            <header>
              <div>
                <h3>Registrar movimentação</h3>
                <p>Atualize o estoque com entradas ou saídas de insumos.</p>
              </div>
              <button type="button" className="close-btn" onClick={closeModal} aria-label="Fechar">
                ✕
              </button>
            </header>

            <form className="inputs-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>
                  Tipo de movimentação
                  <select value={formState.tipo} onChange={handleFormChange('tipo')} required>
                    {MOVEMENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Insumo
                  <select value={formState.itemId} onChange={handleFormChange('itemId')} required>
                    <option value="" disabled>Selecione um insumo</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>{item.nome}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Quantidade
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formState.quantidade}
                    onChange={handleFormChange('quantidade')}
                    required
                  />
                </label>
                <label>
                  Data/Hora
                  <input
                    type="datetime-local"
                    value={formState.data}
                    onChange={handleFormChange('data')}
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Responsável
                  <select value={formState.responsavel} onChange={handleFormChange('responsavel')} required>
                    <option value="" disabled>Selecione</option>
                    {RESPONSAVEIS.map((responsavel) => (
                      <option key={responsavel} value={responsavel}>{responsavel}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Observações
                  <textarea
                    placeholder="Detalhes adicionais, talhão, atividade..."
                    value={formState.observacao}
                    onChange={handleFormChange('observacao')}
                    rows={3}
                  />
                </label>
              </div>

              <footer>
                <button type="button" className="secondary-button" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="primary-button">Salvar movimentação</button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

