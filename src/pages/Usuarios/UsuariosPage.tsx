import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { TEST_USERS } from '../../data/users'
import { User } from '../../types/user'
import './UsuariosPage.css'
import { Plus, Pencil, Trash2, Search, UserCheck, UserX } from 'lucide-react'

export default function UsuariosPage() {
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState<User[]>(TEST_USERS)
  const [query, setQuery] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [edicao, setEdicao] = useState<User | null>(null)

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'gestor-geral': 'Gestor Geral',
      'gerente-producao': 'Gerente de Produção',
      'gestor-estoque': 'Gestor de Estoque',
      'operador-maquina': 'Operador de Máquina',
      'engenheiro-agronomo': 'Engenheiro Agrônomo',
      'financeiro': 'Financeiro',
      'motorista-logistica': 'Motorista/Logística'
    }
    return roleMap[role] || role
  }

  const usuariosFiltrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase()) ||
    getRoleDisplayName(u.role).toLowerCase().includes(query.toLowerCase())
  )

  function abrirNovo() {
    setEdicao({
      id: '',
      nome: '',
      email: '',
      role: 'operador-maquina',
      avatar: '👤',
      ativo: true
    })
    setModalAberto(true)
  }

  function abrirEdicao(usuario: User) {
    setEdicao(usuario)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setEdicao(null)
  }

  function salvarUsuario(usuario: User) {
    if (!usuario.nome.trim() || !usuario.email.trim()) return
    
    if (usuario.id) {
      setUsuarios(prev => prev.map(u => u.id === usuario.id ? usuario : u))
    } else {
      setUsuarios(prev => [{ ...usuario, id: String(Date.now()) }, ...prev])
    }
    fecharModal()
  }

  function toggleStatus(usuario: User) {
    setUsuarios(prev => prev.map(u => 
      u.id === usuario.id ? { ...u, ativo: !u.ativo } : u
    ))
  }

  if (user?.role !== 'gestor-geral') {
    return (
      <div className="access-denied">
        <h2>🚫 Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta área.</p>
        <p>Apenas o Gestor Geral pode gerenciar usuários.</p>
      </div>
    )
  }

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <h1>Gestão de Usuários</h1>
        <p>Controle de acesso e permissões do sistema</p>
      </div>

      <div className="toolbar">
        <div className="search-group">
          <Search size={18} />
          <input
            className="input"
            placeholder="Buscar por nome, email ou função"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="add-button" onClick={abrirNovo}>
          <Plus size={18} /> Novo Usuário
        </button>
      </div>

      <div className="users-grid">
        {usuariosFiltrados.map((usuario) => (
          <div key={usuario.id} className={`user-card ${!usuario.ativo ? 'inactive' : ''}`}>
            <div className="user-header">
              <span className="user-avatar">{usuario.avatar}</span>
              <div className="user-status">
                {usuario.ativo ? (
                  <span className="status active">
                    <UserCheck size={16} />
                    Ativo
                  </span>
                ) : (
                  <span className="status inactive">
                    <UserX size={16} />
                    Inativo
                  </span>
                )}
              </div>
            </div>
            
            <div className="user-info">
              <h3 className="user-name">{usuario.nome}</h3>
              <p className="user-email">{usuario.email}</p>
              <span className="user-role">{getRoleDisplayName(usuario.role)}</span>
            </div>

            <div className="user-actions">
              <button 
                className="btn small secondary" 
                onClick={() => abrirEdicao(usuario)}
              >
                <Pencil size={16} />
                Editar
              </button>
              <button 
                className={`btn small ${usuario.ativo ? 'warning' : 'success'}`}
                onClick={() => toggleStatus(usuario)}
              >
                {usuario.ativo ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalAberto && edicao && (
        <UserModal
          initial={edicao}
          onClose={fecharModal}
          onSave={salvarUsuario}
        />
      )}
    </div>
  )
}

type UserModalProps = {
  initial: User
  onClose: () => void
  onSave: (user: User) => void
}

function UserModal({ initial, onClose, onSave }: UserModalProps) {
  const [usuario, setUsuario] = useState<User>(initial)
  const [erro, setErro] = useState<string | null>(null)

  const roles = [
    { value: 'gestor-geral', label: 'Gestor Geral' },
    { value: 'gerente-producao', label: 'Gerente de Produção' },
    { value: 'gestor-estoque', label: 'Gestor de Estoque' },
    { value: 'operador-maquina', label: 'Operador de Máquina' },
    { value: 'engenheiro-agronomo', label: 'Engenheiro Agrônomo' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'motorista-logistica', label: 'Motorista/Logística' }
  ]

  function salvar() {
    if (!usuario.nome.trim()) { setErro('Informe o nome do usuário.'); return }
    if (!usuario.email.trim()) { setErro('Informe o email do usuário.'); return }
    setErro(null)
    onSave(usuario)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{usuario.id ? 'Editar Usuário' : 'Novo Usuário'}</h3>
        {erro && <div className="modal-error">{erro}</div>}
        <div className="modal-grid">
          <div className="field">
            <label>Nome</label>
            <input 
              className="input" 
              value={usuario.nome} 
              onChange={(e) => setUsuario({ ...usuario, nome: e.target.value })} 
              placeholder="Nome completo" 
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input 
              className="input" 
              type="email"
              value={usuario.email} 
              onChange={(e) => setUsuario({ ...usuario, email: e.target.value })} 
              placeholder="email@exemplo.com" 
            />
          </div>
          <div className="field">
            <label>Função</label>
            <select 
              className="select" 
              value={usuario.role} 
              onChange={(e) => setUsuario({ ...usuario, role: e.target.value as any })}
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Avatar</label>
            <input 
              className="input" 
              value={usuario.avatar || '👤'} 
              onChange={(e) => setUsuario({ ...usuario, avatar: e.target.value })} 
              placeholder="👤" 
            />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={salvar}>Salvar</button>
        </div>
      </div>
    </div>
  )
}



