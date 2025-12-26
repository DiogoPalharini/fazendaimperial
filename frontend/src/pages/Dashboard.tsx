import './Dashboard.css'
import {
  Sprout,
  Wheat,
  TrendingUp,
  Droplet,
  Truck,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Percent,
} from 'lucide-react'

// Mock data removed as per user request

import { useAuth } from '../contexts/AuthContext'

// import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user, allowedModules } = useAuth()
  // No restrictive redirect anymore

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite' // Dashboard is open to all, but content varies

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>{greeting}, {user?.name?.split(' ')[0] || 'Produtor'} 👋</h1>
          <p>Visão geral da operação • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </header>

      {/* Permissions Overview for Context */}
      <section className="summary-grid" style={{ marginBottom: '2rem' }}>
        <article className="summary-card" style={{ gridColumn: '1 / -1', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
          <div className="summary-card-bg" style={{ backgroundColor: '#2563eb15' }}></div>
          <div className="summary-icon-wrapper" style={{ backgroundColor: '#2563eb20', width: '40px', height: '40px' }}>
            <CheckCircle2 size={20} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <h2 className="summary-title" style={{ fontSize: '0.9rem' }}>Seus Acessos</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {allowedModules.length > 0 ? allowedModules.map(mod => (
                <span key={mod} style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  backgroundColor: '#2563eb15',
                  color: '#2563eb',
                  borderRadius: '12px',
                  fontWeight: 500
                }}>
                  {mod.toUpperCase()}
                </span>
              )) : <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Nenhum módulo habilitado</span>}
            </div>
          </div>
        </article>
      </section>

      <section className="summary-grid">
        {/* Conteúdo de resumo removido por solicitação */}
      </section>

      <section className="content-grid">
        {allowedModules.includes('financeiro') && (
          <article className="chart-card financial-card">
            <header className="card-header">
              <div>
                <h3>Evolução financeira</h3>
                <span>Últimos 6 meses (R$ milhões)</span>
              </div>
            </header>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: '#6b7280' }}>
              <div style={{ textAlign: 'center' }}>
                <DollarSign size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>Nenhum dado financeiro disponível</p>
              </div>
            </div>
          </article>
        )}

        {(allowedModules.includes('producao') || allowedModules.includes('safra')) && (
          <article className="panel-card production-card">
            <header className="panel-header">
              <div>
                <h3>Produção por cultura</h3>
                <span>Visão geral</span>
              </div>
              <Wheat size={22} />
            </header>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: '#6b7280', flexDirection: 'column' }}>
              <Wheat size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Nenhum dado de produção disponível</p>
            </div>
          </article>
        )}
      </section>

      <section className="content-grid">
        {/* Weather and Monitoring removed as per user request */}

        {(allowedModules.includes('carregamento') || allowedModules.includes('logistica')) && (
          <article className="panel-card logistics-card">
            <header className="panel-header">
              <div>
                <h3>Logística</h3>
                <span>Carregamentos e expedições</span>
              </div>
              <Truck size={22} />
            </header>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: '#6b7280', flexDirection: 'column' }}>
              <Truck size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Nenhum dado logístico disponível</p>
            </div>
          </article>
        )}
      </section>

      <section className="content-grid">

        {
          (allowedModules.includes('safra') || allowedModules.includes('producao')) && (
            <article className="panel-card harvest-card">
              <header className="panel-header">
                <div>
                  <h3>Gestão de Safra</h3>
                  <span>Acompanhamento</span>
                </div>
                <Sprout size={22} />
              </header>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: '#6b7280', flexDirection: 'column' }}>
                <Sprout size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Nenhuma safra ativa</p>
              </div>
            </article>
          )
        }
      </section >

      <section className="content-grid" style={{ marginTop: '1.5rem' }}>
        <article className="panel-card farms-card">
          <header className="panel-header">
            <div>
              <h3>Gestão de Fazendas</h3>
              <span>Central do Proprietário</span>
            </div>
            <Sprout size={22} className="text-emerald-500" />
          </header>
          <div className="p-6 flex flex-col items-center text-center">
            <Sprout size={48} className="text-emerald-200 mb-4" />
            <p className="text-slate-500 mb-6 text-sm">
              Gerencie suas fazendas, cadastre novos talhões e configure variedades para organizar sua produção.
            </p>
            <Link to="/fazendas" className="premium-btn w-full justify-center">
              Acessar Gestão de Fazendas
            </Link>
          </div>
        </article>
      </section>

      {
        allowedModules.includes('producao') && (
          <section className="alerts-section">
            <header className="section-header">
              <h3>
                <AlertTriangle size={20} />
                Alertas e recomendações
              </h3>
            </header>
            <div className="alerts-grid">
              <div style={{
                gridColumn: '1 / -1',
                padding: '2rem',
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <p>Nenhum alerta ativo no momento.</p>
              </div>
            </div>
          </section>
        )
      }
    </div >
  )
}
