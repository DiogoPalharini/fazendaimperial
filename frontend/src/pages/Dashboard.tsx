import './Dashboard.css'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts'
import {
  Sprout,
  Wheat,
  TrendingUp,
  Droplet,
  ThermometerSun,
  Wind,
  Truck,
  AlertTriangle,
  Sun,
  Droplets,
  Leaf,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Calendar,
  Percent,
} from 'lucide-react'

const SUMMARY_CARDS = [
  {
    id: 'area',
    title: 'Área cultivada',
    value: '1.280 ha',
    detail: 'Safra verão 24/25 • 62% colhida',
    trend: '+4,2%',
    trendDirection: 'up' as const,
    icon: Sprout,
    color: '#3A7D44',
  },
  {
    id: 'producao',
    title: 'Produção prevista',
    value: '42.650 t',
    detail: 'Soja 64 sc/ha • Milho 154 sc/ha',
    trend: '+6,1%',
    trendDirection: 'up' as const,
    icon: Wheat,
    color: '#6B9E4B',
  },
  {
    id: 'receita',
    title: 'Receita projetada',
    value: 'R$ 35,4 mi',
    detail: 'Margem operacional: 27%',
    trend: '+8,6%',
    trendDirection: 'up' as const,
    icon: DollarSign,
    color: '#A9C44C',
  },
  {
    id: 'hidrico',
    title: 'Índice hídrico',
    value: '82%',
    detail: 'Captação 37,8 mm • últimos 7 dias',
    trend: '-3,1%',
    trendDirection: 'down' as const,
    icon: Droplet,
    color: '#4A90E2',
  },
]

const PRODUCTION_METRICS = {
  total: 42650,
  soja: { value: 18240, productivity: '64 sc/ha', area: '285 ha' },
  milho: { value: 15480, productivity: '154 sc/ha', area: '100 ha' },
  algodao: { value: 4220, productivity: '272 @/ha', area: '15 ha' },
  feijao: { value: 2710, productivity: '52 sc/ha', area: '52 ha' },
}

const FINANCIAL_FLOW = [
  { name: 'Jun', receita: 3.9, custos: 2.6, lucro: 1.3 },
  { name: 'Jul', receita: 4.6, custos: 2.8, lucro: 1.8 },
  { name: 'Ago', receita: 5.4, custos: 3.0, lucro: 2.4 },
  { name: 'Set', receita: 6.3, custos: 3.3, lucro: 3.0 },
  { name: 'Out', receita: 7.2, custos: 3.8, lucro: 3.4 },
  { name: 'Nov', receita: 7.8, custos: 4.1, lucro: 3.7 },
]


const WEATHER_NOW = {
  location: 'Sede • Fazenda Imperial',
  condition: 'Céu parcialmente nublado',
  temperature: '27°C',
  feelsLike: '30°C',
  humidity: '72%',
  wind: '11 km/h NE',
  rainfall: '6,4 mm nas últimas 24h',
  evapotranspiration: '5,1 mm/dia',
  rainProbability: '60% nas próximas 24h',
}

const HARVEST_MANAGEMENT = {
  activeHarvests: 3,
  totalArea: 1280,
  plantedArea: 795,
  harvestedArea: 495,
  inDevelopment: [
    {
      id: 'soja-2024',
      name: 'Soja 2024/2025',
      culture: 'Soja',
      area: 500,
      plantedArea: 500,
      phase: 'Desenvolvimento',
      progress: 65,
      daysSincePlanting: 45,
      expectedHarvest: '15 Fev 2025',
      status: 'em_andamento' as const,
    },
    {
      id: 'milho-2024',
      name: 'Milho 2ª Safra 2024',
      culture: 'Milho',
      area: 285,
      plantedArea: 285,
      phase: 'Florescimento',
      progress: 42,
      daysSincePlanting: 28,
      expectedHarvest: '25 Jan 2025',
      status: 'em_andamento' as const,
    },
    {
      id: 'algodao-2024',
      name: 'Algodão 2024/2025',
      culture: 'Algodão',
      area: 10,
      plantedArea: 10,
      phase: 'Plantio',
      progress: 8,
      daysSincePlanting: 3,
      expectedHarvest: '20 Mar 2025',
      status: 'iniciando' as const,
    },
  ],
  completed: [
    {
      id: 'soja-2023',
      name: 'Soja 2023/2024',
      culture: 'Soja',
      area: 485,
      production: 29100,
      productivity: '60 sc/ha',
      revenue: 'R$ 4,36 mi',
      status: 'colhida' as const,
    },
  ],
}

