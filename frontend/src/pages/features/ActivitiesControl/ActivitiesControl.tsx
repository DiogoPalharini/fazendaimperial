import { useMemo, useState } from 'react'
import { Plus, Search, Filter, ClipboardList, AlertTriangle, CheckCircle2, Clock, User, Calendar, MapPin, Sprout } from 'lucide-react'
import ActivityDetailsModal from './components/ActivityDetailsModal'
import AddActivityModal from './components/AddActivityModal'
import type { Activity, ActivityType, ActivityStatus, ActivityPriority } from './types'
import { INITIAL_ACTIVITIES, ACTIVITY_TYPES, ACTIVITY_PRIORITIES, FUNCIONARIOS } from './constants'
import { formatDate, getDaysUntilDeadline, getDeadlineStatus } from './utils'
import '../FeaturePage.css'
import './ActivitiesControl.css'

const KANBAN_COLUMNS: { status: ActivityStatus; label: string; icon: typeof Clock }[] = [
  { status: 'Pendente', label: 'A Fazer', icon: AlertTriangle },
  { status: 'Em Andamento', label: 'Em Andamento', icon: Clock },
  { status: 'Concluída', label: 'Concluída', icon: CheckCircle2 },
  { status: 'Cancelada', label: 'Cancelada', icon: ClipboardList },
]

