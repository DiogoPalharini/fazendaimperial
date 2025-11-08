import { useAuth } from '../../contexts/AuthContext'
import './ProducaoPage.css'

export default function ProducaoPage() {
  const { user } = useAuth()

  return (
    <div className="producao-page">
      <div className="page-header">
        <h1>Produção</h1>
        <p>Monitoramento de ciclos de plantio, aplicação e colheita</p>
      </div>

      <div className="content-grid">
        <div className="card">
          <h3>🌱 Plantios Ativos</h3>
          <div className="metric">12</div>
          <p>Culturas em desenvolvimento</p>
        </div>

        <div className="card">
          <h3>📅 Próximas Colheitas</h3>
          <div className="metric">5</div>
          <p>Nos próximos 30 dias</p>
        </div>

        <div className="card">
          <h3>🚜 Operações Pendentes</h3>
          <div className="metric">8</div>
          <p>Ordens de serviço</p>
        </div>

        <div className="card">
          <h3>📊 Produtividade</h3>
          <div className="metric">+15%</div>
          <p>vs. período anterior</p>
        </div>
      </div>

      <div className="section">
        <h2>Últimas Atividades</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">🌾</span>
            <div className="activity-content">
              <div className="activity-title">Colheita de Milho - Talhão A3</div>
              <div className="activity-time">Há 2 horas</div>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🌱</span>
            <div className="activity-content">
              <div className="activity-title">Plantio de Soja - Talhão B1</div>
              <div className="activity-time">Ontem</div>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">💧</span>
            <div className="activity-content">
              <div className="activity-title">Aplicação de Defensivo - Talhão C2</div>
              <div className="activity-time">2 dias atrás</div>
            </div>
          </div>
        </div>
      </div>

      {user?.role === 'operador-maquina' && (
        <div className="section">
          <h2>Suas Ordens de Serviço</h2>
          <div className="orders-list">
            <div className="order-item">
              <div className="order-header">
                <span className="order-id">#OS-001</span>
                <span className="order-priority high">Urgente</span>
              </div>
              <div className="order-content">
                <h4>Plantio de Milho - Talhão D1</h4>
                <p>Prazo: Hoje até 18:00</p>
                <button className="btn primary">Iniciar Trabalho</button>
              </div>
            </div>
            <div className="order-item">
              <div className="order-header">
                <span className="order-id">#OS-002</span>
                <span className="order-priority medium">Normal</span>
              </div>
              <div className="order-content">
                <h4>Aplicação de Fertilizante - Talhão A2</h4>
                <p>Prazo: Amanhã</p>
                <button className="btn secondary">Ver Detalhes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

