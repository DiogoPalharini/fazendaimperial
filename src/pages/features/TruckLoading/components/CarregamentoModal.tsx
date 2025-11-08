import { ChangeEvent, FormEvent, useState } from 'react'
import type { Carregamento, CarregamentoForm } from '../types'
import {
  AVAILABLE_TRUCKS,
  AVAILABLE_DRIVERS,
  AVAILABLE_FARMS,
  AVAILABLE_FIELDS,
  AVAILABLE_VARIETIES,
  AVAILABLE_UNITS,
  AVAILABLE_DESTINATIONS,
  INITIAL_FORM,
} from '../constants'
import '../TruckLoading.css'

type CarregamentoModalProps = {
  onClose: () => void
  onSave: (carregamento: CarregamentoForm) => void
}

export default function CarregamentoModal({ onClose, onSave }: CarregamentoModalProps) {
  const [formState, setFormState] = useState<CarregamentoForm>(INITIAL_FORM)
  const [erro, setErro] = useState<string | null>(null)

  const handleChange = (field: keyof CarregamentoForm) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErro(null)

    // Validação básica
    if (
      !formState.scheduledAt ||
      !formState.truck ||
      !formState.driver ||
      !formState.farm ||
      !formState.field ||
      !formState.product ||
      !formState.quantity ||
      !formState.unit ||
      !formState.destination
    ) {
      setErro('Por favor, preencha todos os campos.')
      return
    }

    onSave(formState)
    setFormState(INITIAL_FORM)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal loading-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="modal-title">Novo Carregamento</h3>
        {erro && <div className="modal-error">{erro}</div>}
        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            <div className="field">
              <label className="form-label" htmlFor="scheduledAt">
                Data/Hora
              </label>
              <input
                id="scheduledAt"
                type="datetime-local"
                className="form-input"
                value={formState.scheduledAt}
                onChange={handleChange('scheduledAt')}
                required
              />
            </div>

            <div className="field">
              <label className="form-label" htmlFor="truck">
                Caminhão
              </label>
              <select
                id="truck"
                className="form-select"
                value={formState.truck}
                onChange={handleChange('truck')}
                required
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                {AVAILABLE_TRUCKS.map((truck) => (
                  <option key={truck} value={truck}>
                    {truck}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="form-label" htmlFor="driver">
                Motorista
              </label>
              <select
                id="driver"
                className="form-select"
                value={formState.driver}
                onChange={handleChange('driver')}
                required
              >
                <option value="" disabled>
                  Selecione um motorista
                </option>
                {AVAILABLE_DRIVERS.map((driver) => (
                  <option key={driver} value={driver}>
                    {driver}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="form-label" htmlFor="farm">
                Fazenda Origem
              </label>
              <select
                id="farm"
                className="form-select"
                value={formState.farm}
                onChange={handleChange('farm')}
                required
              >
                <option value="" disabled>
                  Selecione a fazenda
                </option>
                {AVAILABLE_FARMS.map((farm) => (
                  <option key={farm} value={farm}>
                    {farm}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="form-label" htmlFor="field">
                Campo/Talhão
              </label>
              <select
                id="field"
                className="form-select"
                value={formState.field}
                onChange={handleChange('field')}
                required
              >
                <option value="" disabled>
                  Selecione o talhão
                </option>
                {AVAILABLE_FIELDS.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="form-label" htmlFor="product">
                Variedade / Produto
              </label>
              <select
                id="product"
                className="form-select"
                value={formState.product}
                onChange={handleChange('product')}
                required
              >
                <option value="" disabled>
                  Selecione a variedade
                </option>
                {AVAILABLE_VARIETIES.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="form-label" htmlFor="quantity">
                Quantidade Carregada
              </label>
              <input
                id="quantity"
                type="number"
                min={0}
                step="0.01"
                className="form-input"
                value={formState.quantity}
                onChange={handleChange('quantity')}
                required
              />
            </div>

            <div className="field">
              <label className="form-label" htmlFor="unit">
                Unidade de Medida
              </label>
              <select
                id="unit"
                className="form-select"
                value={formState.unit}
                onChange={handleChange('unit')}
                required
              >
                <option value="" disabled>
                  Selecione a unidade
                </option>
                {AVAILABLE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="form-label" htmlFor="destination">
                Destino
              </label>
              <select
                id="destination"
                className="form-select"
                value={formState.destination}
                onChange={handleChange('destination')}
                required
              >
                <option value="" disabled>
                  Selecione o destino
                </option>
                {AVAILABLE_DESTINATIONS.map((destination) => (
                  <option key={destination} value={destination}>
                    {destination}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn primary">
              Salvar carregamento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

