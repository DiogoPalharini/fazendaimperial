import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react'
import { X } from 'lucide-react'
import type { FinanceEntry, EntryType, CostCenter, PaymentStatus } from '../types'
import { ENTRY_TYPES, COST_CENTERS, PAYMENT_STATUSES } from '../constants'
import '../FinanceControl.css'

type EditFinanceEntryModalProps = {
  entry: FinanceEntry
  onClose: () => void
  onSave: (entry: FinanceEntry) => void
}

export default function EditFinanceEntryModal({ entry, onClose, onSave }: EditFinanceEntryModalProps) {
  const [formState, setFormState] = useState({
    tipo: entry.tipo,
    descricao: entry.descricao,
    centroCusto: entry.centroCusto,
    data: entry.data,
    valor: entry.valor.toString(),
    status: entry.status,
    documento: entry.documento || '',
    observacoes: entry.observacoes || '',
  })
  const [erro, setErro] = useState<string | null>(null)

  const handleChange = (field: keyof typeof formState) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }))
    setErro(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErro(null)

    if (!formState.descricao || !formState.data || !formState.valor) {
      setErro('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    const valorNum = Number(formState.valor)

    if (Number.isNaN(valorNum) || valorNum <= 0) {
      setErro('Valor deve ser um número válido maior que zero.')
      return
    }

    onSave({
      ...entry,
      tipo: formState.tipo,
      descricao: formState.descricao,
      centroCusto: formState.centroCusto,
      data: formState.data,
      valor: valorNum,
      status: formState.status,
      documento: formState.documento.trim() || undefined,
      observacoes: formState.observacoes.trim() || undefined,
    })
  }

  return (
    <div className="modal-backdrop movement-modal-backdrop" onClick={onClose}>
      <div
        className="modal inputs-modal-card movement-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h3 className="modal-title">Editar Lançamento Financeiro</h3>
            <p className="modal-subtitle">Atualize as informações do lançamento</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        {erro && <div className="modal-error">{erro}</div>}

        <form className="inputs-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Tipo
              <select value={formState.tipo} onChange={handleChange('tipo')} required>
                {ENTRY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Centro de Custo
              <select value={formState.centroCusto} onChange={handleChange('centroCusto')} required>
                {COST_CENTERS.map((center) => (
                  <option key={center} value={center}>
                    {center}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label className="full-width">
              Descrição
              <input
                type="text"
                value={formState.descricao}
                onChange={handleChange('descricao')}
                placeholder="Ex: Venda de soja - Cooperativa Alvorada"
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Data
              <input type="date" value={formState.data} onChange={handleChange('data')} required />
            </label>
            <label>
              Valor
              <input
                type="number"
                min={0}
                step={0.01}
                value={formState.valor}
                onChange={handleChange('valor')}
                placeholder="0.00"
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Status
              <select value={formState.status} onChange={handleChange('status')} required>
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Documento (opcional)
              <input
                type="text"
                value={formState.documento}
                onChange={handleChange('documento')}
                placeholder="NF-e, OS, recibo..."
              />
            </label>
          </div>

          <div className="form-row">
            <label className="full-width">
              Observações (opcional)
              <textarea
                value={formState.observacoes}
                onChange={handleChange('observacoes')}
                placeholder="Adicione observações sobre este lançamento..."
                rows={3}
              />
            </label>
          </div>

          <footer className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              Salvar Alterações
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

