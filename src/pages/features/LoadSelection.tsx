import './FeaturePage.css'

const selectionSteps = [
  {
    title: 'Caminhão',
    details: 'Defina o veículo responsável, carga máxima e condutor.'
  },
  {
    title: 'Fazenda',
    details: 'Selecione a origem para rastreamento e integração com estoque.'
  },
  {
    title: 'Campos / Talhão',
    details: 'Aponte a área produtiva, facilitando o controle agronômico.'
  },
  {
    title: 'Variedade',
    details: 'Associe a cultura transportada para análises de produtividade.'
  },
  {
    title: 'Motorista',
    details: 'Registre o responsável pela viagem com CNH e contatos.'
  },
  {
    title: 'Destino',
    details: 'Informe cliente, unidade de entrega e previsões de horário.'
  }
]

export default function LoadSelection() {
  return (
    <div className="feature-page">
      <header className="feature-header">
        <h2 className="feature-title">Seleção de Cargas</h2>
        <p className="feature-description">
          Configure todas as variáveis envolvidas na expedição garantindo consistência nos dados.
        </p>
      </header>

      <div className="feature-grid">
        {selectionSteps.map((step) => (
          <section className="feature-card" key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.details}</p>
          </section>
        ))}
      </div>

      <div className="feature-highlight">
        Combine essas informações ao carregamento para gerar relatórios completos e atender exigências fiscais.
      </div>
    </div>
  )
}

