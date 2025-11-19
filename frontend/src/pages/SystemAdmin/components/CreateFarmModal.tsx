import { useMemo, useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from '../../../contexts/LanguageContext'
import type { ModuleDefinition } from '../../../types/module'

export interface CreateFarmPayload {
  farmName: string
  farmCode: string
  cityState: string
  hectares: number | string
  ownerName: string
  ownerEmail: string
  ownerPhone?: string
  ownerPassword: string
  modules: string[]
}

type CreateFarmModalProps = {
  availableModules: ModuleDefinition[]
  onClose: () => void
  onSubmit: (payload: CreateFarmPayload) => void
}

export default function CreateFarmModal({ availableModules, onClose, onSubmit }: CreateFarmModalProps) {
  const t = useTranslation()
  const [search, setSearch] = useState('')
  const [selectedModules, setSelectedModules] = useState<string[]>(() => availableModules.map((module) => module.key))
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    farmName: '',
    farmCode: '',
    cityState: '',
    hectares: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
  })

  const groupedModules = useMemo(() => {
    const query = search.trim().toLowerCase()
    return availableModules.filter((module) => {
      if (!query) return true
      return module.name.toLowerCase().includes(query) || module.description.toLowerCase().includes(query)
    })
  }, [availableModules, search])

  const toggleModule = (moduleKey: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleKey) ? prev.filter((key) => key !== moduleKey) : [...prev, moduleKey]
    )
  }

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setError(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.farmName.trim() || !form.cityState.trim() || !form.ownerName.trim() || !form.ownerEmail.trim()) {
      setError(t('systemAdmin.modal.validation.required'))
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)) {
      setError(t('systemAdmin.modal.validation.email'))
      return
    }

    if (!selectedModules.length) {
      setError(t('systemAdmin.modal.validation.modules'))
      return
    }

    onSubmit({
      ...form,
      modules: selectedModules,
    })
  }

  // Bloquear scroll do body quando o modal estiver aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="system-admin-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="modal-header">
          <div>
            <h3>{t('systemAdmin.modal.title')}</h3>
            <p>{t('systemAdmin.modal.subtitle')}</p>
          </div>
          <button type="button" className="secondary-button" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        {error && <div className="modal-error">{error}</div>}

        <form className="system-admin-form" onSubmit={handleSubmit}>
          <section>
            <h4>{t('systemAdmin.modal.farmSection')}</h4>
            <div className="form-grid">
              <label>
                {t('systemAdmin.modal.farmName')}
                <input type="text" value={form.farmName} onChange={handleChange('farmName')} required />
              </label>
              <label>
                {t('systemAdmin.modal.farmCode')}
                <input type="text" value={form.farmCode} onChange={handleChange('farmCode')} placeholder="IMP-001" />
              </label>
              <label>
                {t('systemAdmin.modal.cityState')}
                <input type="text" value={form.cityState} onChange={handleChange('cityState')} required />
              </label>
              <label>
                {t('systemAdmin.modal.hectares')}
                <input type="number" value={form.hectares} onChange={handleChange('hectares')} min={0} />
              </label>
            </div>
          </section>

          <section>
            <h4>{t('systemAdmin.modal.ownerSection')}</h4>
            <div className="form-grid">
              <label>
                {t('systemAdmin.modal.ownerName')}
                <input type="text" value={form.ownerName} onChange={handleChange('ownerName')} required />
              </label>
              <label>
                {t('systemAdmin.modal.ownerEmail')}
                <input type="email" value={form.ownerEmail} onChange={handleChange('ownerEmail')} required />
              </label>
              <label>
                {t('systemAdmin.modal.ownerPhone')}
                <input type="tel" value={form.ownerPhone} onChange={handleChange('ownerPhone')} />
              </label>
              <label>
                {t('systemAdmin.modal.ownerPassword')}
                <input type="password" value={form.ownerPassword} onChange={handleChange('ownerPassword')} required />
              </label>
            </div>
          </section>

          <section>
            <div className="modules-header">
              <h4>{t('systemAdmin.modal.modulesSection')}</h4>
              <input
                type="search"
                placeholder={t('systemAdmin.modal.modulesSearch')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <span className="modules-count">
                {t('systemAdmin.modal.modulesSelected')}: {selectedModules.length}
              </span>
            </div>
            <div className="modules-grid">
              {groupedModules.map((module) => (
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
              {!groupedModules.length && <p>{t('systemAdmin.modal.noModuleFound')}</p>}
            </div>
          </section>

          <footer className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="primary-button">
              {t('systemAdmin.modal.submit')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

