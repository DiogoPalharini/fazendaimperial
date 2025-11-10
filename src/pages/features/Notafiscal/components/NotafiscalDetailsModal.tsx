import { X, FileText, Calendar, User, Building2, Truck, DollarSign } from 'lucide-react'
import type { Invoice } from '../types'
import { formatCurrency, formatDateTime } from '../utils'
import '../Notafiscal.css'

type NotafiscalDetailsModalProps = {
  invoice: Invoice
  onClose: () => void
}

export default function NotafiscalDetailsModal({ invoice, onClose }: NotafiscalDetailsModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal inputs-details-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h3 className="modal-title">Detalhes da Notafiscal</h3>
            <p className="modal-subtitle">{invoice.numero}</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <div className="input-details-content">
          <div className="input-details-grid">
            <div className="detail-item">
              <span className="detail-label">
                <FileText size={16} /> Tipo
              </span>
              <strong className="detail-value">{invoice.tipo}</strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                <Calendar size={16} /> Data de Emissão
              </span>
              <strong className="detail-value">{formatDateTime(invoice.dataEmissao)}</strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">Status</span>
              <strong className="detail-value">
                <span className={`stock-chip status-${invoice.status.toLowerCase()}`}>{invoice.status}</span>
              </strong>
            </div>

            {invoice.cliente && (
              <div className="detail-item">
                <span className="detail-label">
                  <User size={16} /> Cliente
                </span>
                <strong className="detail-value">{invoice.cliente}</strong>
              </div>
            )}

            {invoice.fornecedor && (
              <div className="detail-item">
                <span className="detail-label">
                  <Building2 size={16} /> Fornecedor
                </span>
                <strong className="detail-value">{invoice.fornecedor}</strong>
              </div>
            )}

            {invoice.carregamentoId && (
              <div className="detail-item">
                <span className="detail-label">
                  <Truck size={16} /> Carregamento
                </span>
                <strong className="detail-value">{invoice.carregamentoId}</strong>
              </div>
            )}

            <div className="detail-item full-width">
              <span className="detail-label">
                <DollarSign size={16} /> Valor Total
              </span>
              <strong className="detail-value">{formatCurrency(invoice.valorTotal)}</strong>
            </div>
          </div>

          {invoice.produtos && invoice.produtos.length > 0 && (
            <section className="movements-section">
              <div className="movements-section-header">
                <h4>Produtos</h4>
              </div>
              <div className="movements-list">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Quantidade</th>
                      <th>Valor Unit.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.produtos.map((produto) => (
                      <tr key={produto.id}>
                        <td>{produto.descricao}</td>
                        <td>
                          {produto.quantidade.toLocaleString('pt-BR')} {produto.unidade}
                        </td>
                        <td>{formatCurrency(produto.valorUnitario)}</td>
                        <td>{formatCurrency(produto.valorTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        Total:
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{formatCurrency(invoice.valorTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          )}

          {invoice.servico && (
            <section className="movements-section">
              <div className="movements-section-header">
                <h4>Serviço</h4>
              </div>
              <div className="movements-list">
                <div className="movement-item">
                  <div className="movement-body">
                    <div className="movement-header">
                      <strong>{invoice.servico}</strong>
                      <span>{formatCurrency(invoice.valorTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {invoice.observacoes && (
            <section className="movements-section">
              <div className="movements-section-header">
                <h4>Observações</h4>
              </div>
              <div className="movements-list">
                <p style={{ padding: '16px', color: 'rgba(74, 63, 53, 0.8)' }}>{invoice.observacoes}</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

