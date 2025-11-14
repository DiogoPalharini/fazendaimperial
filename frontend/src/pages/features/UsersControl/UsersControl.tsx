import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  User as UserIcon,
  Wrench,
  DollarSign,
  Briefcase,
  Shield,
  UserX,
  Eye,
} from 'lucide-react'
import { useTranslation } from '../../../contexts/LanguageContext'
import AddUserModal from './components/AddUserModal'
import UserDetailsModal from './components/UserDetailsModal'
import type { User as UserType, UserRole } from './types'
import { INITIAL_USERS, USER_ROLES, SETORES, FAZENDAS } from './constants'
import '../FeaturePage.css'
import './UsersControl.css'

const KANBAN_COLUMNS: { role: UserRole; translationKey: string; icon: typeof UserIcon }[] = [
  { role: 'funcionario-comum', translationKey: 'users.commonEmployee', icon: UserIcon },
  { role: 'operador-maquinas', translationKey: 'users.machineOperator', icon: Wrench },
  { role: 'controle-financeiro', translationKey: 'users.financialControl', icon: DollarSign },
  { role: 'gerente', translationKey: 'users.manager', icon: Briefcase },
  { role: 'administrador-local', translationKey: 'users.localAdmin', icon: Shield },
  { role: 'desativado', translationKey: 'users.deactivated', icon: UserX },
]

