import { useState, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import CarregamentoModal from './components/CarregamentoModal'
import CarregamentoDetailsModal from './components/CarregamentoDetailsModal'
import { formatDateTime } from './utils'
import type { Carregamento, CarregamentoForm } from './types'
import {
  AVAILABLE_TRUCKS,
  AVAILABLE_FARMS,
  AVAILABLE_DESTINATIONS,
  MOCK_CARREGAMENTOS,
} from './constants'
import '../FeaturePage.css'
import './TruckLoading.css'

export default function TruckLoading() {
  const [carregamentos, setCarregamentos] = useState<Carregamento[]>(MOCK_CARREGAMENTOS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTruck, setFilterTruck] = useState('')
  const [filterFarm, setFilterFarm] = useState('')
  const [filterDestination, setFilterDestination] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCarregamento, setSelectedCarregamento] = useState<Carregamento | null>(null)

  const carregamentosFiltrados = useMemo(() => {
    return carregamentos.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.truck.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.product.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTruck = !filterTruck || c.truck === filterTruck
      const matchesFarm = !filterFarm || c.farm === filterFarm
      const matchesDestination = !filterDestination || c.destination === filterDestination

      return matchesSearch && matchesTruck && matchesFarm && matchesDestination
    })
  }, [carregamentos, searchQuery, filterTruck, filterFarm, filterDestination])

  const handleSave = (carregamento: CarregamentoForm) => {
    const novoCarregamento: Carregamento = {
      ...carregamento,
      id: String(Date.now()),
    }
    setCarregamentos((prev) => [novoCarregamento, ...prev])
    setModalOpen(false)
  }

  return (
    <div className="feature-page loading-page">
      <header className="feature-header">
        <h2 className="feature-title">Carregamento de Caminhão</h2>
        <p className="feature-description">
          Organize cada expedição com controle total sobre veículos, origens e destinos. Utilize os
          cadastros existentes de caminhões, motoristas, fazendas e talhões para garantir fidelidade
          das informações.
        </p>
      </header>

      <div className="loading-toolbar">
        <div className="search-group">
          <Search size={20} />
          <input
            type="text"
            className="input"
            placeholder="Buscar por caminhão, motorista ou produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="select-group">
            <label className="select-label">Caminhão:</label>
            <select
              className="select"
              value={filterTruck}
              onChange={(e) => setFilterTruck(e.target.value)}
            >
              <option value="">Todos</option>
              {AVAILABLE_TRUCKS.map((truck) => (
                <option key={truck} value={truck}>
                  {truck}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <label className="select-label">Fazenda:</label>
            <select
              className="select"
              value={filterFarm}
              onChange={(e) => setFilterFarm(e.target.value)}
            >
              <option value="">Todas</option>
              {AVAILABLE_FARMS.map((farm) => (
                <option key={farm} value={farm}>
                  {farm}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <label className="select-label">Destino:</label>
            <select
              className="select"
              value={filterDestination}
              onChange={(e) => setFilterDestination(e.target.value)}
            >
              <option value="">Todos</option>
              {AVAILABLE_DESTINATIONS.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="add-button" onClick={() => setModalOpen(true)}>
          <Plus size={20} />
          Adicionar Carregamento
        </button>
      </div>

      <div className="table-wrapper">
        {carregamentosFiltrados.length === 0 ? (
          <div className="empty">Nenhum carregamento encontrado.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Caminhão</th>
                <th>Motorista</th>
                <th>Fazenda</th>
                <th>Talhão</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Destino</th>
              </tr>
            </thead>
            <tbody>
              {carregamentosFiltrados.map((carregamento, index) => (
                <tr
                  key={carregamento.id}
                  className={`carregamento-row ${index % 2 === 0 ? 'alt' : ''}`}
                  onClick={() => setSelectedCarregamento(carregamento)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedCarregamento(carregamento)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <td>{formatDateTime(carregamento.scheduledAt)}</td>
                  <td>{carregamento.truck}</td>
                  <td>{carregamento.driver}</td>
                  <td>{carregamento.farm}</td>
                  <td>{carregamento.field}</td>
                  <td>{carregamento.product}</td>
                  <td>
                    {carregamento.quantity} {carregamento.unit}
                  </td>
                  <td>{carregamento.destination}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <CarregamentoModal onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}

      {selectedCarregamento && (
        <CarregamentoDetailsModal
          carregamento={selectedCarregamento}
          onClose={() => setSelectedCarregamento(null)}
        />
      )}
    </div>
  )
}

