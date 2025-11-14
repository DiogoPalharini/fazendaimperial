export type Cultura = 'Soja' | 'Milho' | 'Algodão' | 'Café' | 'Cana-de-açúcar' | 'Trigo' | 'Outros'
export type UnidadeProducao = 'sc/ha' | 't/ha'
export type TipoCusto = 
  | 'Insumo' 
  | 'OperacaoMecanica' 
  | 'MaoDeObra' 
  | 'CustoIndireto' 
  | 'Depreciacao' 
  | 'Arrendamento' 
  | 'Logistica'
export type TipoInsumo = 'Semente' | 'Fertilizante' | 'Defensivo' | 'Biologico'
export type TipoOperacao = 'PreparoSolo' | 'Plantio' | 'Pulverizacao' | 'Colheita' | 'TransporteInterno'
export type TipoMaoDeObra = 'Mensal' | 'Temporario'
export type TipoArrendamento = 'Arrendamento' | 'Parceria'

// Receita
export interface Producao {
  areaPlantada: number // ha
  produtividadeEsperada: number // sc/ha ou t/ha
  unidade: UnidadeProducao
  producaoTotal: number // calculado: área × produtividade
}

export interface PrecoVenda {
  precoPorUnidade: number // preço por saca/tonelada
  receitaBrutaPrevista: number // calculado: produção total × preço
}

export interface OutraReceita {
  id: string
  descricao: string
  valor: number
}

// Custos
export interface Insumo {
  id: string
  tipo: TipoInsumo
  nome: string
  quantidadePorHa: number
  precoUnitario: number
  total: number // calculado: (quantidade × preço) × área
}

export interface OperacaoMecanica {
  id: string
  tipo: TipoOperacao
  descricao: string
  valorPorHa?: number
  valorPorHora?: number
  numeroHoras?: number
  total: number // calculado
}

export interface MaoDeObra {
  id: string
  tipo: TipoMaoDeObra
  descricao: string
  valorMensalOuDiaria: number
  quantidade: number
  periodoMeses?: number
  total: number // calculado
}

export interface CustoIndireto {
  id: string
  categoria: string
  descricao: string
  valorMensal: number
  duracaoMeses: number
  total: number // calculado
}

export interface Depreciacao {
  id: string
  descricao: string
  valorInicial: number
  vidaUtilAnos: number
  depreciacaoAnual: number // calculado: valor inicial / vida útil
  depreciacaoPorSafra: number // calculado: depreciação anual / número de safras por ano
}

export interface Arrendamento {
  id: string
  tipo: TipoArrendamento
  valorPorHa?: number
  percentual?: number
  total: number // calculado
}

export interface Logistica {
  id: string
  descricao: string
  custoPorUnidade: number // por tonelada/saca
  quantidade: number
  total: number // calculado
}

export interface CustosSafra {
  insumos: Insumo[]
  operacoesMecanicas: OperacaoMecanica[]
  maoDeObra: MaoDeObra[]
  custosIndiretos: CustoIndireto[]
  depreciacoes: Depreciacao[]
  arrendamentos: Arrendamento[]
  logisticas: Logistica[]
}

export interface ReceitasSafra {
  producao: Producao
  precoVenda: PrecoVenda
  outrasReceitas: OutraReceita[]
}

// Indicadores
export interface IndicadoresSafra {
  custoTotal: number
  custoPorHectare: number
  custoPorUnidade: number // por saca/tonelada
  lucroBruto: number
  lucroLiquido: number
  margemLucro: number // %
  pontoEquilibrio: number // sacas/toneladas necessárias
}

// Safra completa
export interface Safra {
  id: string
  nome: string
  cultura: Cultura
  areaTotal: number // ha
  dataPlantio: string
  dataColheita: string
  receitas: ReceitasSafra
  custos: CustosSafra
  indicadores: IndicadoresSafra
  observacoes?: string
  createdAt: string
  updatedAt: string
}