export default function UsersControl() {
  const t = useTranslation()
  const [search, setSearch] = useState('')
  const [fazendaFilter, setFazendaFilter] = useState<string>('Todas')
  const [setorFilter, setSetorFilter] = useState<string>('Todos')
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'ativo' | 'inativo'>('Todos')
  const [users, setUsers] = useState<UserType[]>(INITIAL_USERS)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [userEditando, setUserEditando] = useState<UserType | null>(null)
  const [draggedUser, setDraggedUser] = useState<UserType | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<UserRole | null>(null)

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchTerm = search.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        user.nome.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.setor?.toLowerCase().includes(searchTerm)

      const matchesFazenda = fazendaFilter === 'Todas' || user.fazenda === fazendaFilter
      const matchesSetor = setorFilter === 'Todos' || user.setor === setorFilter
      const matchesStatus = statusFilter === 'Todos' || user.status === statusFilter

      return matchesSearch && matchesFazenda && matchesSetor && matchesStatus
    })
  }, [users, search, fazendaFilter, setorFilter, statusFilter])

  const usersByRole = useMemo(() => {
    const grouped: Record<UserRole, UserType[]> = {
      'funcionario-comum': [],
      'operador-maquinas': [],
      'controle-financeiro': [],
      gerente: [],
      'administrador-local': [],
      desativado: [],
    }

    filteredUsers.forEach((user) => {
      grouped[user.cargo].push(user)
    })

    return grouped
  }, [filteredUsers])

  const summary = useMemo(() => {
    const totalUsuarios = users.length
    const ativos = users.filter((user) => user.status === 'ativo').length
    const inativos = users.filter((user) => user.status === 'inativo').length

    return { totalUsuarios, ativos, inativos }
  }, [users])

  const handleSaveUser = (userData: Omit<UserType, 'id' | 'avatar' | 'dataCriacao' | 'ultimoAcesso'>) => {
    if (userEditando) {
      // Editar usuário existente
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userEditando.id
            ? {
                ...user,
                ...userData,
                avatar: user.avatar || '👤',
              }
            : user
        )
      )
      setUserEditando(null)
    } else {
      // Criar novo usuário
      const newUser: UserType = {
        id: `user-${Date.now()}`,
        ...userData,
        avatar: '👤',
        dataCriacao: new Date().toISOString().slice(0, 10),
      }
      setUsers((prev) => [newUser, ...prev])
    }
    setAddUserModalOpen(false)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId))
    setSelectedUser(null)
  }

  const handleMoveUser = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            cargo: newRole,
            status: newRole === 'desativado' ? 'inativo' : user.status,
          }
        }
        return user
      })
    )
  }

  const handleDragStart = (e: React.DragEvent, user: UserType) => {
    setDraggedUser(user)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.dropEffect = 'move'

    const card = e.currentTarget as HTMLElement
    card.classList.add('dragging')
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.classList.remove('dragging')
    setDraggedUser(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, role: UserRole) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(role)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement
    const currentTarget = e.currentTarget as HTMLElement
    if (!currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent, newRole: UserRole) => {
    e.preventDefault()
    setDragOverColumn(null)
    if (draggedUser) {
      handleMoveUser(draggedUser.id, newRole)
      setDraggedUser(null)
    }
  }

  const handleOpenAddModal = () => {
    setUserEditando(null)
    setAddUserModalOpen(true)
  }

  const handleOpenEditModal = (user: UserType) => {
    setUserEditando(user)
    setAddUserModalOpen(true)
    setSelectedUser(null)
  }

  return (
    <div className="feature-page">
      <div className="feature-header">
        <h1 className="feature-title">{t('users.title')}</h1>
        <p className="feature-description">{t('users.description')}</p>
      </div>

      <div className="users-summary">
        <div className="summary-card">
          <span className="summary-label">{t('users.totalUsers')}</span>
          <span className="summary-value">{summary.totalUsuarios}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">{t('users.activeUsers')}</span>
          <span className="summary-value active">{summary.ativos}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">{t('users.inactiveUsers')}</span>
          <span className="summary-value inactive">{summary.inativos}</span>
        </div>
      </div>

      <div className="users-controls">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={t('users.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="select-group">
            <Filter size={16} />
            <select
              className="filter-select"
              value={fazendaFilter}
              onChange={(e) => setFazendaFilter(e.target.value)}
            >
              <option value="Todas">{t('users.allFarms')}</option>
              {FAZENDAS.map((fazenda) => (
                <option key={fazenda} value={fazenda}>
                  {fazenda}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <select
              className="filter-select"
              value={setorFilter}
              onChange={(e) => setSetorFilter(e.target.value)}
            >
              <option value="Todos">{t('users.allSectors')}</option>
              {SETORES.map((setor) => (
                <option key={setor} value={setor}>
                  {setor}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'Todos' | 'ativo' | 'inativo')}
            >
              <option value="Todos">{t('users.allStatus')}</option>
              <option value="ativo">{t('common.active')}</option>
              <option value="inativo">{t('common.inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="users-actions">
        <button type="button" className="primary-button create-user-button" onClick={handleOpenAddModal}>
          <Plus size={20} />
          {t('users.createUser')}
        </button>
      </div>

      <div className="kanban-board">
        {KANBAN_COLUMNS.map((column) => {
          const columnUsers = usersByRole[column.role]
          const Icon = column.icon

          return (
            <div
              key={column.role}
              className={`kanban-column ${dragOverColumn === column.role ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, column.role)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.role)}
            >
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <Icon size={20} />
                  <h3>{t(column.translationKey)}</h3>
                  <span className="kanban-count">{columnUsers.length}</span>
                </div>
              </div>

              <div className="kanban-column-content">
                {columnUsers.length === 0 ? (
                  <div className="kanban-empty">{t('users.noUsersInCategory')}</div>
                ) : (
                  columnUsers.map((user) => (
                    <div
                      key={user.id}
                      className="kanban-card user-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, user)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="user-card-header">
                        <div className="user-avatar">{user.avatar || '👤'}</div>
                        <button
                          className="user-view-button"
                          onClick={() => setSelectedUser(user)}
                          aria-label={t('users.viewDetails')}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                      <div className="user-card-body">
                        <h4 className="user-card-name">{user.nome}</h4>
                        <p className="user-card-email">{user.email}</p>
                        {user.setor && <p className="user-card-setor">{user.setor}</p>}
                        {user.fazenda && <p className="user-card-fazenda">{user.fazenda}</p>}
                      </div>
                      <div className="user-card-footer">
                        <span className={`user-status-badge ${user.status}`}>
                          {user.status === 'ativo' ? t('common.active') : t('common.inactive')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {addUserModalOpen && (
        <AddUserModal
          onClose={() => {
            setAddUserModalOpen(false)
            setUserEditando(null)
          }}
          onSave={handleSaveUser}
          userEditando={userEditando}
        />
      )}

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  )
}

