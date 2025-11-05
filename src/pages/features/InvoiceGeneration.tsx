import './FeaturePage.css'

const invoiceFields = [
  'Fazenda e natureza da operação pré-configuradas',
  'Seleção do cliente e endereço de entrega',
  'Produto, quantidade e unidade com conversão automática',
  'Valor unitário e cálculo automático do total',
  'Sincronização com estoque e carregamento vinculado'
]

export default function InvoiceGeneration() {
  return (
    <div className="feature-page">
      <header className="feature-header">
        <h2 className="feature-title">Geração de Nota Fiscal</h2>
        <p className="feature-description">
          Emita notas fiscais vinculadas à carga com preenchimento guiado e validações em cada etapa.
        </p>
      </header>

      <div className="feature-grid">
        <section className="feature-card">
          <h3>Dados Principais</h3>
          <ul className="feature-list">
            {invoiceFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </section>

        <section className="feature-card">
          <h3>Integração com o Carregamento</h3>
          <p>
            Cada nota fiscal nasce a partir de um carregamento aprovado, mantendo referência da carga,
            motorista e destino para auditoria completa.
          </p>
        </section>

        <section className="feature-card">
          <h3>Automação de Cálculos</h3>
          <p>
            Aplique regras fiscais e descontos automaticamente. Configure impostos padrões e personalize
            transportadoras, CFOP e observações em segundos.
          </p>
        </section>
      </div>

      <div className="feature-highlight">
        Generate notas fiscais com segurança e padronização para todas as operações da Fazenda Imperial.
      </div>
    </div>
  )
}

