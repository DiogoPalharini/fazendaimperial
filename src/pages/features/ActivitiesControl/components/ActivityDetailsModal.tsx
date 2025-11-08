import { useState } from 'react'
import { X, Calendar, User, MapPin, Sprout, Edit, Trash2, AlertCircle } from 'lucide-react'
import type { Activity } from '../types'
import EditActivityModal from './EditActivityModal'
import '../ActivitiesControl.css'

type ActivityDetailsModalProps = {
  activity: Activity
  onClose: () => void
  onEdit: (activity: Activity) => void
  onDelete: (id: string) => void
}

const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR')

export default function ActivityDetailsModal({ activity, onClose, onEdit, onDelete }: ActivityDetailsModalProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleEdit = (updatedActivity: Activity) => {
    onEdit(updatedActivity)
    setShowEditModal(false)
  }

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(activity.id)
      onClose()
    } else {
      setShowDeleteConfirm(true)
    }
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div
          className="modal inputs-details-modal"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="modal-header">
            <div>
              <h3 className="modal-title">Detalhes da Atividade</h3>
              <p className="modal-subtitle">{activity.titulo}</p>
            </div>
            <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </button>
          </header>

          <div className="input-details-content">
            <div className="input-details-grid">
              <div className="detail-item">
                <span className="detail-label">Tipo</span>
                <strong className="detail-value">{activity.tipo}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  <User size={16} /> Funcionário
                </span>
                <strong className="detail-value">{activity.funcionario}</strong>
              </div>

              {activity.talhao && (
                <div className="detail-item">
                  <span className="detail-label">
                    <MapPin size={16} /> Talhão
                  </span>
                  <strong className="detail-value">{activity.talhao}</strong>
                </div>
              )}

              {activity.cultura && (
                <div className="detail-item">
                  <span className="detail-label">
                    <Sprout size={16} /> Cultura
                  </span>
                  <strong className="detail-value">{activity.cultura}</strong>
                </div>
              )}

              <div className="detail-item">
                <span className="detail-label">
                  <Calendar size={16} /> Data de Início
                </span>
                <strong className="detail-value">{formatDate(activity.dataInicio)}</strong>
              </div>

              {activity.dataFim && (
                <div className="detail-item">
                  <span className="detail-label">
                    <Calendar size={16} /> Data de Fim
                  </span>
                  <strong className="detail-value">{formatDate(activity.dataFim)}</strong>
                </div>
              )}

              {activity.dataConclusao && (
                <div className="detail-item">
                  <span className="detail-label">
                    <Calendar size={16} /> Data de Conclusão
                  </span>
                  <strong className="detail-value">{formatDate(activity.dataConclusao)}</strong>
                </div>
              )}

              <div className="detail-item">
                <span className="detail-label">Status</span>
                <strong className="detail-value">
                  <span className={`stock-chip status-${activity.status.toLowerCase().replace(' ', '-')}`}>
                    {activity.status}
                  </span>
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Prioridade</span>
                <strong className="detail-value">
                  <span className={`stock-chip priority-${activity.prioridade.toLowerCase()}`}>
                    {activity.prioridade}
                  </span>
                </strong>
              </div>

              <div className="detail-item full-width">
                <span className="detail-label">Descrição</span>
                <strong className="detail-value" style={{ fontWeight: 'normal' }}>
                  {activity.descricao}
                </strong>
              </div>
            </div>

            {activity.observacoes && (
              <section className="movements-section">
                <div className="movements-section-header">
                  <h4>Observações</h4>
                </div>
                <div className="movements-list">
                  <p style={{ padding: '16px', color: 'rgba(74, 63, 53, 0.8)' }}>{activity.observacoes}</p>
                </div>
              </section>
            )}

            <footer className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowEditModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Edit size={18} /> Editar
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={handleDelete}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Trash2 size={18} /> {showDeleteConfirm ? 'Confirmar Exclusão' : 'Excluir'}
              </button>
            </footer>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditActivityModal
          activity={activity}
          onClose={() => setShowEditModal(false)}
          onSave={handleEdit}
        />
      )}
    </>
  )
}

