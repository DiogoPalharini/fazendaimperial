import type { Activity, ActivityType, ActivityStatus, ActivityPriority } from './types'

export const ACTIVITY_TYPES: ActivityType[] = ['Plantio', 'Colheita', 'Aplicação', 'Manutenção', 'Irrigação', 'Outros']
export const ACTIVITY_STATUSES: ActivityStatus[] = ['Pendente', 'Em Andamento', 'Concluída', 'Cancelada']
export const ACTIVITY_PRIORITIES: ActivityPriority[] = ['Baixa', 'Média', 'Alta', 'Urgente']

export const FUNCIONARIOS = [
  'João Silva',
  'Maria Santos',
  'Pedro Oliveira',
  'Ana Costa',
  'Carlos Ferreira',
  'Juliana Alves',
  'Roberto Lima',
  'Fernanda Souza',
]

export const TALHOES = [
  'Talhão 01',
  'Talhão 02',
  'Talhão 03',
  'Talhão 04',
  'Talhão 05',
  'Talhão 06',
  'Talhão 07',
  'Talhão 08',
]

export const CULTURAS = ['Soja', 'Milho', 'Algodão', 'Trigo', 'Café', 'Cana-de-açúcar']

// Função para obter datas relativas
const getDateString = (daysFromToday: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString().slice(0, 10)
}

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    titulo: 'Aplicação de Defensivos - Talhão 07',
    descricao: 'Aplicação de glifosato no talhão 07 para controle de plantas daninhas',
    tipo: 'Aplicação',
    funcionario: 'João Silva',
    talhao: 'Talhão 07',
    cultura: 'Soja',
    dataInicio: getDateString(-10),
    dataFim: getDateString(-10),
    status: 'Concluída',
    prioridade: 'Alta',
    dataConclusao: getDateString(-10),
    observacoes: 'Aplicação realizada com sucesso. Clima favorável.',
  },
  {
    id: 'act-2',
    titulo: 'Plantio de Soja - Talhão 03',
    descricao: 'Plantio de soja no talhão 03 com sementes IPRO',
    tipo: 'Plantio',
    funcionario: 'Maria Santos',
    talhao: 'Talhão 03',
    cultura: 'Soja',
    dataInicio: getDateString(-2),
    dataFim: getDateString(2),
    status: 'Em Andamento',
    prioridade: 'Urgente',
    observacoes: 'Plantio em andamento, previsão de conclusão para amanhã.',
  },
  {
    id: 'act-3',
    titulo: 'Manutenção de Irrigação - Talhão 05',
    descricao: 'Verificação e manutenção do sistema de irrigação do talhão 05',
    tipo: 'Manutenção',
    funcionario: 'Pedro Oliveira',
    talhao: 'Talhão 05',
    cultura: 'Milho',
    dataInicio: getDateString(-5),
    dataFim: getDateString(-3), // Esta estará atrasada (3 dias atrás)
    status: 'Pendente',
    prioridade: 'Média',
  },
  {
    id: 'act-4',
    titulo: 'Colheita de Milho - Talhão 02',
    descricao: 'Colheita de milho safra verão no talhão 02',
    tipo: 'Colheita',
    funcionario: 'Ana Costa',
    talhao: 'Talhão 02',
    cultura: 'Milho',
    dataInicio: getDateString(5),
    dataFim: getDateString(8),
    status: 'Pendente',
    prioridade: 'Alta',
  },
  {
    id: 'act-5',
    titulo: 'Irrigação - Talhão 04',
    descricao: 'Aplicação de irrigação no talhão 04 conforme cronograma',
    tipo: 'Irrigação',
    funcionario: 'Carlos Ferreira',
    talhao: 'Talhão 04',
    cultura: 'Soja',
    dataInicio: getDateString(0),
    dataFim: getDateString(1),
    status: 'Em Andamento',
    prioridade: 'Média',
  },
]

