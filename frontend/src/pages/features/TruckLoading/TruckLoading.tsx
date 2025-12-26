import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { formatDateTime, formatNumber } from './utils'
import { carregamentosService } from '../../../services/carregamentos'
import '../FeaturePage.css'
import './TruckLoading.css'


export default function TruckLoading() {
  const navigate = useNavigate()
  const { hasModulePermission } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterTruck, setFilterTruck] = useState('')
  const [filterFarm, setFilterFarm] = useState('')
  const [filterDestination, setFilterDestination] = useState('')

  // Default to true if user has specialized scale permission
  const [filterPendingWeight, setFilterPendingWeight] = useState(() => {
    return hasModulePermission('truck-loading', 'manage_weight')
  })

  // Fetch Carregamentos
  const { data: carregamentos = [], isLoading: loading } = useQuery({
    queryKey: ['carregamentos'],
    queryFn: async () => {
      const data = await carregamentosService.list()
      return data
    }
  })

  // Derived Filters (Unique Values from Data)
  const availableTrucks = useMemo(() => {
    const trucks = new Set(carregamentos.map(c => c.truck).filter(Boolean))
    return Array.from(trucks).sort()
  }, [carregamentos])

  const availableFarms = useMemo(() => {
    const farms = new Set(carregamentos.map(c => c.farm).filter(Boolean))
    return Array.from(farms).sort()
  }, [carregamentos])

  const availableDestinations = useMemo(() => {
    const destinations = new Set(carregamentos.map(c => c.destination).filter(Boolean))
    return Array.from(destinations).sort()
  }, [carregamentos])

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

      // Scale Operator Filter: Show only if Net Weight is 0 or null
      const matchesWeight = !filterPendingWeight || (!c.peso_liquido_kg || c.peso_liquido_kg === 0)

      return matchesSearch && matchesTruck && matchesFarm && matchesDestination && matchesWeight
    })
  }, [carregamentos, searchQuery, filterTruck, filterFarm, filterDestination, filterPendingWeight])



  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'venda': return '#10b981' // green
      case 'remessa': return '#3b82f6' // blue
      default: return '#6b7280' // gray (interno)
    }
  }

  const getDiffColor = (diff: number | undefined | null) => {
    if (diff === undefined || diff === null) return 'inherit'
    if (diff < -100) return '#ef4444' // red
    if (diff >= -100 && diff <= -20) return '#eab308' // yellow
    return 'inherit'
  }

  return (
    <div className="feature-page loading-page">
      <header className="feature-header">
        <h2 className="feature-title">Carregamento de Caminhão</h2>
        <p className="feature-description">
          Organize cada expedição com controle total sobre veículos, origens e destinos.
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
          {/* Toggle for Pending Weight */}
          <button
            className={`filter-toggle ${filterPendingWeight ? 'active' : ''}`}
            onClick={() => setFilterPendingWeight(!filterPendingWeight)}
            title={filterPendingWeight ? "Mostrando apenas pendentes de pesagem" : "Gatilho de pesagem desativado"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 12px',
              height: '42px',
              border: filterPendingWeight ? '1px solid #10b981' : '1px solid #d1d5db',
              backgroundColor: filterPendingWeight ? '#ecfdf5' : 'white',
              color: filterPendingWeight ? '#047857' : '#374151',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
          >
            <Filter size={18} />
            <span>Pendente Pesagem</span>
          </button>

          <div className="select-group">
            <label className="select-label">Caminhão:</label>
            <select
              className="select"
              value={filterTruck}
              onChange={(e) => setFilterTruck(e.target.value)}
            >
              <option value="">Todos</option>
              {availableTrucks.map((truck) => (
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
              {availableFarms.map((farm) => (
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
              {availableDestinations.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="loading-actions">
        {hasModulePermission('truck-loading', 'create') && (
          <button type="button" className="add-button" onClick={() => navigate('/carregamento/novo')}>
            <Plus size={20} />
            Adicionar Carregamento
          </button>
        )}
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">Carregando...</div>
        ) : carregamentosFiltrados.length === 0 ? (
          <div className="empty">Nenhum carregamento encontrado.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Caminhão</th>
                <th>Motorista</th>
                <th>Fazenda</th>
                <th>Destino</th>
                <th>Talhão</th>
                <th>Produto</th>
                <th>Peso Est. (kg)</th>
                <th>Peso Líq. (kg)</th>
                <th>Desc. Faz. (kg)</th>
                <th>Desc. Arm. (kg)</th>
                <th>Diferença (kg)</th>
                <th>Tipo</th>
                <th>Status NFe</th>
              </tr>
            </thead>
            <tbody>
              {carregamentosFiltrados.map((carregamento, index) => {
                const diff = carregamento.peso_com_desconto_fazenda && carregamento.peso_com_desconto_armazem
                  ? carregamento.peso_com_desconto_fazenda - carregamento.peso_com_desconto_armazem
                  : null

                return (
                  <tr
                    key={carregamento.id}
                    className={`carregamento-row ${index % 2 === 0 ? 'alt' : ''}`}
                    onClick={() => navigate(`/carregamento/${carregamento.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <td>{formatDateTime(carregamento.scheduledAt)}</td>
                    <td>{carregamento.truck}</td>
                    <td>{carregamento.driver}</td>
                    <td>{carregamento.farm}</td>
                    <td>{carregamento.destination}</td>
                    <td>{carregamento.field}</td>
                    <td>{carregamento.product}</td>
                    <td>{formatNumber(carregamento.peso_estimado_kg)}</td>
                    <td>{formatNumber(carregamento.peso_liquido_kg)}</td>
                    <td>{formatNumber(carregamento.peso_com_desconto_fazenda)}</td>
                    <td>{formatNumber(carregamento.peso_com_desconto_armazem)}</td>
                    <td style={{ color: getDiffColor(diff), fontWeight: diff && diff < -20 ? 'bold' : 'normal' }}>
                      {formatNumber(diff)}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: 'white',
                        backgroundColor: getBadgeColor(carregamento.type)
                      }}>
                        {carregamento.type?.toUpperCase()}
                      </span>
                    </td>
                    <td>{carregamento.nfe_status || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
