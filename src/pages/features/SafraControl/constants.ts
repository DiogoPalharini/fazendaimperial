import type { Safra, Cultura, TipoInsumo, TipoOperacao } from './types'

export const CULTURAS: Cultura[] = ['Soja', 'Milho', 'Algodão', 'Café', 'Cana-de-açúcar', 'Trigo', 'Outros']
export const UNIDADES_PRODUCAO = ['sc/ha', 't/ha'] as const
export const TIPOS_INSUMO: TipoInsumo[] = ['Semente', 'Fertilizante', 'Defensivo', 'Biologico']
export const TIPOS_OPERACAO: TipoOperacao[] = ['PreparoSolo', 'Plantio', 'Pulverizacao', 'Colheita', 'TransporteInterno']
export const TIPOS_MAO_DE_OBRA = ['Mensal', 'Temporario'] as const
export const TIPOS_ARRENDAMENTO = ['Arrendamento', 'Parceria'] as const

export const OPERACOES_LABELS: Record<TipoOperacao, string> = {
  PreparoSolo: 'Preparo do Solo',
  Plantio: 'Plantio',
  Pulverizacao: 'Pulverização',
  Colheita: 'Colheita',
  TransporteInterno: 'Transporte Interno',
}

export const INSUMOS_LABELS: Record<TipoInsumo, string> = {
  Semente: 'Sementes',
  Fertilizante: 'Fertilizantes',
  Defensivo: 'Defensivos',
  Biologico: 'Biológicos',
}

// Dados iniciais de exemplo
export const INITIAL_SAFRAS: Safra[] = [
  {
    id: 'safra-1',
    nome: 'Soja 2024/2025',
    cultura: 'Soja',
    areaTotal: 500,
    dataPlantio: '2024-10-15',
    dataColheita: '2025-02-20',
    receitas: {
      producao: {
        areaPlantada: 500,
        produtividadeEsperada: 60,
        unidade: 'sc/ha',
        producaoTotal: 30000,
      },
      precoVenda: {
        precoPorUnidade: 150,
        receitaBrutaPrevista: 4500000,
      },
      outrasReceitas: [],
    },
    custos: {
      insumos: [
        {
          id: 'ins-1',
          tipo: 'Semente',
          nome: 'Semente de Soja RR',
          quantidadePorHa: 60,
          precoUnitario: 8.5,
          total: 255000,
        },
        {
          id: 'ins-2',
          tipo: 'Fertilizante',
          nome: 'NPK 08-20-20',
          quantidadePorHa: 300,
          precoUnitario: 2.8,
          total: 420000,
        },
      ],
      operacoesMecanicas: [],
      maoDeObra: [],
      custosIndiretos: [],
      depreciacoes: [],
      arrendamentos: [],
      logisticas: [],
    },
    indicadores: {
      custoTotal: 675000,
      custoPorHectare: 1350,
      custoPorUnidade: 22.5,
      lucroBruto: 3825000,
      lucroLiquido: 3825000,
      margemLucro: 85,
      pontoEquilibrio: 4500,
    },
    createdAt: '2024-09-01T10:00:00',
    updatedAt: '2024-09-01T10:00:00',
  },
]

