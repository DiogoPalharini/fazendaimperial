import { useState, type ChangeEvent, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { MovementEntry, MovementType, InputItem } from '../types'
import { RESPONSAVEIS, FORNECEDORES, MOVEMENT_TYPES } from '../constants'
import '../InputsControl.css'

type AddMovementModalProps = {
  item: InputItem
  onClose: () => void
  onSave: (movement: Omit<MovementEntry, 'id' | 'itemNome' | 'unidade'>) => void
}

type MovementForm = {
  tipo: MovementType
  quantidade: string
  data: string
  responsavel: string
  fornecedor: string
  valorPago: string
  parcelado: boolean
  observacao: string
}

const emptyMovementForm: MovementForm = {
  tipo: 'Entrada',
  quantidade: '',
  data: '',
  responsavel: '',
  fornecedor: '',
  valorPago: '',
  parcelado: false,
  observacao: '',
}

export default function AddMovementModal({ item, onClose, onSave }: AddMovementModalProps) {
  const [formState, setFormState] = useState<MovementForm>(emptyMovementForm)
  const [erro, setErro] = useState<string | null>(null)

  const handleChange = (field: keyof MovementForm) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value
    setFormState((prev) => ({ ...prev, [field]: value }))
    setErro(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErro(null)

    if (!formState.quantidade || !formState.data || !formState.responsavel) {
      setErro('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    if (formState.tipo === 'Entrada') {
      if (!formState.fornecedor || !formState.valorPago) {
        setErro('Para entradas, fornecedor e valor pago são obrigatórios.')
        return
      }
    }

    const quantityNumber = Number(formState.quantidade)
    if (Number.isNaN(quantityNumber) || quantityNumber <= 0) {
      setErro('Quantidade deve ser um número válido maior que zero.')
      return
    }

    onSave({
      tipo: formState.tipo,
      itemId: item.id,
      quantidade: quantityNumber,
      data: formState.data,
      responsavel: formState.responsavel,
      fornecedor: formState.tipo === 'Entrada' ? formState.fornecedor : undefined,
      valorPago: formState.tipo === 'Entrada' && formState.valorPago ? Number(formState.valorPago) : undefined,
      parcelado: formState.tipo === 'Entrada' ? formState.parcelado : undefined,
      observacao: formState.observacao.trim() || undefined,
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
            <h3 className="modal-title">Nova Movimentação</h3>
            <p className="modal-subtitle">Insumo: {item.nome}</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        {erro && <div className="modal-error">{erro}</div>}

        <form className="inputs-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Tipo de Movimentação
              <select value={formState.tipo} onChange={handleChange('tipo')} required>
                {MOVEMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantidade
              <input
                type="number"
                min={0}
                step={0.01}
                value={formState.quantidade}
                onChange={handleChange('quantidade')}
                placeholder="0"
                required
              />
            </label>
          </div>

          {formState.tipo === 'Entrada' && (
            <>
              <div className="form-row">
                <label>
                  Fornecedor
                  <select value={formState.fornecedor} onChange={handleChange('fornecedor')} required>
                    <option value="" disabled>
                      Selecione o fornecedor
                    </option>
                    {FORNECEDORES.map((fornecedor) => (
                      <option key={fornecedor} value={fornecedor}>
                        {fornecedor}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Valor Pago (R$)
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formState.valorPago}
                    onChange={handleChange('valorPago')}
                    placeholder="0.00"
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Data/Hora
                  <input
                    type="datetime-local"
                    value={formState.data}
                    onChange={handleChange('data')}
                    required
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formState.parcelado}
                    onChange={handleChange('parcelado')}
                  />
                  <span>Compra parcelada</span>
                </label>
              </div>
            </>
          )}

          {formState.tipo === 'Saída' && (
            <div className="form-row">
              <label>
                Data/Hora
                <input
                  type="datetime-local"
                  value={formState.data}
                  onChange={handleChange('data')}
                  required
                />
              </label>
            </div>
          )}

          <div className="form-row">
            <label>
              Responsável
              <select value={formState.responsavel} onChange={handleChange('responsavel')} required>
                <option value="" disabled>
                  Selecione o responsável
                </option>
                {RESPONSAVEIS.map((responsavel) => (
                  <option key={responsavel} value={responsavel}>
                    {responsavel}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Observações
              <textarea
                placeholder="Detalhes adicionais, talhão, atividade..."
                value={formState.observacao}
                onChange={handleChange('observacao')}
                rows={3}
              />
            </label>
          </div>

          <footer className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              Salvar Movimentação
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

