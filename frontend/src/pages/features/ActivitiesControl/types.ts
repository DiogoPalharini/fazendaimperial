export type ActivityStatus = 'Pendente' | 'Em Andamento' | 'Concluída' | 'Cancelada'
export type ActivityPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente'
export type ActivityType = 'Plantio' | 'Colheita' | 'Aplicação' | 'Manutenção' | 'Irrigação' | 'Outros'

export type Activity = {
  id: string
  titulo: string
  descricao: string
  tipo: ActivityType
  funcionario: string
  talhao?: string
  cultura?: string
  dataInicio: string
  dataFim?: string
  dataConclusao?: string
  status: ActivityStatus
  prioridade: ActivityPriority
  observacoes?: string
}

