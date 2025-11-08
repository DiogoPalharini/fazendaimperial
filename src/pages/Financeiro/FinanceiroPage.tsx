import { useAuth } from '../../contexts/AuthContext'
import './FinanceiroPage.css'

export default function FinanceiroPage() {
  const { user } = useAuth()

  return (
    <div className="financeiro-page">
      <div className="page-header">
        <h1>Financeiro</h1>
        <p>Controle de contas, notas fiscais e fluxo de caixa</p>
      </div>

      <div className="content-grid">
        <div className="card">
          <h3>💰 Receita Mensal</h3>
          <div className="metric">R$ 125.400</div>
          <p>+8% vs. mês anterior</p>
        </div>

        <div className="card">
          <h3>💸 Despesas Mensais</h3>
          <div className="metric">R$ 89.200</div>
          <p>+3% vs. mês anterior</p>
        </div>

        <div className="card">
          <h3>📊 Lucro Líquido</h3>
          <div className="metric">R$ 36.200</div>
          <p>Margem: 28.8%</p>
        </div>

        <div className="card">
          <h3>📈 Fluxo de Caixa</h3>
          <div className="metric">R$ 45.600</div>
          <p>Saldo atual</p>
        </div>
      </div>

      <div className="section">
        <h2>Contas a Pagar</h2>
        <div className="bills-list">
          <div className="bill-item urgent">
            <div className="bill-header">
              <span className="bill-supplier">Fornecedor ABC Sementes</span>
              <span className="bill-due">Vence hoje</span>
            </div>
            <div className="bill-content">
              <div className="bill-details">
                <span className="bill-amount">R$ 12.500,00</span>
                <span className="bill-description">Sementes de milho - 500kg</span>
              </div>
              <button className="btn small primary">Pagar</button>
            </div>
          </div>

          <div className="bill-item">
            <div className="bill-header">
              <span className="bill-supplier">Distribuidora XYZ</span>
              <span className="bill-due">Vence em 3 dias</span>
            </div>
            <div className="bill-content">
              <div className="bill-details">
                <span className="bill-amount">R$ 8.900,00</span>
                <span className="bill-description">Fertilizantes NPK</span>
              </div>
              <button className="btn small secondary">Ver Detalhes</button>
            </div>
          </div>

          <div className="bill-item">
            <div className="bill-header">
              <span className="bill-supplier">Cooperativa Rural</span>
              <span className="bill-due">Vence em 7 dias</span>
            </div>
            <div className="bill-content">
              <div className="bill-details">
                <span className="bill-amount">R$ 15.200,00</span>
                <span className="bill-description">Defensivos agrícolas</span>
              </div>
              <button className="btn small secondary">Ver Detalhes</button>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Contas a Receber</h2>
        <div className="receivables-list">
          <div className="receivable-item">
            <div className="receivable-header">
              <span className="receivable-client">Comercial Agrícola LTDA</span>
              <span className="receivable-due">Recebe hoje</span>
            </div>
            <div className="receivable-content">
              <div className="receivable-details">
                <span className="receivable-amount">R$ 25.800,00</span>
                <span className="receivable-description">Venda de soja - 20 toneladas</span>
              </div>
              <span className="receivable-status confirmed">Confirmado</span>
            </div>
          </div>

          <div className="receivable-item">
            <div className="receivable-header">
              <span className="receivable-client">Indústria Alimentícia ABC</span>
              <span className="receivable-due">Recebe em 5 dias</span>
            </div>
            <div className="receivable-content">
              <div className="receivable-details">
                <span className="receivable-amount">R$ 18.500,00</span>
                <span className="receivable-description">Venda de milho - 15 toneladas</span>
              </div>
              <span className="receivable-status pending">Pendente</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Relatórios Financeiros</h2>
        <div className="reports-grid">
          <button className="report-card">
            <span className="report-icon">📊</span>
            <h4>Fluxo de Caixa</h4>
            <p>Últimos 12 meses</p>
          </button>
          <button className="report-card">
            <span className="report-icon">💰</span>
            <h4>Demonstrativo de Resultados</h4>
            <p>Trimestral</p>
          </button>
          <button className="report-card">
            <span className="report-icon">📈</span>
            <h4>Análise de Custos</h4>
            <p>Por cultura</p>
          </button>
          <button className="report-card">
            <span className="report-icon">📋</span>
            <h4>Notas Fiscais</h4>
            <p>Entradas e saídas</p>
          </button>
        </div>
      </div>
    </div>
  )
}



