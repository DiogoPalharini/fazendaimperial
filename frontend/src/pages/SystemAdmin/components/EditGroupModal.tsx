import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { ModuleDefinition } from '../../../types/module'
import { groupsService, type Group } from '../../../services/groups'
import './CreateGroupModal.css'

export interface EditGroupModalProps {
  group: Group
  availableModules: ModuleDefinition[]
  onClose: () => void
  onSuccess: () => void
}

export default function EditGroupModal({ group, availableModules, onClose, onSuccess }: EditGroupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [groupData, setGroupData] = useState<Group | null>(null)

  const [form, setForm] = useState({
    groupName: group.name,
    ownerName: '',
    ownerCpf: '',
    ownerEmail: '',
    ownerPassword: '',
    farms: [] as Array<{ id?: number; name: string; certificate_a1: string; modules: string[] }>,
  })

  // Carregar dados completos do grupo
  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setIsLoading(true)
        const data = await groupsService.getGroup(group.id)
        setGroupData(data)
        
        // Preencher formulário com dados existentes
        setForm({
          groupName: data.name,
          ownerName: data.owner?.name || '',
          ownerCpf: data.owner?.cpf || '',
          ownerEmail: data.owner?.email || '',
          ownerPassword: '', // Não carregamos senha
          farms: (data.farms || []).map(farm => {
            const modules = farm.modules && typeof farm.modules === 'object' && farm.modules.enabled
              ? farm.modules.enabled
              : []
            return {
              id: farm.id,
              name: farm.name,
              certificate_a1: farm.certificate_a1 || '',
              modules: Array.isArray(modules) ? modules : [],
            }
          }),
        })

        // Se tiver fazendas, carregar módulos da primeira
        if (data.farms && data.farms.length > 0) {
          const firstFarm = data.farms[0]
          if (firstFarm.modules && typeof firstFarm.modules === 'object' && firstFarm.modules.enabled) {
            setSelectedModules(Array.isArray(firstFarm.modules.enabled) ? firstFarm.modules.enabled : [])
          }
        }
      } catch (err) {
        setError('Erro ao carregar dados do grupo')
        console.error('Error loading group:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadGroupData()
  }, [group.id])

  const filteredModules = availableModules.filter((module) => {
    if (!search.trim()) return true
    const query = search.toLowerCase()
    return module.name.toLowerCase().includes(query) || module.description?.toLowerCase().includes(query)
  })

  const toggleModule = (moduleKey: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleKey) ? prev.filter((key) => key !== moduleKey) : [...prev, moduleKey]
    )
  }

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setError(null)
  }

  const handleFarmChange = (farmIndex: number, field: string, value: string) => {
    setForm((prev) => {
      const newFarms = [...prev.farms]
      newFarms[farmIndex] = { ...newFarms[farmIndex], [field]: value }
      return { ...prev, farms: newFarms }
    })
  }

  const validate = (): boolean => {
    if (!form.groupName.trim()) {
      setError('Nome do grupo é obrigatório')
      return false
    }
    // Owner é opcional na edição (pode já existir)
    if (form.ownerName.trim() && form.ownerCpf.trim()) {
      const cpfClean = form.ownerCpf.replace(/\D/g, '')
      if (cpfClean.length !== 11) {
        setError('CPF deve ter 11 dígitos')
        return false
      }
    }
    if (form.ownerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)) {
      setError('Email inválido')
      return false
    }
    if (form.ownerPassword.trim() && form.ownerPassword.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const payload: any = {
        group: {
          name: form.groupName.trim(),
        },
      }

      // Adicionar owner se preenchido
      if (form.ownerName.trim() || form.ownerEmail.trim() || form.ownerCpf.trim() || form.ownerPassword.trim()) {
        payload.owner = {}
        if (form.ownerName.trim()) payload.owner.name = form.ownerName.trim()
        if (form.ownerCpf.trim()) {
          const cpfClean = form.ownerCpf.replace(/\D/g, '')
          payload.owner.cpf = cpfClean
        }
        if (form.ownerEmail.trim()) payload.owner.email = form.ownerEmail.trim().toLowerCase()
        if (form.ownerPassword.trim()) payload.owner.password = form.ownerPassword
      }

      // Adicionar fazendas
      if (form.farms.length > 0) {
        payload.farms = form.farms.map(farm => ({
          id: farm.id || undefined,
          name: farm.name.trim(),
          certificate_a1: farm.certificate_a1.trim() || undefined,
          modules: selectedModules.length > 0 ? { enabled: selectedModules } : undefined,
        }))
      }

      await groupsService.updateGroupFull(group.id, payload)
      onSuccess()
      onClose()
    } catch (err: any) {
      let errorMessage = 'Erro ao atualizar grupo. Tente novamente.'
      
      if (err.response?.data) {
        const errorData = err.response.data
        if (typeof errorData === 'string') {
          errorMessage = errorData
        } else if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          } else if (Array.isArray(errorData.detail)) {
            const firstError = errorData.detail[0]
            errorMessage = firstError?.msg || errorMessage
            if (firstError?.loc) {
              const field = firstError.loc[firstError.loc.length - 1]
              errorMessage = `${field}: ${errorMessage}`
            }
          }
        }
      }
      
      setError(errorMessage)
      console.error('Error updating group:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (isLoading) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="create-group-modal" onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: '48px', textAlign: 'center' }}>Carregando dados do grupo...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="create-group-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="modal-header">
          <div>
            <h3>Editar Grupo de Fazendas</h3>
            <p>Atualize as informações abaixo</p>
          </div>
          <button type="button" className="secondary-button" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        {error && <div className="modal-error">{error}</div>}

        <form className="create-group-form" onSubmit={handleSubmit}>
          <section className="form-step">
            <h4>Informações do Grupo</h4>
            <div className="form-grid">
              <label>
                Nome do Grupo <span className="required">*</span>
                <input
                  type="text"
                  value={form.groupName}
                  onChange={handleChange('groupName')}
                  placeholder="Ex: Grupo Fazendas ABC"
                  required
                  autoFocus
                />
              </label>
            </div>
          </section>

          <section className="form-step">
            <h4>Dados do Proprietário</h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '16px' }}>
              Deixe em branco os campos que não deseja alterar. Para alterar a senha, preencha o campo senha.
            </p>
            <div className="form-grid">
              <label>
                Nome Completo
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={handleChange('ownerName')}
                  placeholder="Nome completo do proprietário"
                />
              </label>
              <label>
                CPF
                <input
                  type="text"
                  value={form.ownerCpf}
                  onChange={handleChange('ownerCpf')}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.ownerEmail}
                  onChange={handleChange('ownerEmail')}
                  placeholder="email@exemplo.com"
                />
              </label>
              <label>
                Nova Senha (deixe em branco para manter)
                <input
                  type="password"
                  value={form.ownerPassword}
                  onChange={handleChange('ownerPassword')}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </label>
            </div>
          </section>

          <section className="form-step">
            <h4>Fazendas</h4>
            {form.farms.length > 0 ? (
              <>
                {form.farms.map((farm, index) => (
                  <div key={farm.id || index} style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
                    <h5 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600 }}>Fazenda {index + 1}</h5>
                    <div className="form-grid">
                      <label>
                        Nome da Fazenda
                        <input
                          type="text"
                          value={farm.name}
                          onChange={(e) => handleFarmChange(index, 'name', e.target.value)}
                          placeholder="Ex: Fazenda São Paulo"
                        />
                      </label>
                      <label>
                        Certificate A1
                        <input
                          type="text"
                          value={farm.certificate_a1}
                          onChange={(e) => handleFarmChange(index, 'certificate_a1', e.target.value)}
                          placeholder="Opcional"
                        />
                      </label>
                    </div>
                    {index === 0 && (
                      <div className="modules-section" style={{ marginTop: '16px' }}>
                        <div className="modules-header">
                          <h4>Módulos Habilitados</h4>
                          <input
                            type="search"
                            placeholder="Buscar módulos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                          <span className="modules-count">Selecionados: {selectedModules.length}</span>
                        </div>
                        <div className="modules-grid">
                          {filteredModules.map((module) => (
                            <label key={module.key} className="module-option">
                              <input
                                type="checkbox"
                                checked={selectedModules.includes(module.key)}
                                onChange={() => toggleModule(module.key)}
                              />
                              <div>
                                <strong>{module.name}</strong>
                                <p>{module.description}</p>
                              </div>
                            </label>
                          ))}
                          {filteredModules.length === 0 && <p className="no-results">Nenhum módulo encontrado</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '24px' }}>
                Nenhuma fazenda cadastrada para este grupo.
              </p>
            )}
          </section>

          <footer className="modal-actions">
            <div className="modal-actions-right">
              <button type="button" className="secondary-button" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </button>
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  )
}
