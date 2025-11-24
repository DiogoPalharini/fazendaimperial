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
    // Step 2: Owner
    ownerName: '',
    ownerCpf: '',
    ownerEmail: '',
    ownerPassword: '',
    // Step 3: Farm
    farmName: '',
    farmCertificateA1: '',
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
    if (cpfClean.length !== 11) {
      setError('CPF deve ter 11 dígitos')
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
        payload.farm = {
          name: form.farmName.trim(),
          certificate_a1: form.farmCertificateA1.trim() || undefined,
          modules: selectedModules.length > 0 ? { enabled: selectedModules } : undefined,
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

          {/* Proprietário */}
          <section className="form-step">
            <h4>Dados do Proprietário</h4>
            <div className="form-grid">
              <label>
                Nome Completo <span className="required">*</span>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={handleChange('ownerName')}
                  placeholder="Nome completo do proprietário"
                  required
                />
              </label>
              <label>
                CPF <span className="required">*</span>
                <input
                  type="text"
                  value={form.ownerCpf}
                  onChange={handleChange('ownerCpf')}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </label>
              <label>
                Email <span className="required">*</span>
                <input
                  type="email"
                  value={form.ownerEmail}
                  onChange={handleChange('ownerEmail')}
                  placeholder="email@exemplo.com"
                  required
                />
              </label>
              <label>
                Senha <span className="required">*</span>
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
                Certificate A1
                <input
                  type="text"
                  value={form.farmCertificateA1}
                  onChange={handleChange('farmCertificateA1')}
                  placeholder="Opcional"
                />
              </label>
            </div>

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

