import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  Gauge,
  Fuel,
  Wrench,
  ClipboardCheck,
  X,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react'
import './MachinesControl.css'

type MachineStatus = 'Disponível' | 'Em operação' | 'Em manutenção'
type MachineType = 'Trator' | 'Caminhão' | 'Caminhonete'

type Machine = {
  id: string
  nome: string
  tipo: MachineType
  identificacao: string
  status: MachineStatus
  horasTrabalhadas: number
  consumoMedio: number
  ultimaManutencao: string
  proximaManutencao: string
}

const MACHINE_TYPES: MachineType[] = ['Trator', 'Caminhão', 'Caminhonete']
const MACHINE_STATUSES: MachineStatus[] = ['Disponível', 'Em operação', 'Em manutenção']

const INITIAL_MACHINES: Machine[] = [
  {
    id: 'm-1',
    nome: 'Trator Massey 7725',
    tipo: 'Trator',
    identificacao: 'AAA1B23',
    status: 'Em operação',
    horasTrabalhadas: 2834,
    consumoMedio: 24.6,
    ultimaManutencao: '2025-07-16',
    proximaManutencao: '2025-09-15',
  },
  {
    id: 'm-2',
    nome: 'Caminhão Volvo FH',
    tipo: 'Caminhão',
    identificacao: 'BCX4D56',
    status: 'Disponível',
    horasTrabalhadas: 1920,
    consumoMedio: 32.1,
    ultimaManutencao: '2025-06-30',
    proximaManutencao: '2025-10-02',
  },
  {
    id: 'm-3',
    nome: 'Caminhonete Hilux 4x4',
    tipo: 'Caminhonete',
    identificacao: 'HIL-9281',
    status: 'Em manutenção',
    horasTrabalhadas: 1120,
    consumoMedio: 12.4,
    ultimaManutencao: '2025-08-01',
    proximaManutencao: '2025-08-28',
  },
  {
    id: 'm-4',
    nome: 'Trator John Deere 7R',
    tipo: 'Trator',
    identificacao: 'JDR-7710',
    status: 'Disponível',
    horasTrabalhadas: 3250,
    consumoMedio: 26.9,
    ultimaManutencao: '2025-07-02',
    proximaManutencao: '2025-08-31',
  },
]

type MaintenanceLog = {
  id: string
  machineId: string
  machineName: string
  tipo: 'Revisão' | 'Troca de óleo' | 'Substituição de peças'
  data: string
  observacao: string
}

const INITIAL_MAINTENANCE: MaintenanceLog[] = [
  {
    id: 'log-1',
    machineId: 'm-3',
    machineName: 'Caminhonete Hilux 4x4',
    tipo: 'Revisão',
    data: '2025-08-10',
    observacao: 'Revisão geral dos 1.000 km e alinhamento da suspensão',
  },
  {
    id: 'log-2',
    machineId: 'm-1',
    machineName: 'Trator Massey 7725',
    tipo: 'Troca de óleo',
    data: '2025-08-03',
    observacao: 'Troca de filtros e óleo hidráulico',
  },
  {
    id: 'log-3',
    machineId: 'm-2',
    machineName: 'Caminhão Volvo FH',
    tipo: 'Substituição de peças',
    data: '2025-07-22',
    observacao: 'Substituição de pastilhas de freio dianteiras',
  },
]

const formatHours = (value: number) => `${value.toLocaleString('pt-BR')} h`
const formatFuel = (value: number) => `${value.toFixed(1)} L/h`
const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR')

type MachineForm = {
  id?: string
  nome: string
  tipo: MachineType
  identificacao: string
  status: MachineStatus
  horasTrabalhadas: number
  consumoMedio: number
  ultimaManutencao: string
  proximaManutencao: string
}

const emptyForm: MachineForm = {
  nome: '',
  tipo: 'Trator',
  identificacao: '',
  status: 'Disponível',
  horasTrabalhadas: 0,
  consumoMedio: 0,
  ultimaManutencao: '',
  proximaManutencao: '',
}

