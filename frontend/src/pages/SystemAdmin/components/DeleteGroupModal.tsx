import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { groupsService, type Group } from '../../../services/groups'
import './CreateGroupModal.css'

export interface DeleteGroupModalProps {
  group: Group
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteGroupModal({ group, onClose, onSuccess }: DeleteGroupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      await groupsService.deleteGroup(group.id)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao excluir grupo. Tente novamente.')
      console.error('Error deleting group:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const farmsCount = group.farms?.length || 0
  const hasData = farmsCount > 0

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <header className="modal-header">
          <h2>Excluir Grupo</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        {error && (
          <div className="error-message" style={{ margin: '16px', padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: '#fee2e2', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={24} color="#dc2626" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>
                Tem certeza que deseja excluir este grupo?
              </h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>

          <div style={{ 
            background: '#f9fafb', 
            borderRadius: '8px', 
            padding: '16px', 
            marginBottom: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ margin: '0 0 12px 0', fontWeight: 600, color: '#374151' }}>
              Grupo: <span style={{ fontWeight: 400 }}>{group.name}</span>
            </p>
            {hasData && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#dc2626', fontWeight: 500 }}>
                  ⚠️ Atenção: Este grupo possui {farmsCount} {farmsCount === 1 ? 'fazenda' : 'fazendas'}.
                  Todas as fazendas, usuários e dados relacionados serão excluídos permanentemente.
                </p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="secondary-button" 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="primary-button" 
              onClick={handleDelete}
              disabled={isSubmitting}
              style={{ 
                background: '#dc2626', 
                borderColor: '#dc2626'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#b91c1c'
                  e.currentTarget.style.borderColor = '#b91c1c'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#dc2626'
                  e.currentTarget.style.borderColor = '#dc2626'
                }
              }}
            >
              {isSubmitting ? 'Excluindo...' : 'Sim, Excluir Grupo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

