import { useState } from 'react'
import {
  FlaskConical,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Droplet,
  TestTube,
  FileText,
  Calendar,
  MapPin,
  Map as MapIcon,
} from 'lucide-react'
import type { SoilAnalysis } from './types'
import SoilMap from './components/SoilMap'
import './SoloPage.css'

const MOCK_ANALYSES: SoilAnalysis[] = [
  {
    id: '1',
    field: 'Talhão A1 • Soja',
    date: '15/10/2024',
    ph: 6.2,
    phosphorus: 15.2,
    potassium: 120.5,
    organicMatter: 3.8,
    calcium: 4.2,
    magnesium: 1.8,
    soilQuality: 'bom',
    plantQuality: 'bom',
    recommendations: [
      'Aplicar 50kg/ha de superfosfato simples',
      'Manter pH com calagem preventiva (0,5t/ha)',
      'Monitorar potássio nos próximos 60 dias',
    ],
  },
  {
    id: '2',
    field: 'Talhão B2 • Milho',
    date: '10/10/2024',
    ph: 5.1,
    phosphorus: 8.3,
    potassium: 85.2,
    organicMatter: 2.1,
    calcium: 2.8,
    magnesium: 0.9,
    soilQuality: 'critico',
    plantQuality: 'regular',
    recommendations: [
      'URGENTE: Aplicar 2,5t/ha de calcário dolomítico',
      'Aplicar 80kg/ha de MAP (fósforo)',
      'Aplicar 120kg/ha de cloreto de potássio',
      'Monitorar pH mensalmente',
    ],
  },
  {
    id: '3',
    field: 'Talhão C3 • Algodão',
    date: '08/10/2024',
    ph: 6.8,
    phosphorus: 22.5,
    potassium: 145.8,
    organicMatter: 4.2,
    calcium: 5.1,
    magnesium: 2.2,
    soilQuality: 'excelente',
    plantQuality: 'excelente',
    recommendations: [
      'Manter práticas atuais de manejo',
      'Continuar monitoramento trimestral',
    ],
  },
]

function getQualityColor(quality: SoilQuality | PlantQuality): string {
  const colors: Record<string, string> = {
    excelente: '#3A7D44',
    bom: '#6B9E4B',
    regular: '#E5E07B',
    ruim: '#F4A261',
    critico: '#D7263D',
  }
  return colors[quality] || colors.regular
}

function getQualityLabel(quality: SoilQuality | PlantQuality): string {
  const labels: Record<string, string> = {
    excelente: 'Excelente',
    bom: 'Bom',
    regular: 'Regular',
    ruim: 'Ruim',
    critico: 'Crítico',
  }
  return labels[quality] || 'Regular'
}

