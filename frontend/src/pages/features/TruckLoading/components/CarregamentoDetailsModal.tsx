import { X } from 'lucide-react'
import type { Carregamento } from '../types'
import { formatDateTime } from '../utils'
import '../TruckLoading.css'

type Props = {
  carregamento: Carregamento
  onClose: () => void
}

export default function CarregamentoDetailsModal({ carregamento, onClose }: Props) {
  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="modal loading-modal loading-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
        aria-describedby="details-subtitle"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h3 id="details-title" className="modal-title">
              Detalhes do Carregamento
            </h3>
            <p id="details-subtitle" className="modal-subtitle">
              Informações completas do carregamento selecionado
            </p>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </header>

        <div className="carregamento-details-grid">
          {[
            { label: 'Data/Hora', value: formatDateTime(carregamento.scheduledAt) },
            { label: 'Caminhão', value: carregamento.truck },
            { label: 'Motorista', value: carregamento.driver },
            { label: 'Fazenda Origem', value: carregamento.farm },
            { label: 'Campo/Talhão', value: carregamento.field },
            { label: 'Variedade / Produto', value: carregamento.product },
            { label: 'Quantidade Carregada', value: `${carregamento.quantity} ${carregamento.unit}` },
            { label: 'Destino', value: carregamento.destination },
          ].map((item) => (
            <div key={item.label} className="detail-item">
              <span className="detail-label">{item.label}</span>
              <strong className="detail-value">{item.value}</strong>
            </div>
          ))}
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