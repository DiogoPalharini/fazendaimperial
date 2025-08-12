import './Dashboard.css'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const summaryCards = [
  { id: 'valor', title: 'Valor Total do Estoque', value: 'R$ 254.320', trend: '+3,4%' },
  { id: 'itens', title: 'Itens em Estoque', value: '1.238', trend: '+1,1%' },
  { id: 'criticos', title: 'Itens Críticos', value: '12', trend: '-5,0%' },
  { id: 'mov', title: 'Movimentações (30d)', value: '312', trend: '+12,2%' },
]

const pieData = [
  { name: 'Grãos', value: 400 },
  { name: 'Frutas', value: 300 },
  { name: 'Hortaliças', value: 300 },
  { name: 'Laticínios', value: 200 },
]

const barData = [
  { name: 'Jan', valor: 2400 },
  { name: 'Fev', valor: 1398 },
  { name: 'Mar', valor: 9800 },
  { name: 'Abr', valor: 3908 },
  { name: 'Mai', valor: 4800 },
  { name: 'Jun', valor: 3800 },
]

const COLORS = ['#3A7D44', '#6B9E4B', '#A9C44C', '#E5E07B']

export default function Dashboard() {
  return (
    <>

        <section className="summary-cards">
          {summaryCards.map((c) => (
            <div className="card" key={c.id}>
              <div className="card-title">{c.title}</div>
              <div className="card-value">{c.value}</div>
              <div className="card-trend">{c.trend}</div>
            </div>
          ))}
        </section>

        <section className="charts-grid">
          <div className="chart-card">
            <h2 className="chart-title">Distribuição por Categoria</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h2 className="chart-title">Valorização (Últimos 6 meses)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="valor" fill="#3A7D44" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="alerts">
          <div className="alert warn">Aviso: Inventário geral programado para sexta-feira.</div>
          <div className="alert danger">Urgente: Temperatura anômala detectada na câmara fria 2.</div>
        </section>

        <section className="quick-actions">
          <button className="action-button">📦 Novo Item</button>
          <button className="action-button">⬆️ Entrada</button>
          <button className="action-button">⬇️ Saída</button>
          <button className="action-button">🧾 Gerar Relatório</button>
        </section>
    </>
  )
}


