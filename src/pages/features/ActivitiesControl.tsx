import './FeaturePage.css'

const activityFeatures = [
  'Criação de atividades e atribuição a funcionários',
  'Checklist de execução e anexos de evidências',
  'Controle de prazos, status e notificações',
  'Relatórios por talhão, cultura e equipe'
]

export default function ActivitiesControl() {
  return (
    <div className="feature-page">
      <header className="feature-header">
        <h2 className="feature-title">Controle de Atividades</h2>
        <p className="feature-description">
          Direcione tarefas para as equipes, acompanhe execução e mantenha histórico das operações.
        </p>
      </header>

      <div className="feature-grid">
        <section className="feature-card">
          <h3>Planejamento</h3>
          <p>Cadastre demandas, defina prioridades e vincule a campanhas ou safra.</p>
        </section>

        <section className="feature-card">
          <h3>Acompanhamento</h3>
          <ul className="feature-list">
            {activityFeatures.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="feature-card">
          <h3>Indicadores</h3>
          <p>
            Gere indicadores de produtividade, taxa de conclusão e horas trabalhadas por equipe, mantendo
            compliance das atividades.
          </p>
        </section>
      </div>

      <div className="feature-highlight">
        Tenha visibilidade total do trabalho em campo e responda rapidamente a mudanças de prioridade.
      </div>
    </div>
  )
}

