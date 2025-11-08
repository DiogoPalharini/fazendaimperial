import { useMemo, useState } from 'react'
import { Plus, Search, Filter, ClipboardList, AlertTriangle, CheckCircle2, Clock, User, ChevronRight } from 'lucide-react'
import ActivityDetailsModal from './components/ActivityDetailsModal'
import AddActivityModal from './components/AddActivityModal'
import type { Activity, ActivityType, ActivityStatus, ActivityPriority } from './types'
import { INITIAL_ACTIVITIES, ACTIVITY_TYPES } from './constants'
import '../FeaturePage.css'
import './ActivitiesControl.css'

const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR')

const KANBAN_COLUMNS: { status: ActivityStatus; label: string; icon: typeof Clock }[] = [
  { status: 'Pendente', label: 'A Fazer', icon: AlertTriangle },
  { status: 'Em Andamento', label: 'Em Andamento', icon: Clock },
  { status: 'Concluída', label: 'Concluída', icon: CheckCircle2 },
  { status: 'Cancelada', label: 'Cancelada', icon: ClipboardList },
]

export default function ActivitiesControl() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'Todos'>('Todos')
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [addActivityModalOpen, setAddActivityModalOpen] = useState(false)
  const [draggedActivity, setDraggedActivity] = useState<Activity | null>(null)

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

      return matchesSearch && matchesType
    })
  }, [activities, search, typeFilter])

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

  const handleDragStart = (activity: Activity) => {
    setDraggedActivity(activity)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, newStatus: ActivityStatus) => {
    e.preventDefault()
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
              className="kanban-column"
              onDragOver={handleDragOver}
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
                      className="kanban-card"
                      draggable
                      onDragStart={() => handleDragStart(activity)}
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
                      <div className="kanban-card-footer">
                        <div className="kanban-card-info">
                          <User size={14} />
                          <span>{activity.funcionario}</span>
                        </div>
                        {activity.talhao && (
                          <div className="kanban-card-info">
                            <span>{activity.talhao}</span>
                          </div>
                        )}
                      </div>
                      <div className="kanban-card-date">{formatDate(activity.dataInicio)}</div>
                      <div className="kanban-card-actions">
                        {KANBAN_COLUMNS.filter((col) => col.status !== activity.status).map((col) => (
                          <button
                            key={col.status}
                            className="kanban-move-button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMoveActivity(activity.id, col.status)
                            }}
                            title={`Mover para ${col.label}`}
                          >
                            <ChevronRight size={14} />
                            {col.label}
                          </button>
                        ))}
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
