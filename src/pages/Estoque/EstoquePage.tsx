import { useAuth } from '../../contexts/AuthContext'
import './EstoquePage.css'

export default function EstoquePage() {
  const { user } = useAuth()

  return (
    <div className="estoque-page">
      <div className="page-header">
        <h1>Controle de Estoque</h1>
        <p>Gestão de insumos, sementes, defensivos e saídas</p>
      </div>

      <div className="content-grid">
        <div className="card">
          <h3>📦 Total de Itens</h3>
          <div className="metric">1.238</div>
          <p>Produtos em estoque</p>
        </div>

        <div className="card">
          <h3>⚠️ Estoque Baixo</h3>
          <div className="metric">12</div>
          <p>Itens críticos</p>
        </div>

        <div className="card">
          <h3>📈 Entradas (30d)</h3>
          <div className="metric">156</div>
          <p>Movimentações</p>
        </div>

        <div className="card">
          <h3>📉 Saídas (30d)</h3>
          <div className="metric">89</div>
          <p>Movimentações</p>
        </div>
      </div>

      <div className="section">
        <h2>Itens com Estoque Baixo</h2>
        <div className="critical-items">
          <div className="item-row">
            <span className="item-name">Sementes de Milho</span>
            <span className="item-quantity">5 kg</span>
            <span className="item-status critical">Crítico</span>
            <button className="btn small">Repor</button>
          </div>
          <div className="item-row">
            <span className="item-name">Fertilizante NPK</span>
            <span className="item-quantity">12 kg</span>
            <span className="item-status warning">Baixo</span>
            <button className="btn small">Repor</button>
          </div>
          <div className="item-row">
            <span className="item-name">Herbicida Glifosato</span>
            <span className="item-quantity">8 L</span>
            <span className="item-status critical">Crítico</span>
            <button className="btn small">Repor</button>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Movimentações Recentes</h2>
        <div className="movements-list">
          <div className="movement-item">
            <span className="movement-icon">📥</span>
            <div className="movement-content">
              <div className="movement-title">Entrada - Sementes de Soja</div>
              <div className="movement-details">+500 kg - Fornecedor ABC</div>
              <div className="movement-time">Há 2 horas</div>
            </div>
          </div>
          <div className="movement-item">
            <span className="movement-icon">📤</span>
            <div className="movement-content">
              <div className="movement-title">Saída - Fertilizante</div>
              <div className="movement-details">-50 kg - Talhão A1</div>
              <div className="movement-time">Ontem</div>
            </div>
          </div>
          <div className="movement-item">
            <span className="movement-icon">📥</span>
            <div className="movement-content">
              <div className="movement-title">Entrada - Defensivo</div>
              <div className="movement-details">+20 L - Fornecedor XYZ</div>
              <div className="movement-time">2 dias atrás</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

