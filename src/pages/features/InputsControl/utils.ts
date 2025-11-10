import type { InputItem, StockStatus } from './types'

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR')
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function getStatus(item: InputItem): StockStatus {
  if (item.estoqueAtual <= item.estoqueMinimo) {
    return 'Estoque baixo'
  }

  return 'Em dia'
}

