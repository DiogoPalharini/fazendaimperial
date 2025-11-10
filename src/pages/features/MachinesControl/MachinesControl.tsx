import { useMemo, useState, useEffect } from 'react'
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
  MapPin,
} from 'lucide-react'
import type { Machine, MachineType, MachineStatus, MachineForm, MaintenanceLog, TractorTelemetry, ScheduledMaintenance } from './types'
import { MACHINE_TYPES, MACHINE_STATUSES, INITIAL_MACHINES, INITIAL_MAINTENANCE, INITIAL_TELEMETRY, emptyForm } from './constants'
import { formatHours, formatFuel, formatDate, getMaintenanceStatus } from './utils'
import TractorMap from './components/TractorMap'
import TractorTelemetryPanel from './components/TractorTelemetryPanel'
import './MachinesControl.css'

export default function MachinesControl() {
  const [activeTab, setActiveTab] = useState<'controle' | 'tempo-real'>('controle')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<MachineType | 'Todas'>('Todas')
  const [statusFilter, setStatusFilter] = useState<MachineStatus | 'Todos'>('Todos')
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES)
  const [maintenanceLog, setMaintenanceLog] = useState<MaintenanceLog[]>(INITIAL_MAINTENANCE)
  const [scheduledMaintenances, setScheduledMaintenances] = useState<ScheduledMaintenance[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [formState, setFormState] = useState<MachineForm>({ ...emptyForm })
  const [detailMachine, setDetailMachine] = useState<Machine | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Machine | null>(null)
  const [detailTab, setDetailTab] = useState<'scheduled' | 'history'>('scheduled')
  const [scheduleMaintenanceModalOpen, setScheduleMaintenanceModalOpen] = useState(false)
  const [scheduleForm, setScheduleForm] = useState<{ tipo: ScheduledMaintenance['tipo'], dataAgendada: string, observacao: string }>({
    tipo: 'Revisão',
    dataAgendada: '',
    observacao: '',
  })
  
  // Estados para monitoramento em tempo real
  const [telemetry, setTelemetry] = useState<TractorTelemetry[]>(INITIAL_TELEMETRY)
  const [selectedTractor, setSelectedTractor] = useState<string | null>(null)

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
    setFormState({ ...emptyForm })
    setModalOpen(true)
  }

  const openEditModal = (machine: Machine) => {
    setFormState({ ...machine })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setFormState({ ...emptyForm })
  }

  const openDetailModal = (machine: Machine) => {
    setDetailMachine(machine)
  }

  const closeDetailModal = () => {
    setDetailMachine(null)
    setDetailTab('scheduled')
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

  const handleDelete = (machine: Machine) => {
    setMachines((prev) => prev.filter((m) => m.id !== machine.id))
    setMaintenanceLog((prev) => prev.filter((log) => log.machineId !== machine.id))
    setDeleteConfirm(null)
    if (detailMachine?.id === machine.id) {
      closeDetailModal()
    }
  }

  // Simular atualização de telemetria em tempo real
  useEffect(() => {
    if (activeTab !== 'tempo-real') return

    const interval = setInterval(() => {
      setTelemetry((prev) =>
        prev.map((tractor) => {
          if (tractor.status === 'Desligado') return tractor

          // Simular pequenas variações nos dados
          const variation = () => (Math.random() - 0.5) * 0.1

          return {
            ...tractor,
            latitude: tractor.latitude + variation() * 0.0001,
            longitude: tractor.longitude + variation() * 0.0001,
            velocidade:
              tractor.status === 'Em movimento'
                ? Math.max(0, Math.min(15, tractor.velocidade + variation() * 2))
                : 0,
            rotacaoMotor:
              tractor.status === 'Em movimento'
                ? Math.max(1500, Math.min(2200, tractor.rotacaoMotor + variation() * 50))
                : 0,
            nivelCombustivel: Math.max(0, Math.min(100, tractor.nivelCombustivel - 0.01)),
            nivelOleo: Math.max(70, Math.min(100, tractor.nivelOleo + variation() * 0.5)),
            temperaturaMotor:
              tractor.status === 'Em movimento'
                ? Math.max(75, Math.min(95, tractor.temperaturaMotor + variation() * 2))
                : 0,
            temperaturaHidraulico:
              tractor.status === 'Em movimento'
                ? Math.max(60, Math.min(75, tractor.temperaturaHidraulico + variation() * 1))
                : 0,
            pressaoOleo:
              tractor.status === 'Em movimento'
                ? Math.max(40, Math.min(50, tractor.pressaoOleo + variation() * 2))
                : 0,
            horasTrabalho: tractor.horasTrabalho + 0.001,
            ultimaAtualizacao: new Date().toISOString(),
          }
        })
      )
    }, 3000) // Atualiza a cada 3 segundos

    return () => clearInterval(interval)
  }, [activeTab])

  const selectedTractorData = useMemo(() => {
    return telemetry.find((t) => t.machineId === selectedTractor) || null
  }, [telemetry, selectedTractor])

  const tractorsInOperation = useMemo(() => {
    return telemetry.filter((t) => t.status !== 'Desligado')
  }, [telemetry])

  return (
    <div className="machines-page">
      <header className="machines-header">
        <div>
          <h2>Controle de Máquinas</h2>
          <p>Cadastre, monitore e planeje manutenções da frota de tratores, caminhões e camionetes.</p>
        </div>
      </header>

      <div className="machines-tabs">
        <button
          type="button"
          className={activeTab === 'controle' ? 'active' : ''}
          onClick={() => setActiveTab('controle')}
        >
          <ClipboardCheck size={18} />
          Controle
        </button>
        <button
          type="button"
          className={activeTab === 'tempo-real' ? 'active' : ''}
          onClick={() => setActiveTab('tempo-real')}
        >
          <MapPin size={18} />
          Tempo Real
        </button>
      </div>

      {activeTab === 'tempo-real' && (
        <div className="realtime-monitoring">
          <div className="realtime-header">
            <div>
              <h3>Monitoramento em Tempo Real</h3>
              <p>Acompanhe a localização e status dos tratores em operação</p>
            </div>
            <div className="realtime-stats">
              <div className="stat-item">
                <span>Tratores Ativos</span>
                <strong>{tractorsInOperation.length}</strong>
              </div>
            </div>
          </div>

          <div className="realtime-content">
            <div className="realtime-map-section">
              <TractorMap
                tractors={telemetry}
                selectedTractor={selectedTractor}
                onTractorClick={(tractor) => setSelectedTractor(tractor.machineId)}
              />
            </div>

            <div className="realtime-panel-section">
              {selectedTractorData ? (
                <TractorTelemetryPanel tractor={selectedTractorData} />
              ) : (
                <div className="no-tractor-selected">
                  <MapPin size={48} />
                  <h4>Selecione um trator no mapa</h4>
                  <p>Clique em um marcador para ver as informações detalhadas</p>
                </div>
              )}
            </div>
          </div>

          <div className="tractors-list">
            <h4>Tratores Monitorados</h4>
            <div className="tractors-grid">
              {telemetry.map((tractor) => (
                <div
                  key={tractor.machineId}
                  className={`tractor-card ${selectedTractor === tractor.machineId ? 'selected' : ''}`}
                  onClick={() => setSelectedTractor(tractor.machineId)}
                >
                  <div className="tractor-card-header">
                    <strong>{tractor.nome}</strong>
                    <span
                      className="status-badge-small"
                      style={{
                        backgroundColor:
                          tractor.status === 'Em movimento'
                            ? '#3a7d4420'
                            : tractor.status === 'Ligado'
                            ? '#e9b54320'
                            : '#99920',
                        color:
                          tractor.status === 'Em movimento'
                            ? '#3a7d44'
                            : tractor.status === 'Ligado'
                            ? '#e9b543'
                            : '#999',
                      }}
                    >
                      {tractor.status}
                    </span>
                  </div>
                  <div className="tractor-card-info">
                    <div>
                      <span>Velocidade</span>
                      <strong>{Math.round(tractor.velocidade * 10) / 10} km/h</strong>
                    </div>
                    <div>
                      <span>Combustível</span>
                      <strong>{Math.round(tractor.nivelCombustivel)}%</strong>
                    </div>
                    <div>
                      <span>Óleo</span>
                      <strong>{Math.round(tractor.nivelOleo)}%</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'controle' && (
        <>

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
              // Verificar se há manutenções agendadas para esta máquina
              const scheduledForMachine = scheduledMaintenances
                .filter((m) => m.machineId === machine.id && m.status === 'Agendada')
                .sort((a, b) => new Date(a.dataAgendada).getTime() - new Date(b.dataAgendada).getTime())
              
              const nextScheduled = scheduledForMachine[0]
              const hasScheduledMaintenances = scheduledForMachine.length > 0
              
              // Só calcular status se houver manutenção agendada
              const maintenanceStatus = nextScheduled 
                ? getMaintenanceStatus(nextScheduled.dataAgendada)
                : null
              
              const displayDate = nextScheduled ? nextScheduled.dataAgendada : machine.proximaManutencao
              
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
                      {hasScheduledMaintenances ? (
                        <>
                          <span>{formatDate(displayDate)}</span>
                          <span className="maintenance-badge scheduled" title={`${scheduledForMachine.length} manutenção(ões) agendada(s)`}>
                            <Calendar size={12} />
                            {scheduledForMachine.length}
                          </span>
                          {maintenanceStatus && maintenanceStatus.status !== 'ok' && (
                            <span className={`maintenance-badge maintenance-${maintenanceStatus.status}`}>
                              {maintenanceStatus.status === 'overdue' && <AlertCircle size={12} />}
                              {maintenanceStatus.status === 'urgent' && <Clock size={12} />}
                              {maintenanceStatus.days === 0 ? 'Hoje' : `${maintenanceStatus.days}d`}
                            </span>
                          )}
                        </>
                      ) : (
                        <span>{formatDate(machine.proximaManutencao)}</span>
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
                        onClick={() => {
                          openDetailModal(machine)
                          setDetailTab('scheduled')
                        }}
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
                <h3>{detailMachine.nome}</h3>
                <p>{detailMachine.identificacao} • {detailMachine.tipo}</p>
              </div>
              <button type="button" className="close-btn" onClick={closeDetailModal} aria-label="Fechar">
                <X size={20} />
              </button>
            </header>

            <div className="machine-details-info">
              <div className="machine-info-grid">
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
              </div>
            </div>

            <div className="maintenance-tabs">
              <button
                type="button"
                className={`maintenance-tab ${detailTab === 'scheduled' ? 'active' : ''}`}
                onClick={() => setDetailTab('scheduled')}
              >
                <Calendar size={18} />
                Manutenções Agendadas
              </button>
              <button
                type="button"
                className={`maintenance-tab ${detailTab === 'history' ? 'active' : ''}`}
                onClick={() => setDetailTab('history')}
              >
                <ClipboardCheck size={18} />
                Histórico
              </button>
            </div>

            <div className="maintenance-content">
              {detailTab === 'scheduled' && (
                <div className="scheduled-maintenance-tab">
                  <div className="scheduled-maintenance-header">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => {
                        setScheduleForm({ tipo: 'Revisão', dataAgendada: '', observacao: '' })
                        setScheduleMaintenanceModalOpen(true)
                      }}
                    >
                      <Plus size={16} />
                      Agendar Manutenção
                    </button>
                  </div>
                  <ul className="scheduled-maintenance-list">
                    {scheduledMaintenances
                      .filter((m) => m.machineId === detailMachine.id && m.status !== 'Concluída' && m.status !== 'Cancelada')
                      .map((maintenance) => (
                        <li key={maintenance.id} className="scheduled-maintenance-item">
                          <div className="maintenance-item-header">
                            <div>
                              <strong>{maintenance.tipo}</strong>
                              <span className={`maintenance-status-badge ${maintenance.status.toLowerCase().replace(' ', '-')}`}>
                                {maintenance.status}
                              </span>
                            </div>
                            <span className="maintenance-date">{formatDate(maintenance.dataAgendada)}</span>
                          </div>
                          {maintenance.observacao && <p>{maintenance.observacao}</p>}
                        </li>
                      ))}
                    {scheduledMaintenances.filter((m) => m.machineId === detailMachine.id && m.status !== 'Concluída' && m.status !== 'Cancelada').length === 0 && (
                      <li className="empty-state">
                        <Calendar size={24} />
                        <p>Nenhuma manutenção agendada</p>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {detailTab === 'history' && (
                <div className="maintenance-history-tab">
                  <ul className="maintenance-history-list">
                    {maintenanceLog
                      .filter((log) => log.machineId === detailMachine.id)
                      .map((log) => (
                        <li key={log.id} className="maintenance-history-item">
                          <div className="maintenance-history-header">
                            <div>
                              <strong>{log.tipo}</strong>
                              <time>{formatDate(log.data)}</time>
                            </div>
                          </div>
                          {log.observacao && <p>{log.observacao}</p>}
                        </li>
                      ))}
                    {maintenanceLog.filter((log) => log.machineId === detailMachine.id).length === 0 && (
                      <li className="empty-state">
                        <ClipboardCheck size={24} />
                        <p>Nenhuma manutenção registrada</p>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <footer>
              <button type="button" className="secondary-button" onClick={closeDetailModal}>
                Fechar
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

      {scheduleMaintenanceModalOpen && detailMachine && (
        <div className="machine-modal machine-modal--schedule" role="dialog" aria-modal="true">
          <div className="machine-modal__card schedule-maintenance-modal">
            <header>
              <div>
                <h3>Agendar Manutenção</h3>
                <p>Agende uma nova manutenção para {detailMachine.nome}</p>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setScheduleMaintenanceModalOpen(false)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </header>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!scheduleForm.dataAgendada) return

                const newScheduled: ScheduledMaintenance = {
                  id: `sched-${Date.now()}`,
                  machineId: detailMachine.id,
                  tipo: scheduleForm.tipo,
                  dataAgendada: scheduleForm.dataAgendada,
                  observacao: scheduleForm.observacao || undefined,
                  status: 'Agendada',
                }

                setScheduledMaintenances((prev) => [newScheduled, ...prev])
                setScheduleMaintenanceModalOpen(false)
                setScheduleForm({ tipo: 'Revisão', dataAgendada: '', observacao: '' })
              }}
            >
              <div className="form-group">
                <label htmlFor="schedule-tipo">Tipo de manutenção</label>
                <select
                  id="schedule-tipo"
                  value={scheduleForm.tipo}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, tipo: e.target.value as ScheduledMaintenance['tipo'] }))}
                  required
                >
                  <option value="Revisão">Revisão</option>
                  <option value="Troca de óleo">Troca de óleo</option>
                  <option value="Substituição de peças">Substituição de peças</option>
                  <option value="Inspeção">Inspeção</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="schedule-data">Data agendada</label>
                <input
                  id="schedule-data"
                  type="date"
                  value={scheduleForm.dataAgendada}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, dataAgendada: e.target.value }))}
                  required
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="schedule-observacao">Observação (opcional)</label>
                <textarea
                  id="schedule-observacao"
                  value={scheduleForm.observacao}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, observacao: e.target.value }))}
                  rows={3}
                  placeholder="Descreva o que será feito na manutenção..."
                />
              </div>

              <footer>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setScheduleMaintenanceModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  <Calendar size={16} />
                  Agendar
                </button>
              </footer>
            </form>
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
        </>
      )}
    </div>
  )
}

