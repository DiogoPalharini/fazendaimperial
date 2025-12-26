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

        {console.log('Detalhes Carregamento:', carregamento)}
        <div className="carregamento-details-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Dados Básicos */}
          <div className="detail-section" style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Dados Gerais</h4>
          </div>

          <div className="detail-item">
            <span className="detail-label">Status NFe</span>
            <strong className="detail-value" style={{
              color: carregamento.nfe_status === 'autorizado' ? 'green' :
                carregamento.nfe_status === 'erro' ? 'red' : 'orange'
            }}>
              {carregamento.nfe_status?.toUpperCase() || 'N/A'}
            </strong>
          </div>
          <div className="detail-item">
            <span className="detail-label">Tipo</span>
            <strong className="detail-value">{carregamento.type?.toUpperCase()}</strong>
          </div>
          <div className="detail-item">
            <span className="detail-label">Data/Hora</span>
            <strong className="detail-value">{formatDateTime(carregamento.scheduledAt)}</strong>
          </div>

          {[
            { label: 'Caminhão', value: carregamento.truck },
            { label: 'Motorista', value: carregamento.driver },
            { label: 'CPF Motorista', value: carregamento.driver_document || '-' },
            { label: 'Fazenda Origem', value: carregamento.farm },
            { label: 'Campo/Talhão', value: carregamento.field },
            { label: 'Variedade / Produto', value: carregamento.product },
            { label: 'Quantidade Carregada', value: `${carregamento.quantity} ${carregamento.unit}` },
          ].map((item) => (
            <div key={item.label} className="detail-item">
              <span className="detail-label">{item.label}</span>
              <strong className="detail-value">{item.value}</strong>
            </div>
          ))}

          {/* Destinatário */}
          <div className="detail-section" style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem', marginTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Destinatário</h4>
          </div>
          <div className="detail-item" style={{ gridColumn: 'span 2' }}>
            <span className="detail-label">Nome Destino</span>
            <strong className="detail-value">{carregamento.destination}</strong>
          </div>
          <div className="detail-item">
            <span className="detail-label">CNPJ Destino</span>
            <strong className="detail-value">{carregamento.cnpj_destinatario || '-'}</strong>
          </div>
          <div className="detail-item">
            <span className="detail-label">Inscrição Estadual</span>
            <strong className="detail-value">{carregamento.inscricao_estadual_destinatario || '-'}</strong>
          </div>
          <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
            <span className="detail-label">Endereço</span>
            <strong className="detail-value">
              {[
                carregamento.logradouro_destinatario,
                carregamento.numero_destinatario,
                carregamento.bairro_destinatario,
                carregamento.municipio_destinatario && carregamento.uf_destinatario
                  ? `${carregamento.municipio_destinatario}/${carregamento.uf_destinatario}`
                  : (carregamento.municipio_destinatario || carregamento.uf_destinatario),
                carregamento.cep_destinatario
              ].filter(Boolean).join(', ') || '-'}
            </strong>
          </div>

          {/* Pesagem */}
          <div className="detail-section" style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem', marginTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Pesagem e Qualidade</h4>
          </div>
          {[
            { label: 'Peso Bruto (kg)', value: carregamento.peso_bruto_kg },
            { label: 'Tara (kg)', value: carregamento.tara_kg },
            { label: 'Peso Líquido (kg)', value: carregamento.peso_liquido_kg },
            { label: 'Umidade (%)', value: carregamento.umidade_percent },
            { label: 'Impurezas (%)', value: carregamento.impurezas_percent },
            { label: 'Peso Final (kg)', value: carregamento.peso_recebido_final_kg },
          ].map((item) => (
            <div key={item.label} className="detail-item">
              <span className="detail-label">{item.label}</span>
              <strong className="detail-value">{item.value ? Number(item.value).toLocaleString('pt-BR') : '-'}</strong>
            </div>
          ))}

          {/* Parâmetros Usados */}
          <div className="detail-section" style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem', marginTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Parâmetros da Carga</h4>
          </div>
          <div className="detail-item">
            <span className="detail-label">Umidade Padrão</span>
            <strong className="detail-value">{carregamento.umidade_padrao}%</strong>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fator Quebra</span>
            <strong className="detail-value">{carregamento.fator_umidade}x</strong>
          </div>
          <div className="detail-item">
            <span className="detail-label">Impurezas Máx</span>
            <strong className="detail-value">{carregamento.impurezas_padrao}%</strong>
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