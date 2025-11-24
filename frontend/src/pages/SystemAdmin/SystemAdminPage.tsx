import { useMemo, useState, useEffect } from 'react'
import './SystemAdminPage.css'
import { ShieldCheck, Building2, Puzzle, Users as UsersIcon, PlusCircle, Edit, Trash2, Eye, X } from 'lucide-react'
import { useTranslation } from '../../contexts/LanguageContext'
import { MODULE_DEFINITIONS } from '../../data/modules'
import CreateGroupModal from './components/CreateGroupModal'
import EditGroupModal from './components/EditGroupModal'
import DeleteGroupModal from './components/DeleteGroupModal'
import { groupsService, type Group } from '../../services/groups'

export default function SystemAdminPage() {
  const t = useTranslation()
  const [groups, setGroups] = useState<Group[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null)
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null)
  const [isLoadingView, setIsLoadingView] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await groupsService.getGroups()
      setGroups(data)
    } catch (err: any) {
      setError('Erro ao carregar grupos. Tente novamente.')
      console.error('Error loading groups:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const moduleMap = useMemo(() => {
    return MODULE_DEFINITIONS.reduce<Record<string, typeof MODULE_DEFINITIONS[number]>>((acc, module) => {
      acc[module.key] = module
      return acc
    }, {})
  }, [])

  const stats = useMemo(() => {
    const totalFarms = groups.reduce((acc, group) => acc + (group.farms?.length || 0), 0)
    return {
      totalGroups: groups.length,
      groupsWithOwner: groups.filter((g) => g.owner_id !== null).length,
      totalFarms,
      totalUsers: groups.length, // TODO: Buscar contagem real de usuários
    }
  }, [groups])

  const handleSuccess = () => {
    loadGroups()
  }

  return (
    <div className="system-admin-page">
      <header className="system-admin-header">
        <div>
          <p className="system-admin-eyebrow">{t('systemAdmin.title')}</p>
          <h1>{t('systemAdmin.subtitle')}</h1>
        </div>
        <button type="button" className="primary-button" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={18} />
          Criar Grupo
        </button>
      </header>

      <section className="system-admin-stats">
        <article className="system-admin-stat-card">
          <ShieldCheck size={28} />
          <div>
            <strong>{stats.totalGroups}</strong>
            <span>Total de Grupos</span>
          </div>
        </article>
        <article className="system-admin-stat-card">
          <Building2 size={28} />
          <div>
            <strong>{stats.groupsWithOwner}</strong>
            <span>Grupos com Owner</span>
          </div>
        </article>
        <article className="system-admin-stat-card">
          <Puzzle size={28} />
          <div>
            <strong>{stats.totalFarms}</strong>
            <span>Total de Fazendas</span>
          </div>
        </article>
        <article className="system-admin-stat-card">
          <UsersIcon size={28} />
          <div>
            <strong>{stats.totalUsers}</strong>
            <span>Total de Usuários</span>
          </div>
        </article>
      </section>

      {error && (
        <div className="error-message" style={{ padding: '16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px' }}>
          {typeof error === 'string' ? error : 'Erro desconhecido'}
        </div>
      )}

      <section className="system-admin-card">
        <header>
          <div>
            <h2>Grupos de Fazendas</h2>
            <p>Lista de todos os grupos cadastrados no sistema</p>
          </div>
        </header>

        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>Carregando grupos...</div>
        ) : groups.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
            <p>Nenhum grupo cadastrado ainda.</p>
            <p>Crie seu primeiro grupo clicando no botão acima.</p>
          </div>
        ) : (
          <div className="farms-table-wrapper">
            <table className="farms-table">
              <thead>
                <tr>
                  <th>Grupo / Fazenda</th>
                  <th>Owner ID</th>
                  <th>Módulos</th>
                  <th>Data de Criação</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  // Se não tem fazendas, mostrar apenas o grupo
                  if (!group.farms || group.farms.length === 0) {
                    return (
                      <tr key={group.id}>
                        <td>
                          <div className="farm-name-cell">
                            <strong>{group.name}</strong>
                            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Sem fazendas</span>
                          </div>
                        </td>
                        <td>
                          <div className="farm-owner-cell">
                            {group.owner_id ? (
                              <span>ID: {group.owner_id}</span>
                            ) : (
                              <span style={{ color: '#6b7280' }}>Sem owner</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ color: '#6b7280' }}>-</span>
                        </td>
                        <td>
                          <span>{new Date(group.created_at).toLocaleDateString('pt-BR')}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="action-button"
                              onClick={async () => {
                                setIsLoadingView(true)
                                try {
                                  const groupData = await groupsService.getGroup(group.id)
                                  setViewingGroup(groupData)
                                } catch (err) {
                                  console.error('Error loading group:', err)
                                  setError('Erro ao carregar detalhes do grupo')
                                } finally {
                                  setIsLoadingView(false)
                                }
                              }}
                              title="Visualizar"
                              aria-label="Visualizar grupo"
                              disabled={isLoadingView}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              className="action-button"
                              onClick={() => setEditingGroup(group)}
                              title="Editar"
                              aria-label="Editar grupo"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              className="action-button danger"
                              onClick={() => setDeletingGroup(group)}
                              title="Excluir"
                              aria-label="Excluir grupo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  }
                  
                  // Mostrar cada fazenda do grupo
                  return group.farms.map((farm, farmIndex) => {
                    // Extrair módulos selecionados
                    let selectedModules: string[] = []
                    if (farm.modules && typeof farm.modules === 'object') {
                      if (farm.modules.enabled && Array.isArray(farm.modules.enabled)) {
                        selectedModules = farm.modules.enabled
                      } else if (Array.isArray(farm.modules)) {
                        selectedModules = farm.modules
                      }
                    }
                    
                    return (
                      <tr key={`${group.id}-${farm.id}`}>
                        <td>
                          <div className="farm-name-cell">
                            {farmIndex === 0 && (
                              <strong style={{ display: 'block', marginBottom: '4px' }}>{group.name}</strong>
                            )}
                            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                              {farm.name}
                              {farm.certificate_a1 && ` • ${farm.certificate_a1}`}
                            </span>
                          </div>
                        </td>
                        <td>
                          {farmIndex === 0 && (
                            <div className="farm-owner-cell">
                              {group.owner_id ? (
                                <span>ID: {group.owner_id}</span>
                              ) : (
                                <span style={{ color: '#6b7280' }}>Sem owner</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {selectedModules.length > 0 ? (
                            <div className="modules-chip-list">
                              {selectedModules.map((moduleKey) => {
                                const module = moduleMap[moduleKey]
                                return (
                                  <span key={moduleKey} className="module-chip">
                                    {module?.name || moduleKey}
                                  </span>
                                )
                              })}
                            </div>
                          ) : (
                            <span style={{ color: '#6b7280' }}>Nenhum módulo</span>
                          )}
                        </td>
                        <td>
                          <span>{new Date(farm.created_at).toLocaleDateString('pt-BR')}</span>
                        </td>
                        <td>
                          {farmIndex === 0 && (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="action-button"
                                onClick={async () => {
                                  setIsLoadingView(true)
                                  try {
                                    const groupData = await groupsService.getGroup(group.id)
                                    setViewingGroup(groupData)
                                  } catch (err) {
                                    console.error('Error loading group:', err)
                                    setError('Erro ao carregar detalhes do grupo')
                                  } finally {
                                    setIsLoadingView(false)
                                  }
                                }}
                                title="Visualizar"
                                aria-label="Visualizar grupo"
                                disabled={isLoadingView}
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                type="button"
                                className="action-button"
                                onClick={() => setEditingGroup(group)}
                                title="Editar"
                                aria-label="Editar grupo"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                className="action-button danger"
                                onClick={() => setDeletingGroup(group)}
                                title="Excluir"
                                aria-label="Excluir grupo"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isModalOpen && (
        <CreateGroupModal
          availableModules={MODULE_DEFINITIONS}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

      {editingGroup && (
        <EditGroupModal
          group={editingGroup}
          availableModules={MODULE_DEFINITIONS}
          onClose={() => setEditingGroup(null)}
          onSuccess={handleSuccess}
        />
      )}

      {deletingGroup && (
        <DeleteGroupModal
          group={deletingGroup}
          onClose={() => setDeletingGroup(null)}
          onSuccess={handleSuccess}
        />
      )}

      {viewingGroup && (
        <div className="modal-backdrop" onClick={() => setViewingGroup(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <header className="modal-header">
              <h2>Detalhes do Grupo</h2>
              <button type="button" className="modal-close" onClick={() => setViewingGroup(null)} aria-label="Fechar">
                <X size={20} />
              </button>
            </header>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.125rem', fontWeight: 600 }}>{viewingGroup.name}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                  Criado em {new Date(viewingGroup.created_at).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600 }}>Owner</h4>
                {viewingGroup.owner_id ? (
                  <p style={{ margin: 0, color: '#374151' }}>ID: {viewingGroup.owner_id}</p>
                ) : (
                  <p style={{ margin: 0, color: '#6b7280' }}>Sem owner atribuído</p>
                )}
              </div>

              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600 }}>
                  Fazendas ({viewingGroup.farms?.length || 0})
                </h4>
                {viewingGroup.farms && viewingGroup.farms.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {viewingGroup.farms.map((farm) => {
                      const selectedModules: string[] = []
                      if (farm.modules && typeof farm.modules === 'object') {
                        if (farm.modules.enabled && Array.isArray(farm.modules.enabled)) {
                          selectedModules.push(...farm.modules.enabled)
                        }
                      }
                      return (
                        <div key={farm.id} style={{ 
                          padding: '16px', 
                          background: '#f9fafb', 
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#1f2937' }}>
                            {farm.name}
                            {farm.certificate_a1 && (
                              <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: '8px' }}>
                                • {farm.certificate_a1}
                              </span>
                            )}
                          </p>
                          {selectedModules.length > 0 ? (
                            <div className="modules-chip-list">
                              {selectedModules.map((moduleKey) => {
                                const module = moduleMap[moduleKey]
                                return (
                                  <span key={moduleKey} className="module-chip">
                                    {module?.name || moduleKey}
                                  </span>
                                )
                              })}
                            </div>
                          ) : (
                            <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                              Nenhum módulo habilitado
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#6b7280' }}>Nenhuma fazenda cadastrada</p>
                )}
              </div>
            </div>
            <div className="form-actions" style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb' }}>
              <button 
                type="button" 
                className="primary-button" 
                onClick={() => setViewingGroup(null)}
                style={{ marginLeft: 'auto' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



