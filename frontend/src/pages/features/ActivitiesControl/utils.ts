export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR')
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('pt-BR')
}

export function getDaysUntilDeadline(dataFim?: string): number | null {
  if (!dataFim) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = new Date(dataFim)
  deadline.setHours(0, 0, 0, 0)
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function getDeadlineStatus(dataFim?: string): 'ok' | 'warning' | 'urgent' | 'overdue' | null {
  if (!dataFim) return null
  const days = getDaysUntilDeadline(dataFim)
  if (days === null) return null
  if (days < 0) return 'overdue'
  if (days <= 1) return 'urgent'
  if (days <= 3) return 'warning'
  return 'ok'
}

