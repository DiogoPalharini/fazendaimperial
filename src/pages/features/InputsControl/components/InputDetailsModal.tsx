import { useState } from 'react'
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import AddMovementModal from './AddMovementModal'
import type { InputItem, MovementEntry } from '../types'
import { formatCurrency, formatDateTime } from '../utils'
import '../InputsControl.css'

type InputDetailsModalProps = {
  item: InputItem
  movements: MovementEntry[]
  onClose: () => void
  onSaveMovement: (movement: Omit<MovementEntry, 'id' | 'itemNome' | 'unidade'>) => void
}

export default function InputDetailsModal({
  item,
  movements,
  onClose,
  onSaveMovement,
}: InputDetailsModalProps) {
  const [showAddMovementModal, setShowAddMovementModal] = useState(false)

  const itemMovements = movements.filter((m) => m.itemId === item.id)

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
              <h3 className="modal-title">Detalhes do Insumo</h3>
              <p className="modal-subtitle">{item.nome}</p>
            </div>
            <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </button>
          </header>

          <div className="input-details-content">
            <div className="input-details-grid">
              <div className="detail-item">
                <span className="detail-label">Categoria</span>
                <strong className="detail-value">{item.categoria}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Unidade</span>
                <strong className="detail-value">{item.unidade}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Estoque Atual</span>
                <strong className="detail-value">
                  {item.estoqueAtual.toLocaleString('pt-BR')} {item.unidade}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Estoque Mínimo</span>
                <strong className="detail-value">
                  {item.estoqueMinimo.toLocaleString('pt-BR')} {item.unidade}
                </strong>
              </div>

              <div className="detail-item full-width">
                <span className="detail-label">Quantidade Total em Estoque</span>
                <strong className="detail-value">
                  {item.estoqueAtual.toLocaleString('pt-BR')} {item.unidade}
                </strong>
              </div>
            </div>

            <section className="movements-section">
              <div className="movements-section-header">
                <h4>Movimentações</h4>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setShowAddMovementModal(true)}
                >
                  <ArrowDownCircle size={18} />
                  Nova Movimentação
                </button>
              </div>

              <div className="movements-list">
                {itemMovements.length === 0 ? (
                  <p className="empty-message">Nenhuma movimentação registrada.</p>
                ) : (
                  itemMovements.map((movement) => (
                    <div key={movement.id} className="movement-item">
                      <div
                        className={`movement-icon movement-${movement.tipo === 'Entrada' ? 'entrada' : 'saida'}`}
                      >
                        {movement.tipo === 'Entrada' ? (
                          <ArrowDownCircle size={20} />
                        ) : (
                          <ArrowUpCircle size={20} />
                        )}
                      </div>
                      <div className="movement-body">
                        <div className="movement-header">
                          <strong>{movement.tipo}</strong>
                          <span>
                            {movement.quantidade.toLocaleString('pt-BR')} {movement.unidade}
                          </span>
                        </div>
                        <div className="movement-details">
                          {movement.tipo === 'Entrada' && movement.fornecedor && (
                            <div className="movement-detail-row">
                              <span className="movement-detail-label">Fornecedor:</span>
                              <span className="movement-detail-value">{movement.fornecedor}</span>
                            </div>
                          )}
                          {movement.tipo === 'Entrada' && movement.valorPago !== undefined && (
                            <div className="movement-detail-row">
                              <span className="movement-detail-label">Valor Pago:</span>
                              <span className="movement-detail-value">{formatCurrency(movement.valorPago)}</span>
                            </div>
                          )}
                          {movement.tipo === 'Entrada' && movement.parcelado !== undefined && (
                            <div className="movement-detail-row">
                              <span className="movement-detail-label">Parcelado:</span>
                              <span className="movement-detail-value">{movement.parcelado ? 'Sim' : 'Não'}</span>
                            </div>
                          )}
                          <div className="movement-detail-row">
                            <span className="movement-detail-label">Data:</span>
                            <span className="movement-detail-value">{formatDateTime(movement.data)}</span>
                          </div>
                          <div className="movement-detail-row">
                            <span className="movement-detail-label">Responsável:</span>
                            <span className="movement-detail-value">{movement.responsavel}</span>
                          </div>
                          {movement.observacao && (
                            <div className="movement-detail-row">
                              <span className="movement-detail-label">Observações:</span>
                              <span className="movement-detail-value">{movement.observacao}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {showAddMovementModal && (
        <AddMovementModal
          item={item}
          onClose={() => setShowAddMovementModal(false)}
          onSave={(movementData) => {
            onSaveMovement(movementData)
            setShowAddMovementModal(false)
          }}
        />
      )}
    </>
  )
}