export default function ActivitiesControl() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'Todos'>('Todos')
  const [priorityFilter, setPriorityFilter] = useState<ActivityPriority | 'Todas'>('Todas')
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'Todos'>('Todos')
  const [funcionarioFilter, setFuncionarioFilter] = useState<string>('Todos')
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [addActivityModalOpen, setAddActivityModalOpen] = useState(false)
  const [draggedActivity, setDraggedActivity] = useState<Activity | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<ActivityStatus | null>(null)

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const searchTerm = search.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        activity.titulo.toLowerCase().includes(searchTerm) ||
        activity.descricao.toLowerCase().includes(searchTerm) ||
        activity.funcionario.toLowerCase().includes(searchTerm) ||
        activity.talhao?.toLowerCase().includes(searchTerm) ||
        activity.cultura?.toLowerCase().includes(searchTerm)

      const matchesType = typeFilter === 'Todos' || activity.tipo === typeFilter
      const matchesPriority = priorityFilter === 'Todas' || activity.prioridade === priorityFilter
      const matchesStatus = statusFilter === 'Todos' || activity.status === statusFilter
      const matchesFuncionario = funcionarioFilter === 'Todos' || activity.funcionario === funcionarioFilter

      return matchesSearch && matchesType && matchesPriority && matchesStatus && matchesFuncionario
    })
  }, [activities, search, typeFilter, priorityFilter, statusFilter, funcionarioFilter])

  const activitiesByStatus = useMemo(() => {
    const grouped: Record<ActivityStatus, Activity[]> = {
      Pendente: [],
      'Em Andamento': [],
      Concluída: [],
      Cancelada: [],
    }

    filteredActivities.forEach((activity) => {
      grouped[activity.status].push(activity)
    })

    return grouped
  }, [filteredActivities])

  const summary = useMemo(() => {
    const totalAtividades = activities.length
    const pendentes = activities.filter((activity) => activity.status === 'Pendente').length
    const emAndamento = activities.filter((activity) => activity.status === 'Em Andamento').length
    const concluidas = activities.filter((activity) => activity.status === 'Concluída').length

    return { totalAtividades, pendentes, emAndamento, concluidas }
  }, [activities])

  const handleSaveActivity = (activityData: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      ...activityData,
    }
    setActivities((prev) => [newActivity, ...prev])
    setAddActivityModalOpen(false)
  }

  const handleEditActivity = (updatedActivity: Activity) => {
    setActivities((prev) => prev.map((activity) => (activity.id === updatedActivity.id ? updatedActivity : activity)))
    setSelectedActivity(null)
  }

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id))
    setSelectedActivity(null)
  }

  const handleMoveActivity = (activityId: string, newStatus: ActivityStatus) => {
    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === activityId) {
          return {
            ...activity,
            status: newStatus,
            dataConclusao: newStatus === 'Concluída' && !activity.dataConclusao ? new Date().toISOString().slice(0, 10) : activity.dataConclusao,
          }
        }
        return activity
      })
    )
  }

  const handleDragStart = (e: React.DragEvent, activity: Activity) => {
    setDraggedActivity(activity)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.dropEffect = 'move'
    
    // Criar um clone do card para usar como imagem de drag
    const card = e.currentTarget as HTMLElement
    card.classList.add('dragging')
    
    // Criar um clone completo e visível do card para usar como imagem de drag
    const dragImage = card.cloneNode(true) as HTMLElement
    
    // Aplicar estilos inline para garantir visibilidade total
    Object.assign(dragImage.style, {
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      width: card.offsetWidth + 'px',
      height: 'auto',
      background: 'linear-gradient(135deg, #fff 0%, #fefcf9 100%)',
      border: '2px solid #3a7d44',
      borderRadius: '16px',
      padding: '18px',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
      opacity: '1',
      transform: 'rotate(2deg)',
      zIndex: '10000',
      pointerEvents: 'none',
      margin: '0',
      display: 'block',
      visibility: 'visible',
    })
    
    dragImage.classList.add('dragging')
    
    // Aplicar estilos computados importantes
    const computedStyle = window.getComputedStyle(card)
    dragImage.style.fontFamily = computedStyle.fontFamily
    dragImage.style.fontSize = computedStyle.fontSize
    dragImage.style.color = computedStyle.color
    dragImage.style.lineHeight = computedStyle.lineHeight
    
    document.body.appendChild(dragImage)
    
    // Forçar layout e renderização completa de forma síncrona
    dragImage.offsetHeight // Força reflow
    dragImage.getBoundingClientRect() // Força layout
    
    // Definir a imagem de drag (deve ser síncrono)
    const rect = card.getBoundingClientRect()
    try {
      e.dataTransfer.setDragImage(dragImage, rect.width / 2, 20)
    } catch (err) {
      // Fallback se houver erro
      console.warn('Erro ao definir drag image:', err)
    }
    
    // Remover o elemento após um pequeno delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    }, 100)
    
    // Manter o card original totalmente visível e destacado
    card.style.opacity = '1'
    card.style.transform = 'scale(1.05) rotate(2deg)'
    card.style.zIndex = '1000'
    card.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.25)'
  }

  const handleDragOver = (e: React.DragEvent, status: ActivityStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Só remover o drag-over se realmente saiu da coluna (não apenas de um filho)
    const currentTarget = e.currentTarget as HTMLElement
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent, newStatus: ActivityStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    if (draggedActivity) {
      handleMoveActivity(draggedActivity.id, newStatus)
      setDraggedActivity(null)
    }
  }

  return (
    <div className="inputs-page">
      <header className="inputs-header">
        <div>
          <h2>Controle de Atividades</h2>
          <p>Gerencie atividades dos funcionários usando o Kanban board. Arraste as atividades entre as colunas.</p>
        </div>
      </header>

      <section className="inputs-summary">
        <article className="summary-card">
          <ClipboardList size={24} />
          <div>
            <span>Total de atividades</span>
            <strong>{summary.totalAtividades}</strong>
          </div>
        </article>
        <article className="summary-card warning">
          <AlertTriangle size={24} />
          <div>
            <span>Pendentes</span>
            <strong>{summary.pendentes}</strong>
          </div>
        </article>
        <article className="summary-card">
          <Clock size={24} />
          <div>
            <span>Em andamento</span>
            <strong>{summary.emAndamento}</strong>
          </div>
        </article>
        <article className="summary-card">
          <CheckCircle2 size={24} />
          <div>
            <span>Concluídas</span>
            <strong>{summary.concluidas}</strong>
          </div>
        </article>
      </section>

      <section className="inputs-toolbar">
        <div className="search-group">
          <Search size={18} />
          <input
            type="search"
            placeholder="Buscar por título, descrição, funcionário, talhão ou cultura"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="select-group">
            <Filter size={16} />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as ActivityType | 'Todos')}
            >
              <option value="Todos">Todos os tipos</option>
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <Filter size={16} />
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as ActivityPriority | 'Todas')}
            >
              <option value="Todas">Todas as prioridades</option>
              {ACTIVITY_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as ActivityStatus | 'Todos')}
            >
              <option value="Todos">Todos os status</option>
              <option value="Pendente">Pendente</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluída">Concluída</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div className="select-group">
            <Filter size={16} />
            <select
              value={funcionarioFilter}
              onChange={(event) => setFuncionarioFilter(event.target.value)}
            >
              <option value="Todos">Todos os funcionários</option>
              {FUNCIONARIOS.map((funcionario) => (
                <option key={funcionario} value={funcionario}>
                  {funcionario}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="inputs-table-header">
        <button type="button" className="primary-button" onClick={() => setAddActivityModalOpen(true)}>
          <Plus size={18} /> Adicionar Atividade
        </button>
      </div>

      <section className="kanban-board">
        {KANBAN_COLUMNS.map((column) => {
          const ColumnIcon = column.icon
          const columnActivities = activitiesByStatus[column.status]

          return (
            <div
              key={column.status}
              className={`kanban-column ${dragOverColumn === column.status ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <ColumnIcon size={20} />
                  <h3>{column.label}</h3>
                  <span className="kanban-count">{columnActivities.length}</span>
                </div>
              </div>

              <div className="kanban-column-content">
                {columnActivities.length === 0 ? (
                  <div className="kanban-empty">Nenhuma atividade</div>
                ) : (
                  columnActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`kanban-card ${activity.status !== 'Concluída' && getDeadlineStatus(activity.dataFim) === 'overdue' ? 'overdue' : ''} ${activity.status !== 'Concluída' && getDeadlineStatus(activity.dataFim) === 'urgent' ? 'urgent' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, activity)}
                      onDragEnd={(e) => {
                        const target = e.currentTarget as HTMLElement
                        target.style.opacity = '1'
                        target.style.transform = ''
                        target.style.zIndex = ''
                        target.style.boxShadow = ''
                        target.classList.remove('dragging')
                        setDraggedActivity(null)
                      }}
                      onClick={() => setSelectedActivity(activity)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setSelectedActivity(activity)
                        }
                      }}
                    >
                      <div className="kanban-card-header">
                        <span className={`kanban-card-type type-${activity.tipo.toLowerCase()}`}>{activity.tipo}</span>
                        <span className={`kanban-card-priority priority-${activity.prioridade.toLowerCase()}`}>
                          {activity.prioridade}
                        </span>
                      </div>
                      <h4 className="kanban-card-title">{activity.titulo}</h4>
                      <p className="kanban-card-description">{activity.descricao}</p>
                      
                      <div className="kanban-card-meta">
                        <div className="kanban-card-info">
                          <User size={14} />
                          <span>{activity.funcionario}</span>
                        </div>
                        {activity.talhao && (
                          <div className="kanban-card-info">
                            <MapPin size={14} />
                            <span>{activity.talhao}</span>
                          </div>
                        )}
                        {activity.cultura && (
                          <div className="kanban-card-info">
                            <Sprout size={14} />
                            <span>{activity.cultura}</span>
                          </div>
                        )}
                      </div>

                      <div className="kanban-card-dates">
                        <div className="kanban-card-date">
                          <Calendar size={12} />
                          <span>Início: {formatDate(activity.dataInicio)}</span>
                        </div>
                        {activity.dataFim && activity.status !== 'Concluída' && (
                          <div className={`kanban-card-deadline deadline-${getDeadlineStatus(activity.dataFim) || 'ok'}`}>
                            <Clock size={12} />
                            <span>
                              Prazo: {formatDate(activity.dataFim)}
                              {(() => {
                                const days = getDaysUntilDeadline(activity.dataFim)
                                if (days === null) return ''
                                if (days < 0) return ` (${Math.abs(days)}d atrasado)`
                                if (days === 0) return ' (Hoje)'
                                if (days <= 3) return ` (${days}d restantes)`
                                return ''
                              })()}
                            </span>
                          </div>
                        )}
                        {activity.dataFim && activity.status === 'Concluída' && (
                          <div className="kanban-card-deadline deadline-ok">
                            <Clock size={12} />
                            <span>Prazo: {formatDate(activity.dataFim)} (Concluída)</span>
                          </div>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </section>

      {addActivityModalOpen && (
        <AddActivityModal
          onClose={() => setAddActivityModalOpen(false)}
          onSave={handleSaveActivity}
        />
      )}

      {selectedActivity && (
        <ActivityDetailsModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
        />
      )}
    </div>
  )
}
