import { useAuth } from '../../contexts/AuthContext'
import './SoloPage.css'

export default function SoloPage() {
  const { user } = useAuth()

  return (
    <div className="solo-page">
      <div className="page-header">
        <h1>Análise de Solo</h1>
        <p>Monitoramento e recomendações agronômicas</p>
      </div>

      <div className="content-grid">
        <div className="card">
          <h3>🧪 Análises Realizadas</h3>
          <div className="metric">24</div>
          <p>Este ano</p>
        </div>

        <div className="card">
          <h3>📊 Talhões Monitorados</h3>
          <div className="metric">8</div>
          <p>Áreas ativas</p>
        </div>

        <div className="card">
          <h3>⚠️ Atenção Necessária</h3>
          <div className="metric">3</div>
          <p>Talhões críticos</p>
        </div>

        <div className="card">
          <h3>📈 Melhoria Média</h3>
          <div className="metric">+12%</div>
          <p>Fertilidade do solo</p>
        </div>
      </div>

      <div className="section">
        <h2>Últimas Análises</h2>
        <div className="analysis-list">
          <div className="analysis-item">
            <div className="analysis-header">
              <span className="analysis-location">Talhão A1</span>
              <span className="analysis-date">15/10/2024</span>
            </div>
            <div className="analysis-content">
              <div className="analysis-results">
                <div className="result-item">
                  <span className="result-label">pH:</span>
                  <span className="result-value good">6.2</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Fósforo:</span>
                  <span className="result-value medium">15 mg/dm³</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Potássio:</span>
                  <span className="result-value good">120 mg/dm³</span>
                </div>
              </div>
              <div className="analysis-recommendations">
                <h4>Recomendações:</h4>
                <ul>
                  <li>Aplicar 50kg/ha de superfosfato</li>
                  <li>Manter pH com calagem preventiva</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="analysis-item">
            <div className="analysis-header">
              <span className="analysis-location">Talhão B2</span>
              <span className="analysis-date">10/10/2024</span>
            </div>
            <div className="analysis-content">
              <div className="analysis-results">
                <div className="result-item">
                  <span className="result-label">pH:</span>
                  <span className="result-value critical">5.1</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Fósforo:</span>
                  <span className="result-value critical">8 mg/dm³</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Potássio:</span>
                  <span className="result-value medium">85 mg/dm³</span>
                </div>
              </div>
              <div className="analysis-recommendations">
                <h4>Recomendações Urgentes:</h4>
                <ul>
                  <li>Aplicar 2t/ha de calcário dolomítico</li>
                  <li>Aplicar 80kg/ha de MAP</li>
                  <li>Monitorar pH mensalmente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Próximas Análises Programadas</h2>
        <div className="scheduled-list">
          <div className="scheduled-item">
            <span className="scheduled-location">Talhão C1</span>
            <span className="scheduled-date">25/10/2024</span>
            <button className="btn small">Agendar</button>
          </div>
          <div className="scheduled-item">
            <span className="scheduled-location">Talhão D3</span>
            <span className="scheduled-date">30/10/2024</span>
            <button className="btn small">Agendar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

