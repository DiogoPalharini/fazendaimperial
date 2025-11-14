import { useAuth } from '../../contexts/AuthContext'
import './MaquinasPage.css'

export default function MaquinasPage() {
  const { user } = useAuth()

  return (
    <div className="maquinas-page">
      <div className="page-header">
        <h1>Máquinas e Equipamentos</h1>
        <p>Controle de frota e ordens de serviço</p>
      </div>

      <div className="content-grid">
        <div className="card">
          <h3>🚜 Total de Máquinas</h3>
          <div className="metric">15</div>
          <p>Equipamentos ativos</p>
        </div>

        <div className="card">
          <h3>🔧 Em Manutenção</h3>
          <div className="metric">3</div>
          <p>Equipamentos</p>
        </div>

        <div className="card">
          <h3>✅ Disponíveis</h3>
          <div className="metric">12</div>
          <p>Prontos para uso</p>
        </div>

        <div className="card">
          <h3>⏰ Horas Trabalhadas</h3>
          <div className="metric">1.247</div>
          <p>Este mês</p>
        </div>
      </div>

      <div className="section">
        <h2>Status da Frota</h2>
        <div className="machines-list">
          <div className="machine-item">
            <div className="machine-header">
              <span className="machine-name">Trator John Deere 6110J</span>
              <span className="machine-status available">Disponível</span>
            </div>
            <div className="machine-details">
              <p>Horímetro: 2.847h | Última manutenção: 15 dias</p>
              <div className="machine-actions">
                <button className="btn small">Ver Histórico</button>
                <button className="btn small secondary">Agendar Manutenção</button>
              </div>
            </div>
          </div>
          
          <div className="machine-item">
            <div className="machine-header">
              <span className="machine-name">Plantadeira Case IH</span>
              <span className="machine-status maintenance">Manutenção</span>
            </div>
            <div className="machine-details">
              <p>Horímetro: 1.234h | Manutenção: Troca de óleo</p>
              <div className="machine-actions">
                <button className="btn small">Ver Detalhes</button>
                <span className="maintenance-date">Previsão: 2 dias</span>
              </div>
            </div>
          </div>

          <div className="machine-item">
            <div className="machine-header">
              <span className="machine-name">Colheitadeira New Holland</span>
              <span className="machine-status working">Em Operação</span>
            </div>
            <div className="machine-details">
              <p>Horímetro: 3.456h | Operador: Pedro Costa</p>
              <div className="machine-actions">
                <button className="btn small">Rastrear</button>
                <span className="current-task">Colheita - Talhão A3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {user?.role === 'operador-maquina' && (
        <div className="section">
          <h2>Suas Atribuições</h2>
          <div className="assignments-list">
            <div className="assignment-item">
              <div className="assignment-header">
                <span className="assignment-machine">Trator John Deere 6110J</span>
                <span className="assignment-priority high">Urgente</span>
              </div>
              <div className="assignment-content">
                <h4>Plantio de Milho - Talhão D1</h4>
                <p>Início: 08:00 | Duração estimada: 6 horas</p>
                <div className="assignment-actions">
                  <button className="btn primary">Iniciar</button>
                  <button className="btn secondary">Ver Rota</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