const LOGISTICS_STATUS = {
  departuresToday: 11,
  averageTime: '3h02',
  loadingProgress: 0.68,
  nextDepartures: [
    {
      id: 'ENT-031',
      product: 'Soja • 34 t',
      destination: 'Terminal Porto de Santos',
      time: '14h30',
    },
    {
      id: 'ENT-028',
      product: 'Milho • 27 t',
      destination: 'Cooperativa Vale Verde',
      time: '16h00',
    },
  ],
}

const RISK_ALERTS = [
  {
    id: 'pragas',
    type: 'danger' as const,
    title: 'Pressão de pragas',
    description: 'Lagarta-do-cartucho acima do nível crítico em 18 ha de milho.',
    recommendation: 'Aplicar controle biológico até amanhã às 10h.',
    urgent: true,
  },
  {
    id: 'clima',
    type: 'warn' as const,
    title: 'Frente fria prevista',
    description: 'Queda de 6°C entre sexta e sábado com rajadas acima de 45 km/h.',
    recommendation: 'Reprogramar plantio noturno e proteger insumos sensíveis.',
    urgent: false,
  },
  {
    id: 'financeiro',
    type: 'info' as const,
    title: 'Oportunidade de hedge',
    description: 'Contrato de soja futuro Jan/26 com prêmio positivo de R$ 3,15/sc na B3.',
    recommendation: 'Avaliar hedge para 40% da produção prevista.',
    urgent: false,
  },
]

const FIELD_MONITORING = [
  {
    id: 'talhao-s4',
    name: 'Talhão S4',
    crop: 'Soja ciclo 132 dias',
    area: '38 ha',
    ndvi: 0.82,
    soilMoisture: '24% VWC',
    trend: '+0,02',
    statusLabel: 'Excelente',
    statusType: 'excellent' as const,
  },
  {
    id: 'talhao-m7',
    name: 'Talhão M7',
    crop: 'Milho segunda safra',
    area: '42 ha',
    ndvi: 0.74,
    soilMoisture: '18% VWC',
    trend: '-0,03',
    statusLabel: 'Atenção: umidade baixa',
    statusType: 'warn' as const,
  },
  {
    id: 'talhao-c2',
    name: 'Talhão C2',
    crop: 'Algodão fibra longa',
    area: '27 ha',
    ndvi: 0.79,
    soilMoisture: '27% VWC',
    trend: '+0,01',
    statusLabel: 'Colheita em 5 dias',
    statusType: 'info' as const,
  },
]

