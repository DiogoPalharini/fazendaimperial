import { useMemo, useState } from 'react'
import { Cloud, MapPin, Thermometer, Droplets, Wind, Gauge, Search, Filter, RefreshCw } from 'lucide-react'
import type { Sensor, Talhao, WeatherForecast, Location } from './types'
import { INITIAL_SENSORS, INITIAL_TALHOES, INITIAL_FORECASTS, LOCATIONS } from './constants'
import FarmMap from './components/FarmMap'
import {
  formatTemperature,
  formatHumidity,
  formatPressure,
  formatWindSpeed,
  formatWindDirection,
  formatPrecipitation,
  formatDateTime,
  getWeatherIcon,
  getStatusColor,
} from './utils'
import '../FeaturePage.css'
import './Meteorologia.css'

export default function Meteorologia() {
  const [sensors, setSensors] = useState<Sensor[]>(INITIAL_SENSORS)
  const [talhoes, setTalhoes] = useState<Talhao[]>(INITIAL_TALHOES)
  const [forecasts, setForecasts] = useState<WeatherForecast[]>(INITIAL_FORECASTS)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Todos')

  const filteredSensors = useMemo(() => {
    return sensors.filter((sensor) => {
      const matchesSearch = !search || sensor.nome.toLowerCase().includes(search.toLowerCase()) || sensor.localizacao.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'Todos' || sensor.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [sensors, search, statusFilter])

  const summary = useMemo(() => {
    const totalSensors = sensors.length
    const activeSensors = sensors.filter((s) => s.status === 'Ativo').length
    const avgTemperature = sensors.filter((s) => s.status === 'Ativo').reduce((acc, s) => acc + s.temperatura, 0) / Math.max(activeSensors, 1)
    const avgHumidity = sensors.filter((s) => s.status === 'Ativo').reduce((acc, s) => acc + s.umidade, 0) / Math.max(activeSensors, 1)

    return { totalSensors, activeSensors, avgTemperature, avgHumidity }
  }, [sensors])

  const handleRefresh = () => {
    // Simula atualização dos dados dos sensores
    setSensors((prev) =>
      prev.map((sensor) => ({
        ...sensor,
        temperatura: sensor.temperatura + (Math.random() * 2 - 1),
        umidade: Math.max(30, Math.min(90, sensor.umidade + (Math.random() * 4 - 2))),
        pressao: sensor.pressao + (Math.random() * 2 - 1),
        velocidadeVento: Math.max(0, sensor.velocidadeVento + (Math.random() * 2 - 1)),
        ultimaAtualizacao: new Date().toISOString(),
      }))
    )
  }

  return (
    <div className="meteorologia-page">
      <header className="meteorologia-header">
        <div>
          <h2>Meteorologia</h2>
          <p>Monitore condições climáticas, sensores e previsões do tempo em tempo real para sua fazenda.</p>
        </div>
        <button type="button" className="refresh-button" onClick={handleRefresh} title="Atualizar dados">
          <RefreshCw size={20} />
        </button>
      </header>

      <section className="meteorologia-summary">
        <article className="summary-card">
          <Thermometer size={24} />
          <div>
            <span>Temperatura média</span>
            <strong>{formatTemperature(summary.avgTemperature)}</strong>
          </div>
        </article>
        <article className="summary-card">
          <Droplets size={24} />
          <div>
            <span>Umidade média</span>
            <strong>{formatHumidity(summary.avgHumidity)}</strong>
          </div>
        </article>
        <article className="summary-card">
          <MapPin size={24} />
          <div>
            <span>Sensores ativos</span>
            <strong>{summary.activeSensors} / {summary.totalSensors}</strong>
          </div>
        </article>
        <article className="summary-card">
          <Cloud size={24} />
          <div>
            <span>Talhões monitorados</span>
            <strong>{talhoes.length}</strong>
          </div>
        </article>
      </section>

      <div className="meteorologia-content">
        <section className="map-section">
          <header className="section-header">
            <h3>Mapa da Fazenda</h3>
            <p>Visualize talhões, sensores e condições climáticas</p>
          </header>
          <div className="farm-map">
            <FarmMap
              sensors={sensors}
              talhoes={talhoes}
              onLocationClick={(location) => {
                setSelectedLocation({
                  id: location.id,
                  nome: location.nome,
                  latitude: location.lat,
                  longitude: location.lng,
                  tipo: 'Talhão',
                })
              }}
            />
            <div className="map-legend">
              <div className="legend-item">
                <div className="legend-color talhao"></div>
                <span>Talhões</span>
              </div>
              <div className="legend-item">
                <div className="legend-color sensor-ativo"></div>
                <span>Sensores Ativos</span>
              </div>
              <div className="legend-item">
                <div className="legend-color sensor-inativo"></div>
                <span>Sensores Inativos</span>
              </div>
              <div className="legend-item">
                <div className="legend-color sensor-manutenção"></div>
                <span>Em Manutenção</span>
              </div>
            </div>
          </div>
        </section>

        <section className="forecasts-section">
          <header className="section-header">
            <h3>Previsões do Tempo</h3>
            <p>Condições climáticas para as próximas horas</p>
          </header>
          <div className="forecasts-grid">
            {forecasts.map((forecast) => (
              <article key={forecast.id} className="forecast-card">
                <div className="forecast-header">
                  <div>
                    <h4>{forecast.localizacao}</h4>
                    <span className="forecast-time">{forecast.hora}</span>
                  </div>
                  <div className="weather-icon">{getWeatherIcon(forecast.condicao)}</div>
                </div>
                <div className="forecast-temp">
                  <strong>{formatTemperature(forecast.temperatura)}</strong>
                  <span>
                    {formatTemperature(forecast.temperaturaMin)} / {formatTemperature(forecast.temperaturaMax)}
                  </span>
                </div>
                <div className="forecast-details">
                  <div className="detail-item">
                    <Droplets size={16} />
                    <span>{formatHumidity(forecast.umidade)}</span>
                  </div>
                  <div className="detail-item">
                    <Wind size={16} />
                    <span>{formatWindSpeed(forecast.velocidadeVento)} {formatWindDirection(forecast.direcaoVento)}</span>
                  </div>
                  <div className="detail-item">
                    <Gauge size={16} />
                    <span>{formatPressure(forecast.pressao)}</span>
                  </div>
                  {forecast.precipitacao > 0 && (
                    <div className="detail-item">
                      <Cloud size={16} />
                      <span>{formatPrecipitation(forecast.precipitacao)}</span>
                    </div>
                  )}
                </div>
                <p className="forecast-description">{forecast.descricao}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="sensors-section">
        <header className="section-header">
          <h3>Sensores Meteorológicos</h3>
          <div className="sensors-toolbar">
            <div className="search-group">
              <Search size={18} />
              <input
                type="search"
                placeholder="Buscar sensores..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="select-group">
              <Filter size={16} />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="Todos">Todos os status</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Manutenção">Manutenção</option>
              </select>
            </div>
          </div>
        </header>
        <div className="sensors-grid">
          {filteredSensors.map((sensor) => (
            <article key={sensor.id} className="sensor-card">
              <div className="sensor-header">
                <div>
                  <h4>{sensor.nome}</h4>
                  <span className="sensor-location">{sensor.localizacao}</span>
                </div>
                <span className={`status-badge status-${sensor.status.toLowerCase()}`} style={{ backgroundColor: getStatusColor(sensor.status) }}>
                  {sensor.status}
                </span>
              </div>
              <div className="sensor-data">
                <div className="data-item">
                  <Thermometer size={18} />
                  <div>
                    <span className="data-label">Temperatura</span>
                    <strong>{formatTemperature(sensor.temperatura)}</strong>
                  </div>
                </div>
                <div className="data-item">
                  <Droplets size={18} />
                  <div>
                    <span className="data-label">Umidade</span>
                    <strong>{formatHumidity(sensor.umidade)}</strong>
                  </div>
                </div>
                <div className="data-item">
                  <Gauge size={18} />
                  <div>
                    <span className="data-label">Pressão</span>
                    <strong>{formatPressure(sensor.pressao)}</strong>
                  </div>
                </div>
                <div className="data-item">
                  <Wind size={18} />
                  <div>
                    <span className="data-label">Vento</span>
                    <strong>{formatWindSpeed(sensor.velocidadeVento)} {formatWindDirection(sensor.direcaoVento)}</strong>
                  </div>
                </div>
              </div>
              <div className="sensor-footer">
                <span className="last-update">Atualizado: {formatDateTime(sensor.ultimaAtualizacao)}</span>
              </div>
            </article>
          ))}
        </div>
        {filteredSensors.length === 0 && (
          <div className="empty-state">
            <p>Nenhum sensor encontrado com os filtros selecionados.</p>
          </div>
        )}
      </section>
    </div>
  )
}

