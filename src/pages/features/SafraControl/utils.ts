import type {
  Safra,
  Producao,
  PrecoVenda,
  CustosSafra,
  ReceitasSafra,
  IndicadoresSafra,
} from './types'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('pt-BR')
}

// Cálculos de Receita
export function calcularProducaoTotal(producao: Producao): number {
  return producao.areaPlantada * producao.produtividadeEsperada
}

export function calcularReceitaBruta(producao: Producao, preco: PrecoVenda): number {
  const producaoTotal = calcularProducaoTotal(producao)
  return producaoTotal * preco.precoPorUnidade
}

// Cálculos de Custos
export function calcularTotalInsumos(insumos: Safra['custos']['insumos'], areaTotal: number): number {
  return insumos.reduce((total, insumo) => {
    const totalInsumo = (insumo.quantidadePorHa * insumo.precoUnitario) * areaTotal
    return total + totalInsumo
  }, 0)
}

export function calcularTotalOperacoes(operacoes: Safra['custos']['operacoesMecanicas'], areaTotal: number): number {
  return operacoes.reduce((total, operacao) => {
    let totalOperacao = 0
    if (operacao.valorPorHa !== undefined) {
      totalOperacao = operacao.valorPorHa * areaTotal
    } else if (operacao.valorPorHora !== undefined && operacao.numeroHoras !== undefined) {
      totalOperacao = operacao.valorPorHora * operacao.numeroHoras
    }
    return total + totalOperacao
  }, 0)
}

export function calcularTotalMaoDeObra(maoDeObra: Safra['custos']['maoDeObra']): number {
  return maoDeObra.reduce((total, item) => {
    let totalItem = 0
    if (item.tipo === 'Mensal' && item.periodoMeses !== undefined) {
      totalItem = item.valorMensalOuDiaria * item.quantidade * item.periodoMeses
    } else if (item.tipo === 'Temporario') {
      // Assumindo que temporário é por diária e período em meses
      totalItem = item.valorMensalOuDiaria * item.quantidade * (item.periodoMeses || 1)
    }
    return total + totalItem
  }, 0)
}

export function calcularTotalCustosIndiretos(custosIndiretos: Safra['custos']['custosIndiretos']): number {
  return custosIndiretos.reduce((total, custo) => {
    return total + (custo.valorMensal * custo.duracaoMeses)
  }, 0)
}

export function calcularTotalDepreciacoes(depreciacoes: Safra['custos']['depreciacoes'], safrasPorAno: number = 1): number {
  return depreciacoes.reduce((total, dep) => {
    const depreciacaoAnual = dep.valorInicial / dep.vidaUtilAnos
    const depreciacaoPorSafra = depreciacaoAnual / safrasPorAno
    return total + depreciacaoPorSafra
  }, 0)
}

export function calcularTotalArrendamentos(arrendamentos: Safra['custos']['arrendamentos'], areaTotal: number, producaoTotal: number, precoPorUnidade: number): number {
  return arrendamentos.reduce((total, arr) => {
    if (arr.tipo === 'Arrendamento' && arr.valorPorHa !== undefined) {
      return total + (arr.valorPorHa * areaTotal)
    } else if (arr.tipo === 'Parceria' && arr.percentual !== undefined) {
      const receitaBruta = producaoTotal * precoPorUnidade
      return total + (receitaBruta * arr.percentual / 100)
    }
    return total
  }, 0)
}

export function calcularTotalLogisticas(logisticas: Safra['custos']['logisticas']): number {
  return logisticas.reduce((total, log) => {
    return total + (log.custoPorUnidade * log.quantidade)
  }, 0)
}

export function calcularCustoTotal(custos: CustosSafra, areaTotal: number, producaoTotal: number, precoPorUnidade: number): number {
  const totalInsumos = calcularTotalInsumos(custos.insumos, areaTotal)
  const totalOperacoes = calcularTotalOperacoes(custos.operacoesMecanicas, areaTotal)
  const totalMaoDeObra = calcularTotalMaoDeObra(custos.maoDeObra)
  const totalCustosIndiretos = calcularTotalCustosIndiretos(custos.custosIndiretos)
  const totalDepreciacoes = calcularTotalDepreciacoes(custos.depreciacoes)
  const totalArrendamentos = calcularTotalArrendamentos(custos.arrendamentos, areaTotal, producaoTotal, precoPorUnidade)
  const totalLogisticas = calcularTotalLogisticas(custos.logisticas)

  return (
    totalInsumos +
    totalOperacoes +
    totalMaoDeObra +
    totalCustosIndiretos +
    totalDepreciacoes +
    totalArrendamentos +
    totalLogisticas
  )
}

// Cálculos de Indicadores
export function calcularIndicadores(
  receitas: ReceitasSafra,
  custos: CustosSafra,
  areaTotal: number
): IndicadoresSafra {
  const producaoTotal = calcularProducaoTotal(receitas.producao)
  const receitaBruta = calcularReceitaBruta(receitas.producao, receitas.precoVenda)
  const outrasReceitasTotal = receitas.outrasReceitas.reduce((sum, r) => sum + r.valor, 0)
  const receitaBrutaTotal = receitaBruta + outrasReceitasTotal

  const custoTotal = calcularCustoTotal(custos, areaTotal, producaoTotal, receitas.precoVenda.precoPorUnidade)
  const custoPorHectare = areaTotal > 0 ? custoTotal / areaTotal : 0
  const custoPorUnidade = producaoTotal > 0 ? custoTotal / producaoTotal : 0

  // Custos diretos: insumos + operações + mão de obra
  const custosDiretos = 
    calcularTotalInsumos(custos.insumos, areaTotal) +
    calcularTotalOperacoes(custos.operacoesMecanicas, areaTotal) +
    calcularTotalMaoDeObra(custos.maoDeObra)

  const lucroBruto = receitaBrutaTotal - custosDiretos
  const lucroLiquido = receitaBrutaTotal - custoTotal
  const margemLucro = receitaBrutaTotal > 0 ? (lucroLiquido / receitaBrutaTotal) * 100 : 0
  const pontoEquilibrio = receitas.precoVenda.precoPorUnidade > 0 
    ? custoTotal / receitas.precoVenda.precoPorUnidade 
    : 0

  return {
    custoTotal,
    custoPorHectare,
    custoPorUnidade,
    lucroBruto,
    lucroLiquido,
    margemLucro,
    pontoEquilibrio,
  }
}

// Atualizar indicadores de uma safra
export function atualizarIndicadoresSafra(safra: Safra): Safra {
  const indicadores = calcularIndicadores(safra.receitas, safra.custos, safra.areaTotal)
  return {
    ...safra,
    indicadores,
    updatedAt: new Date().toISOString(),
  }
}