export default function Dashboard() {
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>{greeting}, Diogo 👋</h1>
          <p>Visão geral da operação • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </header>

      <section className="summary-grid">
        {SUMMARY_CARDS.map(({ id, icon: Icon, title, value, detail, trend, trendDirection, color }) => (
          <article key={id} className="summary-card">
            <div className="summary-card-bg" style={{ backgroundColor: `${color}15` }}></div>
            <header className="summary-card-header">
              <div className="summary-icon-wrapper" style={{ backgroundColor: `${color}20` }}>
                <Icon size={24} style={{ color }} />
              </div>
              <div className="summary-header-text">
                <h2 className="summary-title">{title}</h2>
                <div className="summary-value">{value}</div>
              </div>
            </header>
            <p className="summary-detail">{detail}</p>
            <footer className="summary-footer">
              <span className={`summary-trend ${trendDirection}`}>
                {trendDirection === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trend}
              </span>
              <span className="summary-trend-label">vs. período anterior</span>
            </footer>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="chart-card financial-card">
          <header className="card-header">
            <div>
              <h3>Evolução financeira</h3>
              <span>Últimos 6 meses (R$ milhões)</span>
            </div>
          </header>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={FINANCIAL_FLOW}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d1" />
                <XAxis dataKey="name" stroke="#4a3f35" fontSize={12} />
                <YAxis stroke="#4a3f35" fontSize={12} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const formatted = `R$ ${value.toFixed(1).replace('.', ',')} mi`
                    const labels: Record<string, string> = { receita: 'Receita', custos: 'Custos', lucro: 'Lucro' }
                    return [formatted, labels[name] || name]
                  }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #eee7d8',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                />
                <Bar dataKey="receita" name="Receita" fill="#3A7D44" radius={[4, 4, 0, 0]} />
                <Bar dataKey="custos" name="Custos" fill="#d4a373" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lucro" name="Lucro" fill="#6B9E4B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel-card production-card">
          <header className="panel-header">
            <div>
              <h3>Produção por cultura</h3>
              <span>Total: {PRODUCTION_METRICS.total.toLocaleString('pt-BR')} t</span>
            </div>
            <Wheat size={22} />
          </header>
          <div className="production-metrics">
            <div className="production-item">
              <div className="production-header">
                <strong>Soja</strong>
                <span className="production-area">{PRODUCTION_METRICS.soja.area}</span>
              </div>
              <div className="production-values">
                <span className="production-value">{PRODUCTION_METRICS.soja.value.toLocaleString('pt-BR')} t</span>
                <span className="production-productivity">{PRODUCTION_METRICS.soja.productivity}</span>
              </div>
            </div>
            <div className="production-item">
              <div className="production-header">
                <strong>Milho</strong>
                <span className="production-area">{PRODUCTION_METRICS.milho.area}</span>
              </div>
              <div className="production-values">
                <span className="production-value">{PRODUCTION_METRICS.milho.value.toLocaleString('pt-BR')} t</span>
                <span className="production-productivity">{PRODUCTION_METRICS.milho.productivity}</span>
              </div>
            </div>
            <div className="production-item">
              <div className="production-header">
                <strong>Algodão</strong>
                <span className="production-area">{PRODUCTION_METRICS.algodao.area}</span>
              </div>
              <div className="production-values">
                <span className="production-value">{PRODUCTION_METRICS.algodao.value.toLocaleString('pt-BR')} t</span>
                <span className="production-productivity">{PRODUCTION_METRICS.algodao.productivity}</span>
              </div>
            </div>
            <div className="production-item">
              <div className="production-header">
                <strong>Feijão</strong>
                <span className="production-area">{PRODUCTION_METRICS.feijao.area}</span>
              </div>
              <div className="production-values">
                <span className="production-value">{PRODUCTION_METRICS.feijao.value.toLocaleString('pt-BR')} t</span>
                <span className="production-productivity">{PRODUCTION_METRICS.feijao.productivity}</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel-card weather-card">
          <header className="panel-header">
            <div>
              <h3>Clima atual</h3>
              <span>{WEATHER_NOW.location}</span>
            </div>
            <div className="weather-icon">
              <Sun size={24} />
            </div>
          </header>
          <div className="weather-compact">
            <div className="weather-temp-compact">
              <ThermometerSun size={32} />
              <div>
                <strong>{WEATHER_NOW.temperature}</strong>
                <span>Sensação {WEATHER_NOW.feelsLike}</span>
              </div>
            </div>
            <div className="weather-metrics-compact">
              <div className="weather-metric-compact">
                <Droplets size={16} />
                <span>{WEATHER_NOW.humidity}</span>
              </div>
              <div className="weather-metric-compact">
                <Wind size={16} />
                <span>{WEATHER_NOW.wind}</span>
              </div>
              <div className="weather-metric-compact">
                <Droplet size={16} />
                <span>{WEATHER_NOW.rainfall}</span>
              </div>
              <div className="weather-metric-compact">
                <TrendingUp size={16} />
                <span>{WEATHER_NOW.evapotranspiration}</span>
              </div>
            </div>
            <div className="weather-footer-compact">
              <Clock size={14} />
              <span>{WEATHER_NOW.rainProbability}</span>
            </div>
          </div>
        </article>


        <article className="panel-card logistics-card">
          <header className="panel-header">
            <div>
              <h3>Logística</h3>
              <span>Carregamentos e expedições</span>
            </div>
            <Truck size={22} />
          </header>
          <div className="logistics-compact">
            <div className="logistics-stats-compact">
              <div className="logistics-stat-compact">
                <strong>{LOGISTICS_STATUS.departuresToday}</strong>
                <span>Saídas hoje</span>
              </div>
              <div className="logistics-stat-compact">
                <strong>{LOGISTICS_STATUS.averageTime}</strong>
                <span>Tempo médio</span>
              </div>
            </div>
            <div className="logistics-progress-compact">
              <div className="progress-header-compact">
                <span>Progresso do dia</span>
                <strong>{Math.round(LOGISTICS_STATUS.loadingProgress * 100)}%</strong>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.round(LOGISTICS_STATUS.loadingProgress * 100)}%` }}
                  aria-hidden
                ></div>
              </div>
            </div>
            <div className="logistics-next-compact">
              <h4>Próximas partidas</h4>
              {LOGISTICS_STATUS.nextDepartures.map((departure) => (
                <div key={departure.id} className="logistics-item-compact">
                  <div>
                    <strong>{departure.id}</strong>
                    <span>{departure.product}</span>
                  </div>
                  <div>
                    <span>{departure.destination}</span>
                    <span className="logistics-time">
                      <Clock size={12} />
                      {departure.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel-card field-card">
          <header className="panel-header">
            <div>
              <h3>Monitoramento de talhões</h3>
              <span>NDVI e umidade do solo</span>
            </div>
            <Leaf size={22} />
          </header>
          <ul className="field-health-list-compact">
            {FIELD_MONITORING.map((field) => {
              const ndviPercent = Math.round(field.ndvi * 100)
              return (
                <li key={field.id} className={`field-health-item-compact ${field.statusType}`}>
                  <div className="field-main-compact">
                    <strong>{field.name}</strong>
                    <span>
                      {field.crop} • {field.area}
                    </span>
                  </div>
                  <div className="field-metrics-compact">
                    <div className="field-metric-compact">
                      <span>NDVI {field.ndvi.toFixed(2)}</span>
                      <div className="field-bar-compact">
                        <div className="field-bar-fill" style={{ width: `${ndviPercent}%` }} aria-hidden></div>
                      </div>
                    </div>
                    <div className="field-metric-compact">
                      <span>Umidade {field.soilMoisture}</span>
                      <span className={`field-trend ${field.trend.startsWith('+') ? 'positive' : 'negative'}`}>
                        {field.trend}
                      </span>
                    </div>
                  </div>
                  <span className={`field-status-compact ${field.statusType}`}>{field.statusLabel}</span>
                </li>
              )
            })}
          </ul>
        </article>

        <article className="panel-card harvest-card">
          <header className="panel-header">
            <div>
              <h3>Gestão de Safra</h3>
              <span>{HARVEST_MANAGEMENT.activeHarvests} safras ativas • {HARVEST_MANAGEMENT.plantedArea} ha plantados</span>
            </div>
            <Sprout size={22} />
          </header>
          <div className="harvest-overview">
            <div className="harvest-stats">
              <div className="harvest-stat">
                <div className="harvest-stat-icon" style={{ backgroundColor: 'rgba(58, 125, 68, 0.15)' }}>
                  <Sprout size={18} style={{ color: '#3A7D44' }} />
                </div>
                <div>
                  <strong>{HARVEST_MANAGEMENT.plantedArea} ha</strong>
                  <span>Plantados</span>
                </div>
              </div>
              <div className="harvest-stat">
                <div className="harvest-stat-icon" style={{ backgroundColor: 'rgba(107, 158, 75, 0.15)' }}>
                  <CheckCircle2 size={18} style={{ color: '#6B9E4B' }} />
                </div>
                <div>
                  <strong>{HARVEST_MANAGEMENT.harvestedArea} ha</strong>
                  <span>Colhidos</span>
                </div>
              </div>
              <div className="harvest-stat">
                <div className="harvest-stat-icon" style={{ backgroundColor: 'rgba(74, 144, 226, 0.15)' }}>
                  <Percent size={18} style={{ color: '#4A90E2' }} />
                </div>
                <div>
                  <strong>{Math.round((HARVEST_MANAGEMENT.plantedArea / HARVEST_MANAGEMENT.totalArea) * 100)}%</strong>
                  <span>Área total</span>
                </div>
              </div>
            </div>
            <div className="harvest-list">
              {HARVEST_MANAGEMENT.inDevelopment.map((harvest) => (
                <div key={harvest.id} className="harvest-item">
                  <div className="harvest-item-header">
                    <div>
                      <strong>{harvest.name}</strong>
                      <span>{harvest.culture} • {harvest.area} ha</span>
                    </div>
                    <span className={`harvest-status ${harvest.status}`}>
                      {harvest.status === 'em_andamento' ? 'Em andamento' : 'Iniciando'}
                    </span>
                  </div>
                  <div className="harvest-progress-section">
                    <div className="harvest-phase">
                      <span>{harvest.phase}</span>
                      <span className="harvest-days">{harvest.daysSincePlanting} dias após plantio</span>
                    </div>
                    <div className="harvest-progress-bar">
                      <div
                        className="harvest-progress-fill"
                        style={{ width: `${harvest.progress}%` }}
                        aria-hidden
                      ></div>
                    </div>
                    <div className="harvest-meta">
                      <span>
                        <Calendar size={12} />
                        Colheita prevista: {harvest.expectedHarvest}
                      </span>
                      <span className="harvest-progress-text">{harvest.progress}% completo</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      {RISK_ALERTS.length > 0 && (
        <section className="alerts-section">
          <header className="alerts-header">
            <h3>
              <AlertTriangle size={20} />
              Alertas e recomendações
            </h3>
          </header>
          <div className="alerts-grid">
            {RISK_ALERTS.map((alert) => (
              <article key={alert.id} className={`alert-card ${alert.type} ${alert.urgent ? 'urgent' : ''}`}>
                <header className="alert-header">
                  <AlertTriangle size={18} />
                  <div>
                    <h4>{alert.title}</h4>
                    {alert.urgent && <span className="urgent-badge">Urgente</span>}
                  </div>
                </header>
                <p className="alert-description">{alert.description}</p>
                <div className="alert-recommendation">
                  <strong>Recomendação:</strong> {alert.recommendation}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
