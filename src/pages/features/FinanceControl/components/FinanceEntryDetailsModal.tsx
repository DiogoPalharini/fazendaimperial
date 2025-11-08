import { useState } from 'react'
import { X, Calendar, DollarSign, FileText, Building2, Edit, Trash2 } from 'lucide-react'
import type { FinanceEntry } from '../types'
import EditFinanceEntryModal from './EditFinanceEntryModal'
import '../FinanceControl.css'

type FinanceEntryDetailsModalProps = {
  entry: FinanceEntry
  onClose: () => void
  onEdit: (entry: FinanceEntry) => void
  onDelete: (id: string) => void
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR')

export default function FinanceEntryDetailsModal({ entry, onClose, onEdit, onDelete }: FinanceEntryDetailsModalProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleEdit = (updatedEntry: FinanceEntry) => {
    onEdit(updatedEntry)
    setShowEditModal(false)
  }

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(entry.id)
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
              <h3 className="modal-title">Detalhes do Lançamento</h3>
              <p className="modal-subtitle">{entry.descricao}</p>
            </div>
            <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </button>
          </header>

        <div className="input-details-content">
          <div className="input-details-grid">
            <div className="detail-item">
              <span className="detail-label">Tipo</span>
              <strong className="detail-value">
                <span className={`stock-chip entry-${entry.tipo === 'Entrada' ? 'entrada' : 'saida'}`}>
                  {entry.tipo}
                </span>
              </strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Calendar size={16} /> Data
              </span>
              <strong className="detail-value">{formatDate(entry.data)}</strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Building2 size={16} /> Centro de Custo
              </span>
              <strong className="detail-value">{entry.centroCusto}</strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">Status</span>
              <strong className="detail-value">
                <span className={`stock-chip status-${entry.status.toLowerCase()}`}>{entry.status}</span>
              </strong>
            </div>

            <div className="detail-item full-width">
              <span className="detail-label">
                <DollarSign size={16} /> Valor
              </span>
              <strong
                className={`detail-value ${entry.tipo === 'Entrada' ? 'positive-value' : 'negative-value'}`}
              >
                {entry.tipo === 'Entrada' ? '+' : '-'} {formatCurrency(entry.valor)}
              </strong>
            </div>

            {entry.documento && (
              <div className="detail-item full-width">
                <span className="detail-label">
                  <FileText size={16} /> Documento
                </span>
                <strong className="detail-value">{entry.documento}</strong>
              </div>
            )}
          </div>

          {entry.observacoes && (
            <section className="movements-section">
              <div className="movements-section-header">
                <h4>Observações</h4>
              </div>
              <div className="movements-list">
                <p style={{ padding: '16px', color: 'rgba(74, 63, 53, 0.8)' }}>{entry.observacoes}</p>
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
        <EditFinanceEntryModal
          entry={entry}
          onClose={() => setShowEditModal(false)}
          onSave={handleEdit}
        />
      )}
    </>
  )
}

