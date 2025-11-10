import { X, Mail, Briefcase, Building2, MapPin, Calendar, User as UserIcon, Edit, Trash2 } from 'lucide-react'
import { useTranslation, useLanguage } from '../../../../contexts/LanguageContext'
import type { User } from '../types'
import { USER_ROLES } from '../constants'
import '../UsersControl.css'

type UserDetailsModalProps = {
  user: User
  onClose: () => void
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
}

export default function UserDetailsModal({ user, onClose, onEdit, onDelete }: UserDetailsModalProps) {
  const t = useTranslation()
  const { language } = useLanguage()
  const roleLabel = USER_ROLES.find((r) => r.value === user.cargo)?.label || user.cargo
  const dateLocale = language === 'pt-BR' ? 'pt-BR' : 'en-US'

  const handleDelete = () => {
    if (confirm(`${t('users.deleteConfirm')} ${user.nome}?`)) {
      onDelete(user.id)
      onClose()
    }
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
            <h3 className="modal-title">{t('users.userDetailsTitle')}</h3>
            <p className="modal-subtitle">{t('users.userDetailsSubtitle')}</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <div className="user-details-content">
          <div className="user-details-header">
            <div className="user-avatar-large">{user.avatar || '👤'}</div>
            <div className="user-details-name">
              <h4>{user.nome}</h4>
              <span className={`user-status-badge ${user.status}`}>
                {user.status === 'ativo' ? t('common.active') : t('common.inactive')}
              </span>
            </div>
          </div>

          <div className="user-details-info">
            <div className="detail-item">
              <div className="detail-label">
                <Mail size={16} />
                <span>{t('common.email')}</span>
              </div>
              <div className="detail-value">{user.email}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Briefcase size={16} />
                <span>{t('users.role')}</span>
              </div>
              <div className="detail-value">{roleLabel}</div>
            </div>

            {user.setor && (
              <div className="detail-item">
                <div className="detail-label">
                  <Building2 size={16} />
                  <span>{t('users.sector')}</span>
                </div>
                <div className="detail-value">{user.setor}</div>
              </div>
            )}

            {user.fazenda && (
              <div className="detail-item">
                <div className="detail-label">
                  <MapPin size={16} />
                  <span>{t('users.farm')}</span>
                </div>
                <div className="detail-value">{user.fazenda}</div>
              </div>
            )}

            {user.dataCriacao && (
              <div className="detail-item">
                <div className="detail-label">
                  <Calendar size={16} />
                  <span>{t('users.creationDate')}</span>
                </div>
                <div className="detail-value">
                  {new Date(user.dataCriacao).toLocaleDateString(dateLocale)}
                </div>
              </div>
            )}

            {user.ultimoAcesso && (
              <div className="detail-item">
                <div className="detail-label">
                  <UserIcon size={16} />
                  <span>{t('users.lastAccess')}</span>
                </div>
                <div className="detail-value">
                  {new Date(user.ultimoAcesso).toLocaleDateString(dateLocale)}
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              {t('common.close')}
            </button>
            <button type="button" className="primary-button" onClick={() => onEdit(user)}>
              <Edit size={16} />
              {t('common.edit')}
            </button>
            <button type="button" className="danger-button" onClick={handleDelete}>
              <Trash2 size={16} />
              {t('common.delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