export default function MachinesControl() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<MachineType | 'Todas'>('Todas')
  const [statusFilter, setStatusFilter] = useState<MachineStatus | 'Todos'>('Todos')
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES)
  const [maintenanceLog, setMaintenanceLog] = useState<MaintenanceLog[]>(INITIAL_MAINTENANCE)
  const [modalOpen, setModalOpen] = useState(false)
  const [formState, setFormState] = useState<MachineForm>(emptyForm)
  const [detailMachine, setDetailMachine] = useState<Machine | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Machine | null>(null)

  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const matchesSearch = machine.nome.toLowerCase().includes(search.toLowerCase())
        || machine.identificacao.toLowerCase().includes(search.toLowerCase())

      const matchesType = typeFilter === 'Todas' || machine.tipo === typeFilter
      const matchesStatus = statusFilter === 'Todos' || machine.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [machines, search, typeFilter, statusFilter])

  const summary = useMemo(() => {
    const total = machines.length
    const available = machines.filter((m) => m.status === 'Disponível').length
    const inOperation = machines.filter((m) => m.status === 'Em operação').length
    const inMaintenance = machines.filter((m) => m.status === 'Em manutenção').length
    const averageFuel = machines.reduce((acc, m) => acc + m.consumoMedio, 0) / Math.max(total, 1)

    return { total, available, inOperation, inMaintenance, averageFuel }
  }, [machines])

  const openCreateModal = () => {
    setFormState(emptyForm)
    setModalOpen(true)
  }

  const openEditModal = (machine: Machine) => {
    setFormState({ ...machine })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setFormState(emptyForm)
  }

  const openDetailModal = (machine: Machine) => {
    setDetailMachine(machine)
  }

  const closeDetailModal = () => {
    setDetailMachine(null)
  }

  const handleChange = (field: keyof MachineForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = event.target.value

    if (field === 'horasTrabalhadas' || field === 'consumoMedio') {
      setFormState((prev) => ({ ...prev, [field]: Number(value) }))
    } else {
      setFormState((prev) => ({ ...prev, [field]: value as any }))
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (formState.id) {
      setMachines((prev) => prev.map((machine) => (
        machine.id === formState.id ? { ...formState, id: machine.id } : machine
      )))
    } else {
      const newMachine: Machine = {
        id: `m-${Date.now()}`,
        ...formState,
      }
      setMachines((prev) => [newMachine, ...prev])
    }

    closeModal()
  }

  const scheduleMaintenance = (machine: Machine) => {
    const today = new Date()
    const next = new Date(today)
    next.setDate(today.getDate() + 30)

    setMachines((prev) => prev.map((m) => (
      m.id === machine.id
        ? {
            ...m,
            status: 'Em manutenção',
            ultimaManutencao: today.toISOString().slice(0, 10),
            proximaManutencao: next.toISOString().slice(0, 10),
          }
        : m
    )))

    setMaintenanceLog((prev) => [
      {
        id: `log-${Date.now()}`,
        machineId: machine.id,
        machineName: machine.nome,
        tipo: 'Revisão',
        data: today.toISOString().slice(0, 10),
        observacao: 'Manutenção programada diretamente pelo operador.',
      },
      ...prev,
    ])

    if (detailMachine?.id === machine.id) {
      setDetailMachine({
        ...machine,
        status: 'Em manutenção',
        ultimaManutencao: today.toISOString().slice(0, 10),
        proximaManutencao: next.toISOString().slice(0, 10),
      })
    }
  }

  const handleDelete = (machine: Machine) => {
    setMachines((prev) => prev.filter((m) => m.id !== machine.id))
    setMaintenanceLog((prev) => prev.filter((log) => log.machineId !== machine.id))
    setDeleteConfirm(null)
    if (detailMachine?.id === machine.id) {
      closeDetailModal()
    }
  }

  const getMaintenanceStatus = (date: string) => {
    const today = new Date()
    const maintenanceDate = new Date(date)
    const diffTime = maintenanceDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { status: 'overdue', days: Math.abs(diffDays), label: 'Atrasada' }
    if (diffDays <= 7) return { status: 'urgent', days: diffDays, label: 'Urgente' }
    if (diffDays <= 30) return { status: 'warning', days: diffDays, label: 'Próxima' }
    return { status: 'ok', days: diffDays, label: 'Agendada' }
  }

  return (
    <div className="machines-page">
      <header className="machines-header">
        <div>
          <h2>Controle de Máquinas</h2>
          <p>Cadastre, monitore e planeje manutenções da frota de tratores, caminhões e camionetes.</p>
        </div>
      </header>

      <section className="machines-summary">
        <article className="summary-card">
          <Gauge size={24} />
          <div>
            <span>Total de máquinas</span>
            <strong>{summary.total}</strong>
          </div>
        </article>
        <article className="summary-card">
          <ClipboardCheck size={24} />
          <div>
            <span>Disponíveis / Operação</span>
            <strong>{summary.available} / {summary.inOperation}</strong>
          </div>
        </article>
        <article className="summary-card warning">
          <Wrench size={24} />
          <div>
            <span>Em manutenção</span>
            <strong>{summary.inMaintenance}</strong>
          </div>
        </article>
        <article className="summary-card">
          <Fuel size={24} />
          <div>
            <span>Consumo médio</span>
            <strong>{formatFuel(summary.averageFuel || 0)}</strong>
          </div>
        </article>
      </section>

      <section className="machines-toolbar">
        <div className="search-group">
          <Search size={18} />
          <input
            type="search"
            placeholder="Buscar por nome ou identificação"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="select-group">
            <Filter size={16} />
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as MachineType | 'Todas')}>
              <option value="Todas">Todos os tipos</option>
              {MACHINE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <Filter size={16} />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as MachineStatus | 'Todos')}>
              <option value="Todos">Todos os status</option>
              {MACHINE_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="machines-table-header">
        <button className="primary-button" type="button" onClick={openCreateModal}>
          <Plus size={18} /> Nova máquina
        </button>
      </div>

      <section className="machines-table-wrapper">
        <table className="machines-table">
          <thead>
            <tr>
              <th>Máquina</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Próxima manutenção</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredMachines.map((machine) => {
              const maintenanceStatus = getMaintenanceStatus(machine.proximaManutencao)
              return (
                <tr key={machine.id} className="machines-row">
                  <td
                    onClick={() => openDetailModal(machine)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openDetailModal(machine)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="machine-cell-clickable"
                  >
                    <span className="machine-name">{machine.nome}</span>
                    <span className="machine-meta">{machine.identificacao}</span>
                  </td>
                  <td>{machine.tipo}</td>
                  <td>
                    <span className={`status-chip status-${machine.status.replace(' ', '-').toLowerCase()}`}>
                      {machine.status}
                    </span>
                  </td>
                  <td>
                    <div className="maintenance-cell">
                      <span>{formatDate(machine.proximaManutencao)}</span>
                      {maintenanceStatus.status !== 'ok' && (
                        <span className={`maintenance-badge maintenance-${maintenanceStatus.status}`}>
                          {maintenanceStatus.status === 'overdue' && <AlertCircle size={12} />}
                          {maintenanceStatus.status === 'urgent' && <Clock size={12} />}
                          {maintenanceStatus.days === 0 ? 'Hoje' : `${maintenanceStatus.days}d`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="action-btn edit"
                        onClick={() => openEditModal(machine)}
                        title="Editar máquina"
                        aria-label="Editar máquina"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        className="action-btn maintenance"
                        onClick={() => scheduleMaintenance(machine)}
                        title="Agendar manutenção"
                        aria-label="Agendar manutenção"
                      >
                        <Calendar size={16} />
                      </button>
                      <button
                        type="button"
                        className="action-btn delete"
                        onClick={() => setDeleteConfirm(machine)}
                        title="Excluir máquina"
                        aria-label="Excluir máquina"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filteredMachines.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">Nenhuma máquina encontrada com os filtros atuais.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="maintenance-log">
        <header>
          <h3>Histórico recente de manutenções</h3>
          <span>{maintenanceLog.length} registros</span>
        </header>
        <ul>
          {maintenanceLog.map((log) => (
            <li key={log.id}>
              <div>
                <strong>{log.tipo}</strong>
                <span>{log.machineName}</span>
              </div>
              <div>
                <time>{formatDate(log.data)}</time>
                <p>{log.observacao}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {modalOpen && (
        <div className="machine-modal" role="dialog" aria-modal="true">
          <div className="machine-modal__card">
            <header>
              <div>
                <h3>{formState.id ? 'Editar máquina' : 'Cadastrar máquina'}</h3>
                <p>Preencha os dados para manter o controle atualizado.</p>
              </div>
              <button type="button" className="close-btn" onClick={closeModal} aria-label="Fechar">
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="machine-form">
              <div className="form-row">
                <label>
                  Nome da máquina
                  <input
                    type="text"
                    value={formState.nome}
                    onChange={handleChange('nome')}
                    required
                  />
                </label>
                <label>
                  Tipo
                  <select value={formState.tipo} onChange={handleChange('tipo')} required>
                    {MACHINE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Identificação / placa
                  <input
                    type="text"
                    value={formState.identificacao}
                    onChange={handleChange('identificacao')}
                    required
                  />
                </label>
                <label>
                  Status
                  <select value={formState.status} onChange={handleChange('status')} required>
                    {MACHINE_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Horas trabalhadas
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={formState.horasTrabalhadas}
                    onChange={handleChange('horasTrabalhadas')}
                    required
                  />
                </label>
                <label>
                  Consumo médio (L/h)
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={formState.consumoMedio}
                    onChange={handleChange('consumoMedio')}
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Última manutenção
                  <input
                    type="date"
                    value={formState.ultimaManutencao}
                    onChange={handleChange('ultimaManutencao')}
                    required
                  />
                </label>
                <label>
                  Próxima manutenção prevista
                  <input
                    type="date"
                    value={formState.proximaManutencao}
                    onChange={handleChange('proximaManutencao')}
                    required
                  />
                </label>
              </div>

              <footer>
                <button type="button" className="secondary-button" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="primary-button">Salvar</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {detailMachine && (
        <div className="machine-details-modal" role="dialog" aria-modal="true">
          <div className="machine-details-modal__card">
            <header>
              <div>
                <h3>Detalhes da máquina</h3>
                <p>Confira todas as informações cadastradas antes de realizar ações.</p>
              </div>
              <button type="button" className="close-btn" onClick={closeDetailModal} aria-label="Fechar">
                <X size={20} />
              </button>
            </header>

            <div className="machine-details-grid">
              <div>
                <span className="label">Nome</span>
                <strong>{detailMachine.nome}</strong>
              </div>
              <div>
                <span className="label">Tipo</span>
                <strong>{detailMachine.tipo}</strong>
              </div>
              <div>
                <span className="label">Identificação</span>
                <strong>{detailMachine.identificacao}</strong>
              </div>
              <div>
                <span className="label">Status</span>
                <span className={`status-chip status-${detailMachine.status.replace(' ', '-').toLowerCase()}`}>
                  {detailMachine.status}
                </span>
              </div>
              <div>
                <span className="label">Horas trabalhadas</span>
                <strong>{formatHours(detailMachine.horasTrabalhadas)}</strong>
              </div>
              <div>
                <span className="label">Consumo médio</span>
                <strong>{formatFuel(detailMachine.consumoMedio)}</strong>
              </div>
              <div>
                <span className="label">Última manutenção</span>
                <strong>{formatDate(detailMachine.ultimaManutencao)}</strong>
              </div>
              <div>
                <span className="label">Próxima manutenção</span>
                <strong>{formatDate(detailMachine.proximaManutencao)}</strong>
              </div>
            </div>

            <div className="machine-details-actions">
              <div className="maintenance-status-info">
                {(() => {
                  const maintenanceStatus = getMaintenanceStatus(detailMachine.proximaManutencao)
                  if (maintenanceStatus.status !== 'ok') {
                    return (
                      <div className={`maintenance-alert maintenance-${maintenanceStatus.status}`}>
                        <AlertCircle size={18} />
                        <div>
                          <strong>Manutenção {maintenanceStatus.label}</strong>
                          <span>
                            {maintenanceStatus.status === 'overdue'
                              ? `${maintenanceStatus.days} dias atrasada`
                              : `Em ${maintenanceStatus.days} dias`}
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
            </div>

            <footer>
              <button type="button" className="secondary-button" onClick={closeDetailModal}>
                Fechar
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  if (!detailMachine) return
                  scheduleMaintenance(detailMachine)
                }}
              >
                <Calendar size={16} />
                Agendar manutenção
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  if (!detailMachine) return
                  const machineToEdit = detailMachine
                  closeDetailModal()
                  openEditModal(machineToEdit)
                }}
              >
                <Edit size={16} />
                Editar máquina
              </button>
            </footer>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="machine-modal" role="dialog" aria-modal="true">
          <div className="machine-modal__card delete-confirm">
            <header>
              <div>
                <h3>Confirmar exclusão</h3>
                <p>Tem certeza que deseja excluir esta máquina? Esta ação não pode ser desfeita.</p>
              </div>
              <button type="button" className="close-btn" onClick={() => setDeleteConfirm(null)} aria-label="Fechar">
                <X size={20} />
              </button>
            </header>

            <div className="delete-confirm-info">
              <strong>{deleteConfirm.nome}</strong>
              <span>{deleteConfirm.identificacao} • {deleteConfirm.tipo}</span>
            </div>

            <footer>
              <button type="button" className="secondary-button" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button type="button" className="danger-button" onClick={() => handleDelete(deleteConfirm)}>
                <Trash2 size={16} />
                Excluir máquina
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}

