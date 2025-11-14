import { X } from 'lucide-react'
import type { Carregamento } from '../types'
import { formatDateTime } from '../utils'
import '../TruckLoading.css'

type CarregamentoDetailsModalProps = {
  carregamento: Carregamento
  onClose: () => void
}

export default function CarregamentoDetailsModal({
  carregamento,
  onClose,
}: CarregamentoDetailsModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal loading-modal loading-details-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h3 className="modal-title">Detalhes do Carregamento</h3>
            <p className="modal-subtitle">Informações completas do carregamento selecionado</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <div className="carregamento-details-grid">
          <div className="detail-item">
            <span className="detail-label">Data/Hora</span>
            <strong className="detail-value">{formatDateTime(carregamento.scheduledAt)}</strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">Caminhão</span>
            <strong className="detail-value">{carregamento.truck}</strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">Motorista</span>
            <strong className="detail-value">{carregamento.driver}</strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">Fazenda Origem</span>
            <strong className="detail-value">{carregamento.farm}</strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">Campo/Talhão</span>
            <strong className="detail-value">{carregamento.field}</strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">Variedade / Produto</span>
            <strong className="detail-value">{carregamento.product}</strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">Quantidade Carregada</span>
            <strong className="detail-value">
              {carregamento.quantity} {carregamento.unit}
            </strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">Destino</span>
            <strong className="detail-value">{carregamento.destination}</strong>
          </div>
        </div>

        <footer className="modal-actions">
          <button type="button" className="btn secondary" onClick={onClose}>
            Fechar
          </button>
        </footer>
      </div>
    </div>
  )
}

