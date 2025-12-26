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

  const [form, setForm] = useState({
    groupName: group.name,
    focusNfeToken: '', // Token Focus NFe
    ownerName: '',
    ownerCpf: '',
    ownerEmail: '',
    ownerPassword: '',
    farms: [] as Array<{
      id?: number;
      name: string;
      modules: string[];
      // Fiscal
      inscricao_estadual: string;
      regime_tributario: string;
      telefone: string;
      cep: string;
      logradouro: string;
      numero: string;
      bairro: string;
      municipio: string;
      uf: string;
    }>,
  })

  // Carregar dados completos do grupo
  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setIsLoading(true)
        const data = await groupsService.getGroup(group.id)


        // Preencher formulário com dados existentes
        setForm({
          groupName: data.name,
          focusNfeToken: data.focus_nfe_token || '',
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
              modules: Array.isArray(modules) ? modules : [],
              // Fiscal
              inscricao_estadual: farm.inscricao_estadual || '',
              regime_tributario: farm.regime_tributario || '1',
              telefone: farm.telefone || '',
              cep: farm.cep || '',
              logradouro: farm.logradouro || '',
              numero: farm.numero || '',
              bairro: farm.bairro || '',
              municipio: farm.municipio || '',
              uf: farm.uf || '',
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
      if (cpfClean.length !== 11 && cpfClean.length !== 14) {
        setError('CPF/CNPJ do proprietário deve ter 11 ou 14 dígitos')
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

    // Validação Fiscal (Se módulos ativos)
    const hasNfeOrLoading = selectedModules.includes('nota-fiscal') || selectedModules.includes('carregamento')

    if (hasNfeOrLoading) {
      if (!form.focusNfeToken.trim()) {
        setError('Token Focus NFe é obrigatório para os módulos selecionados')
        return false
      }

      // Validar campos fiscais da fazenda
      for (const farm of form.farms) {
        if (!farm.inscricao_estadual.trim()) {
          setError(`Inscrição Estadual é obrigatória para a fazenda ${farm.name}`)
          return false
        }
        // Regime is always selected via dropdown (default '1') so strictly trim check might be redundant but safe
        if (!farm.regime_tributario) {
          setError(`Regime Tributário é obrigatório para a fazenda ${farm.name}`)
          return false
        }
        if (!farm.cep.trim() || !farm.logradouro.trim() || !farm.numero.trim() || !farm.bairro.trim() || !farm.municipio.trim() || !farm.uf.trim()) {
          setError(`Endereço completo é obrigatório para a fazenda ${farm.name} (NFe)`)
          return false
        }
      }
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
          focus_nfe_token: form.focusNfeToken.trim() || undefined,
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
        payload.farms = form.farms.map(farm => {
          // Check logic for Single CNPJ: if Owner has Valid CNPJ (14), use it for Farm
          const cpfClean = form.ownerCpf.replace(/\D/g, '')
          const farmCnpjValue = cpfClean.length === 14 ? cpfClean : undefined

          return {
            id: farm.id || undefined,
            name: farm.name.trim(),
            modules: { enabled: selectedModules },
            // Fiscal
            cnpj: farmCnpjValue,
            inscricao_estadual: farm.inscricao_estadual.trim() || undefined,
            regime_tributario: farm.regime_tributario,
            telefone: farm.telefone.trim() || undefined,
            cep: farm.cep.replace(/\D/g, '') || undefined,
            logradouro: farm.logradouro.trim() || undefined,
            numero: farm.numero.trim() || undefined,
            bairro: farm.bairro.trim() || undefined,
            municipio: farm.municipio.trim() || undefined,
            uf: farm.uf.trim() || undefined,
          }
        })
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Fazenda {index + 1}</h5>
                    </div>

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
                        Telefone
                        <input
                          type="text"
                          value={farm.telefone}
                          onChange={(e) => handleFarmChange(index, 'telefone', e.target.value)}
                        />
                      </label>
                    </div>

                    <h5 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Endereço (Obrigatório para NFe)</h5>
                    <div className="form-grid">
                      <label>
                        CEP
                        <input type="text" value={farm.cep} onChange={(e) => handleFarmChange(index, 'cep', e.target.value)} maxLength={9} />
                      </label>
                      <label style={{ gridColumn: 'span 2' }}>
                        Logradouro
                        <input type="text" value={farm.logradouro} onChange={(e) => handleFarmChange(index, 'logradouro', e.target.value)} />
                      </label>
                      <label>
                        Número
                        <input type="text" value={farm.numero} onChange={(e) => handleFarmChange(index, 'numero', e.target.value)} />
                      </label>
                      <label>
                        Bairro
                        <input type="text" value={farm.bairro} onChange={(e) => handleFarmChange(index, 'bairro', e.target.value)} />
                      </label>
                      <label>
                        Cidade
                        <input type="text" value={farm.municipio} onChange={(e) => handleFarmChange(index, 'municipio', e.target.value)} />
                      </label>
                      <label>
                        UF
                        <input type="text" value={farm.uf} onChange={(e) => handleFarmChange(index, 'uf', e.target.value)} maxLength={2} />
                      </label>
                    </div>

                    {(selectedModules.includes('nota-fiscal') || selectedModules.includes('carregamento')) && (
                      <div style={{
                        marginTop: '1.5rem',
                        padding: '1.5rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <h5 style={{
                          marginTop: 0,
                          marginBottom: '1rem',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          Configurações Fiscais
                          <span style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 'normal'
                          }}>
                            Requerido para Módulos Selecionados
                          </span>
                        </h5>

                        <div className="form-grid">
                          {/* Token is Group Level, default to first farm block logic */}
                          {index === 0 && (
                            <label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Token Focus NFe (Produção)
                                <span className="required">*</span>
                              </div>
                              <input
                                type="password"
                                value={form.focusNfeToken}
                                onChange={handleChange('focusNfeToken')}
                                placeholder="Insira o Token de Produção"
                                required
                              />
                            </label>
                          )}

                          <label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              Inscrição Estadual
                              <span className="required">*</span>
                            </div>
                            <input
                              type="text"
                              value={farm.inscricao_estadual}
                              onChange={(e) => handleFarmChange(index, 'inscricao_estadual', e.target.value)}
                              placeholder="Somente números"
                              required
                            />
                          </label>

                          <label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              Regime Tributário
                              <span className="required">*</span>
                            </div>
                            <select
                              value={farm.regime_tributario}
                              onChange={(e) => handleFarmChange(index, 'regime_tributario', e.target.value)}
                              required
                            >
                              <option value="1">Simples Nacional</option>
                              <option value="2">Simples Nacional - Excesso</option>
                              <option value="3">Regime Normal</option>
                            </select>
                          </label>
                        </div>
                      </div>
                    )}
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
