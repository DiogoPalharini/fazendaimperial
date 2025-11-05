import { ChangeEvent, FormEvent, useState } from 'react'
import './FeaturePage.css'

const availableTrucks = ['Caminhão A - Placa ABC1D23', 'Caminhão B - Placa DEF4G56', 'Caminhão C - Placa HIJ7K89']
const availableDrivers = ['João Martins', 'Carla Ribeiro', 'Pedro Duarte']
const availableFarms = ['Fazenda Imperial', 'Fazenda Aurora', 'Fazenda Esperança']
const availableFields = ['Talhão 01 - Soja', 'Talhão 07 - Milho', 'Talhão 12 - Trigo']
const availableVarieties = ['Soja Intacta', 'Milho Safrinha', 'Trigo Duplo-S']
const availableUnits = ['kg', 'ton', 'sacas']
const availableDestinations = ['Armazém Central', 'Porto Seco', 'Cliente Final - Cooperativa']

const initialForm = {
  scheduledAt: '',
  truck: '',
  driver: '',
  farm: '',
  field: '',
  product: '',
  quantity: '',
  unit: '',
  destination: '',
}

export default function TruckLoading() {
  const [formState, setFormState] = useState(initialForm)

  const handleChange = (field: keyof typeof initialForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // TODO: Integrar com backend quando disponível
    console.table(formState)
  }

  const handleReset = () => {
    setFormState(initialForm)
  }

  return (
    <div className="feature-page">
      <header className="feature-header">
        <h2 className="feature-title">Carregamento de Caminhão</h2>
        <p className="feature-description">
          Organize cada expedição com controle total sobre veículos, origens e destinos. Utilize os cadastros existentes
          de caminhões, motoristas, fazendas e talhões para garantir fidelidade das informações.
        </p>
      </header>

      <form className="feature-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label" htmlFor="scheduledAt">Data/Hora</label>
            <input
              id="scheduledAt"
              type="datetime-local"
              className="form-input"
              value={formState.scheduledAt}
              onChange={handleChange('scheduledAt')}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="truck">Caminhão</label>
            <select
              id="truck"
              className="form-select"
              value={formState.truck}
              onChange={handleChange('truck')}
              required
            >
              <option value="" disabled>Selecione uma opção</option>
              {availableTrucks.map((truck) => (
                <option key={truck} value={truck}>{truck}</option>
              ))}
            </select>
            <span className="form-hint">Cadastre novos caminhões na área de controle de máquinas.</span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="driver">Motorista</label>
            <select
              id="driver"
              className="form-select"
              value={formState.driver}
              onChange={handleChange('driver')}
              required
            >
              <option value="" disabled>Selecione um motorista</option>
              {availableDrivers.map((driver) => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>
            <span className="form-hint">Dados sincronizados com o cadastro de motoristas.</span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="farm">Fazenda Origem</label>
            <select
              id="farm"
              className="form-select"
              value={formState.farm}
              onChange={handleChange('farm')}
              required
            >
              <option value="" disabled>Selecione a fazenda</option>
              {availableFarms.map((farm) => (
                <option key={farm} value={farm}>{farm}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="field">Campo/Talhão</label>
            <select
              id="field"
              className="form-select"
              value={formState.field}
              onChange={handleChange('field')}
              required
            >
              <option value="" disabled>Selecione o talhão</option>
              {availableFields.map((field) => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="product">Variedade / Produto</label>
            <select
              id="product"
              className="form-select"
              value={formState.product}
              onChange={handleChange('product')}
              required
            >
              <option value="" disabled>Selecione a variedade</option>
              {availableVarieties.map((product) => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="quantity">Quantidade Carregada</label>
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

          <div className="form-field">
            <label className="form-label" htmlFor="unit">Unidade de Medida</label>
            <select
              id="unit"
              className="form-select"
              value={formState.unit}
              onChange={handleChange('unit')}
              required
            >
              <option value="" disabled>Selecione a unidade</option>
              {availableUnits.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="destination">Destino</label>
            <select
              id="destination"
              className="form-select"
              value={formState.destination}
              onChange={handleChange('destination')}
              required
            >
              <option value="" disabled>Selecione o destino</option>
              {availableDestinations.map((destination) => (
                <option key={destination} value={destination}>{destination}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={handleReset}>Limpar campos</button>
          <button type="submit" className="primary-button">Salvar carregamento</button>
        </div>
      </form>

      <div className="feature-highlight">
        Planeje e libere carregamentos com foco na conformidade logística da Fazenda Imperial.
      </div>
    </div>
  )
}

