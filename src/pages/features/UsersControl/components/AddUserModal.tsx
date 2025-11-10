import { useState, type ChangeEvent, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from '../../../../contexts/LanguageContext'
import type { User, UserRole, UserStatus } from '../types'
import { USER_ROLES, SETORES, FAZENDAS } from '../constants'
import '../UsersControl.css'

type AddUserModalProps = {
  onClose: () => void
  onSave: (user: Omit<User, 'id' | 'avatar' | 'dataCriacao' | 'ultimoAcesso'>) => void
  userEditando?: User | null
}

export default function AddUserModal({ onClose, onSave, userEditando }: AddUserModalProps) {
  const t = useTranslation()
  const [formState, setFormState] = useState({
    nome: userEditando?.nome || '',
    email: userEditando?.email || '',
    senha: '',
    cargo: (userEditando?.cargo || 'funcionario-comum') as UserRole,
    setor: userEditando?.setor || '',
    status: (userEditando?.status || 'ativo') as UserStatus,
    fazenda: userEditando?.fazenda || '',
  })
  const [erro, setErro] = useState<string | null>(null)

  const handleChange = (field: keyof typeof formState) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }))
    setErro(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErro(null)

    if (!formState.nome.trim() || !formState.email.trim()) {
      setErro(t('users.fillRequiredFields'))
      return
    }

    if (!userEditando && !formState.senha.trim()) {
      setErro(t('users.passwordRequired'))
      return
    }

    if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      setErro(t('users.invalidEmail'))
      return
    }

    onSave({
      nome: formState.nome.trim(),
      email: formState.email.trim(),
      senha: formState.senha || undefined,
      cargo: formState.cargo,
      setor: formState.setor || undefined,
      status: formState.status,
      fazenda: formState.fazenda || undefined,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal inputs-modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h3 className="modal-title">{userEditando ? t('users.editUserTitle') : t('users.createUserTitle')}</h3>
            <p className="modal-subtitle">
              {userEditando ? t('users.editUserSubtitle') : t('users.createUserSubtitle')}
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        {erro && <div className="modal-error">{erro}</div>}

        <form className="inputs-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="full-width">
              {t('users.fullName')}
              <input
                type="text"
                value={formState.nome}
                onChange={handleChange('nome')}
                placeholder="Ex: João Silva"
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label className="full-width">
              {t('common.email')}
              <input
                type="email"
                value={formState.email}
                onChange={handleChange('email')}
                placeholder="Ex: joao.silva@fazenda.com"
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label className="full-width">
              {userEditando ? t('users.newPassword') : t('common.password')}
              <input
                type="password"
                value={formState.senha}
                onChange={handleChange('senha')}
                placeholder={userEditando ? t('users.passwordPlaceholder') : t('users.passwordPlaceholderNew')}
                required={!userEditando}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              {t('users.role')}
              <select value={formState.cargo} onChange={handleChange('cargo')} required>
                {USER_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('users.sector')} ({t('common.optional')})
              <select value={formState.setor} onChange={handleChange('setor')}>
                <option value="">{t('common.none')}</option>
                {SETORES.map((setor) => (
                  <option key={setor} value={setor}>
                    {setor}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              {t('users.farm')} ({t('common.optional')})
              <select value={formState.fazenda} onChange={handleChange('fazenda')}>
                <option value="">{t('common.none')}</option>
                {FAZENDAS.map((fazenda) => (
                  <option key={fazenda} value={fazenda}>
                    {fazenda}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('common.status')}
              <select value={formState.status} onChange={handleChange('status')} required>
                <option value="ativo">{t('common.active')}</option>
                <option value="inativo">{t('common.inactive')}</option>
              </select>
            </label>
          </div>

          <footer className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="primary-button">
              {userEditando ? t('users.saveChanges') : t('users.createUserButton')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

