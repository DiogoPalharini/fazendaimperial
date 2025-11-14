import { useState, type ChangeEvent, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { InputItem, InputCategory } from '../types'
import { INPUT_CATEGORIES } from '../constants'
import '../InputsControl.css'

type AddInputModalProps = {
  onClose: () => void
  onSave: (input: Omit<InputItem, 'id'>) => void
}

const UNIDADES = ['kg', 'L', 'sc', 'un', 'm³', 'm²']

export default function AddInputModal({ onClose, onSave }: AddInputModalProps) {
  const [formState, setFormState] = useState({
    nome: '',
    categoria: '' as InputCategory | '',
    estoqueAtual: '',
    unidade: '',
    estoqueMinimo: '',
  })
  const [erro, setErro] = useState<string | null>(null)

  const handleChange = (field: keyof typeof formState) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }))
    setErro(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErro(null)

    if (!formState.nome || !formState.categoria || !formState.estoqueAtual || !formState.unidade || !formState.estoqueMinimo) {
      setErro('Por favor, preencha todos os campos.')
      return
    }

    const estoqueAtualNum = Number(formState.estoqueAtual)
    const estoqueMinimoNum = Number(formState.estoqueMinimo)

    if (Number.isNaN(estoqueAtualNum) || estoqueAtualNum < 0) {
      setErro('Estoque atual deve ser um número válido.')
      return
    }

    if (Number.isNaN(estoqueMinimoNum) || estoqueMinimoNum < 0) {
      setErro('Estoque mínimo deve ser um número válido.')
      return
    }

    onSave({
      nome: formState.nome,
      categoria: formState.categoria as InputCategory,
      estoqueAtual: estoqueAtualNum,
      unidade: formState.unidade,
      estoqueMinimo: estoqueMinimoNum,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal inputs-modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h3 className="modal-title">Adicionar Novo Insumo</h3>
            <p className="modal-subtitle">Cadastre um novo insumo no sistema</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        {erro && <div className="modal-error">{erro}</div>}

        <form className="inputs-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Nome do Insumo
              <input
                type="text"
                value={formState.nome}
                onChange={handleChange('nome')}
                placeholder="Ex: Ureia 45%"
                required
              />
            </label>
            <label>
              Categoria
              <select value={formState.categoria} onChange={handleChange('categoria')} required>
                <option value="" disabled>
                  Selecione uma categoria
                </option>
                {INPUT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Estoque Inicial
              <input
                type="number"
                min={0}
                step={0.01}
                value={formState.estoqueAtual}
                onChange={handleChange('estoqueAtual')}
                placeholder="0"
                required
              />
            </label>
            <label>
              Unidade
              <select value={formState.unidade} onChange={handleChange('unidade')} required>
                <option value="" disabled>
                  Selecione a unidade
                </option>
                {UNIDADES.map((unidade) => (
                  <option key={unidade} value={unidade}>
                    {unidade}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Estoque Mínimo
              <input
                type="number"
                min={0}
                step={0.01}
                value={formState.estoqueMinimo}
                onChange={handleChange('estoqueMinimo')}
                placeholder="0"
                required
              />
            </label>
          </div>

          <footer className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              Salvar Insumo
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

