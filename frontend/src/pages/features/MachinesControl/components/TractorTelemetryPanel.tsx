import { Gauge, Fuel, Droplet, Thermometer, Zap, DollarSign, Clock, MapPin } from 'lucide-react'
import type { TractorTelemetry } from '../types'
import { formatCurrency } from '../utils'

type TractorTelemetryPanelProps = {
  tractor: TractorTelemetry
}

export default function TractorTelemetryPanel({ tractor }: TractorTelemetryPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em movimento':
        return '#3a7d44'
      case 'Ligado':
        return '#e9b543'
      case 'Parado':
        return '#999'
      default:
        return '#d7263d'
    }
  }

  const getFuelColor = (level: number) => {
    if (level > 50) return '#3a7d44'
    if (level > 25) return '#e9b543'
    return '#d7263d'
  }

  const getOilColor = (level: number) => {
    if (level > 70) return '#3a7d44'
    if (level > 40) return '#e9b543'
    return '#d7263d'
  }

  return (
    <div className="tractor-telemetry-panel">
      <div className="telemetry-header">
        <div>
          <h3>{tractor.nome}</h3>
          <p>{tractor.identificacao}</p>
        </div>
        <div
          className="status-badge"
          style={{
            backgroundColor: getStatusColor(tractor.status) + '20',
            color: getStatusColor(tractor.status),
            borderColor: getStatusColor(tractor.status),
          }}
        >
          {tractor.status}
        </div>
      </div>

      <div className="telemetry-grid">
        {/* Velocidade */}
        <div className="telemetry-card">
          <div className="telemetry-icon" style={{ backgroundColor: '#3a7d4420', color: '#3a7d44' }}>
            <Gauge size={24} />
          </div>
          <div className="telemetry-content">
            <span className="telemetry-label">Velocidade</span>
            <strong className="telemetry-value">{Math.round(tractor.velocidade * 10) / 10} km/h</strong>
            {tractor.rotacaoMotor > 0 && (
              <span className="telemetry-sub">{Math.round(tractor.rotacaoMotor)} RPM</span>
            )}
          </div>
        </div>

        {/* Combustível */}
        <div className="telemetry-card">
          <div
            className="telemetry-icon"
            style={{
              backgroundColor: getFuelColor(tractor.nivelCombustivel) + '20',
              color: getFuelColor(tractor.nivelCombustivel),
            }}
          >
            <Fuel size={24} />
          </div>
          <div className="telemetry-content">
            <span className="telemetry-label">Combustível</span>
            <strong className="telemetry-value">{Math.round(tractor.nivelCombustivel)}%</strong>
            <span className="telemetry-sub">{Math.round(tractor.consumoAtual * 10) / 10} L/h</span>
          </div>
          <div className="telemetry-progress">
            <div
              className="telemetry-progress-bar"
              style={{
                width: `${Math.round(tractor.nivelCombustivel)}%`,
                backgroundColor: getFuelColor(tractor.nivelCombustivel),
              }}
            />
          </div>
        </div>

        {/* Óleo */}
        <div className="telemetry-card">
          <div
            className="telemetry-icon"
            style={{
              backgroundColor: getOilColor(tractor.nivelOleo) + '20',
              color: getOilColor(tractor.nivelOleo),
            }}
          >
            <Droplet size={24} />
          </div>
          <div className="telemetry-content">
            <span className="telemetry-label">Óleo</span>
            <strong className="telemetry-value">{Math.round(tractor.nivelOleo)}%</strong>
            <span className="telemetry-sub">{Math.round(tractor.pressaoOleo)} PSI</span>
          </div>
          <div className="telemetry-progress">
            <div
              className="telemetry-progress-bar"
              style={{
                width: `${Math.round(tractor.nivelOleo)}%`,
                backgroundColor: getOilColor(tractor.nivelOleo),
              }}
            />
          </div>
        </div>

        {/* Temperatura Motor */}
        {tractor.temperaturaMotor > 0 && (
          <div className="telemetry-card">
            <div
              className="telemetry-icon"
              style={{
                backgroundColor: tractor.temperaturaMotor > 90 ? '#d7263d20' : '#3a7d4420',
                color: tractor.temperaturaMotor > 90 ? '#d7263d' : '#3a7d44',
              }}
            >
              <Thermometer size={24} />
            </div>
            <div className="telemetry-content">
              <span className="telemetry-label">Temp. Motor</span>
              <strong className="telemetry-value">{Math.round(tractor.temperaturaMotor)}°C</strong>
              <span className="telemetry-sub">Hidráulico: {Math.round(tractor.temperaturaHidraulico)}°C</span>
            </div>
          </div>
        )}

        {/* Gasto por Hora */}
        <div className="telemetry-card">
          <div className="telemetry-icon" style={{ backgroundColor: '#3a7d4420', color: '#3a7d44' }}>
            <DollarSign size={24} />
          </div>
          <div className="telemetry-content">
            <span className="telemetry-label">Gasto por Hora</span>
            <strong className="telemetry-value">{formatCurrency(tractor.gastoPorHora)}</strong>
            <span className="telemetry-sub">Consumo: {Math.round(tractor.consumoAtual * 10) / 10} L/h</span>
          </div>
        </div>

        {/* Horas de Trabalho */}
        <div className="telemetry-card">
          <div className="telemetry-icon" style={{ backgroundColor: '#3a7d4420', color: '#3a7d44' }}>
            <Clock size={24} />
          </div>
          <div className="telemetry-content">
            <span className="telemetry-label">Horas de Trabalho</span>
            <strong className="telemetry-value">{tractor.horasTrabalho.toFixed(1)}h</strong>
            <span className="telemetry-sub">Total acumulado</span>
          </div>
        </div>

        {/* Localização */}
        <div className="telemetry-card full-width">
          <div className="telemetry-icon" style={{ backgroundColor: '#3a7d4420', color: '#3a7d44' }}>
            <MapPin size={24} />
          </div>
          <div className="telemetry-content">
            <span className="telemetry-label">Localização</span>
            <strong className="telemetry-value">
              {tractor.latitude.toFixed(4)}, {tractor.longitude.toFixed(4)}
            </strong>
            <span className="telemetry-sub">
              Última atualização: {new Date(tractor.ultimaAtualizacao).toLocaleTimeString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

