import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from '../../../contexts/LanguageContext'
import type { ModuleDefinition } from '../../../types/module'
import { groupsService, type GroupWithOwnerFarmCreate } from '../../../services/groups'
import './CreateGroupModal.css'

export interface CreateGroupModalProps {
  availableModules: ModuleDefinition[]
  onClose: () => void
  onSuccess: () => void
}

export default function CreateGroupModal({ availableModules, onClose, onSuccess }: CreateGroupModalProps) {
  const t = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedModules, setSelectedModules] = useState<string[]>([])

  const [form, setForm] = useState({
    // Step 1: Group
    groupName: '',
    focusNfeToken: '', // Nuevo campo
    // Step 2: Owner
    ownerName: '',
    ownerCpf: '',
    ownerEmail: '',
    ownerPassword: '',
    // Step 3: Farm
    farmName: '',
    // Farm Fiscal Data
    farmIe: '',
    farmPhone: '',
    farmAddress: '',
    farmNumber: '',
    farmDistrict: '',
    farmCity: '',
    farmState: '',
    farmZip: '',
    farmRegime: '1', // Default Simples
  })

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

  const validate = (): boolean => {
    if (!form.groupName.trim()) {
      setError('Nome do grupo é obrigatório')
      return false
    }
    if (!form.ownerName.trim()) {
      setError('Nome do proprietário é obrigatório')
      return false
    }
    if (!form.ownerCpf.trim()) {
      setError('CPF é obrigatório')
      return false
    }
    const cpfClean = form.ownerCpf.replace(/\D/g, '')
    if (cpfClean.length !== 11 && cpfClean.length !== 14) {
      setError('Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos')
      return false
    }
    if (!form.ownerEmail.trim()) {
      setError('Email é obrigatório')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)) {
      setError('Email inválido')
      return false
    }
    if (!form.ownerPassword.trim() || form.ownerPassword.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return false
    }
    const requiresToken = selectedModules.includes('nota-fiscal') || selectedModules.includes('carregamento')
    if (requiresToken && !form.focusNfeToken.trim()) {
      setError('Token Focus NFe é obrigatório para os módulos selecionados')
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
      const cpfClean = form.ownerCpf.replace(/\D/g, '')

      const payload: GroupWithOwnerFarmCreate = {
        group: {
          name: form.groupName.trim(),
          focus_nfe_token: form.focusNfeToken.trim() || undefined,
        },
        owner: {
          name: form.ownerName.trim(),
          cpf: cpfClean,
          email: form.ownerEmail.trim().toLowerCase(),
          password: form.ownerPassword,
        },
      }

      // Adicionar fazenda se preenchida
      if (form.farmName.trim()) {
        // Use ownerCpf as farm cnpj if it has 14 digits (CNPJ)
        const farmCnpjValue = cpfClean.length === 14 ? cpfClean : undefined;

        payload.farm = {
          name: form.farmName.trim(),
          cnpj: farmCnpjValue,
          regime_tributario: form.farmRegime,
          inscricao_estadual: form.farmIe.trim() || undefined,
          telefone: form.farmPhone.trim() || undefined,
          logradouro: form.farmAddress.trim() || undefined,
          numero: form.farmNumber.trim() || undefined,
          bairro: form.farmDistrict.trim() || undefined,
          municipio: form.farmCity.trim() || undefined,
          uf: form.farmState.trim() || undefined,
          cep: form.farmZip.replace(/\D/g, '') || undefined,
        }
      }

      await groupsService.createGroupWithOwnerFarm(payload)
      onSuccess()
      onClose()
    } catch (err: any) {
      let errorMessage = 'Erro ao criar grupo. Tente novamente.'

      if (err.response?.data) {
        const errorData = err.response.data
        if (typeof errorData === 'string') {
          errorMessage = errorData
        } else if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          } else if (Array.isArray(errorData.detail)) {
            // Pydantic validation errors
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
      console.error('Error creating group:', err)
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



  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="create-group-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="modal-header">
          <div>
            <h3>Criar Grupo de Fazendas</h3>
            <p>Preencha todas as informações abaixo</p>
          </div>
          <button type="button" className="secondary-button" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        {error && <div className="modal-error">{error}</div>}

        <form className="create-group-form" onSubmit={handleSubmit}>
          {/* Grupo */}
          <section className="form-step">
            <h4>Informações do Grupo</h4>
            <div className="form-grid">
              <label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Nome do Grupo <span className="required">*</span>
                </div>
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

          {/* Proprietário */}
          <section className="form-step">
            <h4>Dados do Proprietário</h4>
            <div className="form-grid">
              <label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Nome Completo <span className="required">*</span>
                </div>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={handleChange('ownerName')}
                  placeholder="Nome completo do proprietário"
                  required
                />
              </label>
              <label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  CPF / CNPJ <span className="required">*</span>
                </div>
                <input
                  type="text"
                  value={form.ownerCpf}
                  onChange={handleChange('ownerCpf')}
                  placeholder="CPF ou CNPJ (somente números)"
                  maxLength={18}
                  required
                />
              </label>
              <label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Email <span className="required">*</span>
                </div>
                <input
                  type="email"
                  value={form.ownerEmail}
                  onChange={handleChange('ownerEmail')}
                  placeholder="email@exemplo.com"
                  required
                />
              </label>
              <label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Senha <span className="required">*</span>
                </div>
                <input
                  type="password"
                  value={form.ownerPassword}
                  onChange={handleChange('ownerPassword')}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </label>
            </div>
          </section>

          {/* Fazenda */}
          <section className="form-step">
            <h4>Fazenda (Opcional)</h4>
            <div className="form-grid">
              <label>
                Nome da Fazenda
                <input
                  type="text"
                  value={form.farmName}
                  onChange={handleChange('farmName')}
                  placeholder="Ex: Fazenda São Paulo"
                />
              </label>


              <label>
                Telefone
                <input type="text" value={form.farmPhone} onChange={handleChange('farmPhone')} />
              </label>
            </div>

            <h5 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Endereço (Obrigatório para NFe)</h5>
            <div className="form-grid">
              <label>
                CEP
                <input type="text" value={form.farmZip} onChange={handleChange('farmZip')} maxLength={9} />
              </label>
              <label style={{ gridColumn: 'span 2' }}>
                Logradouro
                <input type="text" value={form.farmAddress} onChange={handleChange('farmAddress')} />
              </label>
              <label>
                Número
                <input type="text" value={form.farmNumber} onChange={handleChange('farmNumber')} />
              </label>
              <label>
                Bairro
                <input type="text" value={form.farmDistrict} onChange={handleChange('farmDistrict')} />
              </label>
              <label>
                Cidade
                <input type="text" value={form.farmCity} onChange={handleChange('farmCity')} />
              </label>
              <label>
                UF
                <input type="text" value={form.farmState} onChange={handleChange('farmState')} maxLength={2} />
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
                  Configurações Fiscais Obrigatórias
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

                  <label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Inscrição Estadual
                      <span className="required">*</span>
                    </div>
                    <input
                      type="text"
                      value={form.farmIe}
                      onChange={handleChange('farmIe')}
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
                      value={form.farmRegime}
                      onChange={(e: any) => setForm(p => ({ ...p, farmRegime: e.target.value }))}
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

            <div className="modules-section">
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
          </section>

          <footer className="modal-actions">
            <div className="modal-actions-right">
              <button type="button" className="secondary-button" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </button>
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar Grupo'}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  )
}