export default function SoloPage() {
  const [activeTab, setActiveTab] = useState<'view' | 'insert'>('view')
  const [formData, setFormData] = useState({
    field: '',
    date: '',
    ph: '',
    phosphorus: '',
    potassium: '',
    organicMatter: '',
    calcium: '',
    magnesium: '',
    observations: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você salvaria os dados
    alert('Análise de solo registrada com sucesso!')
    setFormData({
      field: '',
      date: '',
      ph: '',
      phosphorus: '',
      potassium: '',
      organicMatter: '',
      calcium: '',
      magnesium: '',
      observations: '',
    })
  }

  return (
    <div className="solo-page">
      <div className="page-header">
        <h1>Análise de Solo</h1>
        <p>Monitoramento de qualidade do solo e recomendações agronômicas</p>
      </div>

      <div className="tabs-container">
        <div className="tabs-header">
          <button
            type="button"
            className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            <FileText size={18} />
            Visualização
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'insert' ? 'active' : ''}`}
            onClick={() => setActiveTab('insert')}
          >
            <TestTube size={18} />
            Inserir Análise
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'view' && (
            <div className="view-tab">
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-icon">
                    <FlaskConical size={24} />
                  </div>
                  <div className="card-content">
                    <h3>Análises Realizadas</h3>
                    <div className="card-value">{MOCK_ANALYSES.length}</div>
                    <p>Este mês</p>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">
                    <MapPin size={24} />
                  </div>
                  <div className="card-content">
                    <h3>Talhões Monitorados</h3>
                    <div className="card-value">8</div>
                    <p>Áreas ativas</p>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="card-content">
                    <h3>Atenção Necessária</h3>
                    <div className="card-value">
                      {MOCK_ANALYSES.filter((a) => a.soilQuality === 'critico' || a.soilQuality === 'ruim').length}
                    </div>
                    <p>Talhões críticos</p>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="card-content">
                    <h3>Melhoria Média</h3>
                    <div className="card-value">+12%</div>
                    <p>Fertilidade do solo</p>
                  </div>
                </div>
              </div>

              <div className="map-section">
                <div className="map-header">
                  <h2>
                    <MapIcon size={24} />
                    Mapa dos Talhões
                  </h2>
                  <p>Visualize a qualidade do solo de cada talhão no mapa</p>
                </div>
                <div className="map-wrapper">
                  <SoilMap
                    analyses={MOCK_ANALYSES}
                    onFieldClick={(field) => {
                      // Scroll para a análise do talhão clicado
                      const element = document.getElementById(`analysis-${field}`)
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }}
                  />
                  <div className="map-legend">
                    <h4>Legenda de Qualidade</h4>
                    <div className="legend-items">
                      <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#3A7D44' }}></div>
                        <span>Excelente</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#6B9E4B' }}></div>
                        <span>Bom</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#E5E07B' }}></div>
                        <span>Regular</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#F4A261' }}></div>
                        <span>Ruim</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#D7263D' }}></div>
                        <span>Crítico</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="analyses-section">
                <h2>Análises de Solo e Planta</h2>
                <div className="analyses-list">
                  {MOCK_ANALYSES.map((analysis) => (
                    <div key={analysis.id} id={`analysis-${analysis.field}`} className="analysis-card">
                      <div className="analysis-header">
                        <div>
                          <h3>{analysis.field}</h3>
                          <span className="analysis-date">
                            <Calendar size={14} />
                            {analysis.date}
                          </span>
                        </div>
                        <div className="quality-badges">
                          <span
                            className="quality-badge"
                            style={{ backgroundColor: getQualityColor(analysis.soilQuality) }}
                          >
                            Solo: {getQualityLabel(analysis.soilQuality)}
                          </span>
                          <span
                            className="quality-badge"
                            style={{ backgroundColor: getQualityColor(analysis.plantQuality) }}
                          >
                            Planta: {getQualityLabel(analysis.plantQuality)}
                          </span>
                        </div>
                      </div>

                      <div className="analysis-grid">
                        <div className="analysis-metrics">
                          <h4>Parâmetros do Solo</h4>
                          <div className="metrics-grid">
                            <div className="metric-item">
                              <span className="metric-label">pH</span>
                              <span
                                className={`metric-value ${
                                  analysis.ph >= 6.0 && analysis.ph <= 7.0 ? 'good' : analysis.ph < 5.5 ? 'critical' : 'medium'
                                }`}
                              >
                                {analysis.ph}
                              </span>
                            </div>
                            <div className="metric-item">
                              <span className="metric-label">Fósforo (P)</span>
                              <span
                                className={`metric-value ${
                                  analysis.phosphorus >= 15 ? 'good' : analysis.phosphorus < 10 ? 'critical' : 'medium'
                                }`}
                              >
                                {analysis.phosphorus} mg/dm³
                              </span>
                            </div>
                            <div className="metric-item">
                              <span className="metric-label">Potássio (K)</span>
                              <span
                                className={`metric-value ${
                                  analysis.potassium >= 120 ? 'good' : analysis.potassium < 80 ? 'critical' : 'medium'
                                }`}
                              >
                                {analysis.potassium} mg/dm³
                              </span>
                            </div>
                            <div className="metric-item">
                              <span className="metric-label">Matéria Orgânica</span>
                              <span
                                className={`metric-value ${
                                  analysis.organicMatter >= 3.5 ? 'good' : analysis.organicMatter < 2.5 ? 'critical' : 'medium'
                                }`}
                              >
                                {analysis.organicMatter}%
                              </span>
                            </div>
                            <div className="metric-item">
                              <span className="metric-label">Cálcio (Ca)</span>
                              <span
                                className={`metric-value ${
                                  analysis.calcium >= 4.0 ? 'good' : analysis.calcium < 3.0 ? 'critical' : 'medium'
                                }`}
                              >
                                {analysis.calcium} cmol/dm³
                              </span>
                            </div>
                            <div className="metric-item">
                              <span className="metric-label">Magnésio (Mg)</span>
                              <span
                                className={`metric-value ${
                                  analysis.magnesium >= 1.5 ? 'good' : analysis.magnesium < 1.0 ? 'critical' : 'medium'
                                }`}
                              >
                                {analysis.magnesium} cmol/dm³
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="analysis-recommendations">
                          <h4>
                            <Leaf size={18} />
                            Recomendações de Aplicação
                          </h4>
                          <ul>
                            {analysis.recommendations.map((rec, idx) => (
                              <li key={idx}>
                                {rec.startsWith('URGENTE:') ? (
                                  <>
                                    <AlertTriangle size={14} className="urgent-icon" />
                                    <strong>{rec}</strong>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={14} className="check-icon" />
                                    {rec}
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insert' && (
            <div className="insert-tab">
              <div className="form-container">
                <h2>Registrar Nova Análise de Solo</h2>
                <p className="form-description">
                  Preencha os dados da análise laboratorial para gerar recomendações automáticas de correção e
                  adubação.
                </p>

                <form onSubmit={handleSubmit} className="soil-form">
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="field">
                        <MapPin size={16} />
                        Talhão/Fazenda
                      </label>
                      <input
                        id="field"
                        type="text"
                        value={formData.field}
                        onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                        placeholder="Ex: Talhão A1 • Soja"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="date">
                        <Calendar size={16} />
                        Data da Análise
                      </label>
                      <input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Parâmetros Químicos do Solo</h3>
                    <div className="form-grid">
                      <div className="form-field">
                        <label htmlFor="ph">pH (em água)</label>
                        <input
                          id="ph"
                          type="number"
                          step="0.1"
                          min="0"
                          max="14"
                          value={formData.ph}
                          onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                          placeholder="Ex: 6.2"
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="phosphorus">Fósforo (P) - mg/dm³</label>
                        <input
                          id="phosphorus"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.phosphorus}
                          onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                          placeholder="Ex: 15.2"
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="potassium">Potássio (K) - mg/dm³</label>
                        <input
                          id="potassium"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.potassium}
                          onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                          placeholder="Ex: 120.5"
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="organicMatter">Matéria Orgânica (%)</label>
                        <input
                          id="organicMatter"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={formData.organicMatter}
                          onChange={(e) => setFormData({ ...formData, organicMatter: e.target.value })}
                          placeholder="Ex: 3.8"
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="calcium">Cálcio (Ca) - cmol/dm³</label>
                        <input
                          id="calcium"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.calcium}
                          onChange={(e) => setFormData({ ...formData, calcium: e.target.value })}
                          placeholder="Ex: 4.2"
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="magnesium">Magnésio (Mg) - cmol/dm³</label>
                        <input
                          id="magnesium"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.magnesium}
                          onChange={(e) => setFormData({ ...formData, magnesium: e.target.value })}
                          placeholder="Ex: 1.8"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-field full-width">
                    <label htmlFor="observations">Observações Adicionais</label>
                    <textarea
                      id="observations"
                      rows={4}
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      placeholder="Informações complementares sobre a análise, condições do solo, histórico de cultivo, etc."
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn secondary" onClick={() => setActiveTab('view')}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn primary">
                      <FlaskConical size={18} />
                      Registrar Análise
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
