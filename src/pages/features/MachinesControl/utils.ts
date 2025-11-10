export function formatHours(value: number): string {
  return `${value.toLocaleString('pt-BR')} h`
}

export function formatFuel(value: number): string {
  return `${value.toFixed(1)} L/h`
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR')
}

export function getMaintenanceStatus(date: string) {
  const today = new Date()
  const maintenanceDate = new Date(date)
  const diffTime = maintenanceDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { status: 'overdue', days: Math.abs(diffDays), label: 'Atrasada' }
  if (diffDays <= 7) return { status: 'urgent', days: diffDays, label: 'Urgente' }
  if (diffDays <= 30) return { status: 'warning', days: diffDays, label: 'Próxima' }
  return { status: 'ok', days: diffDays, label: 'Agendada' }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

