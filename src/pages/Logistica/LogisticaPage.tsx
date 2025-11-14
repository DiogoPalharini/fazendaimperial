import { useAuth } from '../../contexts/AuthContext'
import './LogisticaPage.css'

export default function LogisticaPage() {
  const { user } = useAuth()

  return (
    <div className="logistica-page">
      <div className="page-header">
        <h1>Logística</h1>
        <p>Gestão de cargas, rotas e entregas</p>
      </div>

      <div className="content-grid">
        <div className="card">
          <h3>🚛 Entregas Hoje</h3>
          <div className="metric">8</div>
          <p>Carregamentos</p>
        </div>

        <div className="card">
          <h3>📍 Rotas Ativas</h3>
          <div className="metric">5</div>
          <p>Em andamento</p>
        </div>

        <div className="card">
          <h3>⏰ Tempo Médio</h3>
          <div className="metric">2h 15min</div>
          <p>Por entrega</p>
        </div>

        <div className="card">
          <h3>✅ Entregas Concluídas</h3>
          <div className="metric">142</div>
          <p>Este mês</p>
        </div>
      </div>

      <div className="section">
        <h2>Entregas Programadas</h2>
        <div className="deliveries-list">
          <div className="delivery-item">
            <div className="delivery-header">
              <span className="delivery-id">#ENT-001</span>
              <span className="delivery-priority high">Urgente</span>
            </div>
            <div className="delivery-content">
              <div className="delivery-details">
                <h4>Soja - 20 toneladas</h4>
                <p><strong>Destino:</strong> Comercial Agrícola LTDA</p>
                <p><strong>Endereço:</strong> Rua das Flores, 123 - Centro</p>
                <p><strong>Horário:</strong> 14:00 - 16:00</p>
              </div>
              <div className="delivery-actions">
                <button className="btn small primary">Iniciar Rota</button>
                <button className="btn small secondary">Ver Mapa</button>
              </div>
            </div>
          </div>

          <div className="delivery-item">
            <div className="delivery-header">
              <span className="delivery-id">#ENT-002</span>
              <span className="delivery-priority medium">Normal</span>
            </div>
            <div className="delivery-content">
              <div className="delivery-details">
                <h4>Milho - 15 toneladas</h4>
                <p><strong>Destino:</strong> Indústria Alimentícia ABC</p>
                <p><strong>Endereço:</strong> Av. Industrial, 456 - Zona Industrial</p>
                <p><strong>Horário:</strong> 16:30 - 18:30</p>
              </div>
              <div className="delivery-actions">
                <button className="btn small secondary">Ver Detalhes</button>
                <button className="btn small secondary">Ver Mapa</button>
              </div>
            </div>
          </div>

          <div className="delivery-item">
            <div className="delivery-header">
              <span className="delivery-id">#ENT-003</span>
              <span className="delivery-priority low">Baixa</span>
            </div>
            <div className="delivery-content">
              <div className="delivery-details">
                <h4>Trigo - 10 toneladas</h4>
                <p><strong>Destino:</strong> Moinho Central</p>
                <p><strong>Endereço:</strong> Rua do Comércio, 789 - Centro</p>
                <p><strong>Horário:</strong> Amanhã 09:00 - 11:00</p>
              </div>
              <div className="delivery-actions">
                <button className="btn small secondary">Ver Detalhes</button>
                <button className="btn small secondary">Ver Mapa</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {user?.role === 'motorista-logistica' && (
        <div className="section">
          <h2>Suas Entregas</h2>
          <div className="my-deliveries">
            <div className="delivery-card">
              <div className="delivery-status in-progress">
                <span className="status-icon">🚛</span>
                <span className="status-text">Em Andamento</span>
              </div>
              <div className="delivery-info">
                <h4>#ENT-001 - Soja</h4>
                <p>Comercial Agrícola LTDA</p>
                <p className="delivery-progress">Progresso: 65%</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="delivery-actions">
                <button className="btn small success">Marcar Entregue</button>
                <button className="btn small secondary">Reportar Problema</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <h2>Histórico de Entregas</h2>
        <div className="history-list">
          <div className="history-item">
            <span className="history-icon">✅</span>
            <div className="history-content">
              <div className="history-title">#ENT-045 - Milho entregue</div>
              <div className="history-details">Indústria ABC - 2h 30min</div>
              <div className="history-time">Ontem 16:45</div>
            </div>
          </div>
          <div className="history-item">
            <span className="history-icon">✅</span>
            <div className="history-content">
              <div className="history-title">#ENT-044 - Soja entregue</div>
              <div className="history-details">Comercial LTDA - 1h 45min</div>
              <div className="history-time">Ontem 14:20</div>
            </div>
          </div>
          <div className="history-item">
            <span className="history-icon">⚠️</span>
            <div className="history-content">
              <div className="history-title">#ENT-043 - Atraso reportado</div>
              <div className="history-details">Tráfego intenso - +30min</div>
              <div className="history-time">2 dias atrás</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}









