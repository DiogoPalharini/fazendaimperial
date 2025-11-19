import {
  LayoutDashboard,
  Truck,
  FileText,
  Tractor,
  Package,
  Wallet,
  ClipboardList,
  CloudSun,
  FlaskConical,
  Sprout,
  Users,
} from 'lucide-react'
import type { ModuleDefinition } from '../types/module'

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    name: 'Visão Geral',
    description: 'Painel executivo com indicadores em tempo real da operação da fazenda.',
    category: 'estrategico',
    icon: LayoutDashboard,
    tags: ['monitoramento', 'kpi'],
  },
  {
    key: 'carregamento',
    path: '/carregamento',
    name: 'Carregamento de Caminhão',
    description: 'Controle de filas, pesagem e rastreio das expedições.',
    category: 'operacional',
    icon: Truck,
    tags: ['logística'],
  },
  {
    key: 'nota-fiscal',
    path: '/nota-fiscal',
    name: 'Notas Fiscais',
    description: 'Gestão de NF-e emitidas e recebidas com validação automática.',
    category: 'financeiro',
    icon: FileText,
  },
  {
    key: 'maquinas',
    path: '/maquinas',
    name: 'Máquinas e Equipamentos',
    description: 'Telemetria, manutenção e disponibilidade dos equipamentos.',
    category: 'operacional',
    icon: Tractor,
    tags: ['telemetria'],
  },
  {
    key: 'insumos',
    path: '/insumos',
    name: 'Controle de Insumos',
    description: 'Entrada, saída e rastreabilidade do estoque de insumos.',
    category: 'operacional',
    icon: Package,
  },
  {
    key: 'financeiro',
    path: '/financeiro',
    name: 'Financeiro',
    description: 'Fluxo de caixa, contas a pagar e receitas por cultura.',
    category: 'financeiro',
    icon: Wallet,
  },
  {
    key: 'atividades',
    path: '/atividades',
    name: 'Atividades',
    description: 'Planejamento diário, controle de talhões e checklist de execução.',
    category: 'operacional',
    icon: ClipboardList,
  },
  {
    key: 'meteorologia',
    path: '/meteorologia',
    name: 'Meteorologia',
    description: 'Monitoramento climático hiperlocal com alertas proativos.',
    category: 'estrategico',
    icon: CloudSun,
  },
  {
    key: 'solo',
    path: '/solo',
    name: 'Análise de Solo',
    description: 'Mapa de fertilidade, condutividade e recomendações por talhão.',
    category: 'estrategico',
    icon: FlaskConical,
  },
  {
    key: 'safra',
    path: '/safra',
    name: 'Gestão de Safras',
    description: 'Planejamento das safras, custos e produtividade comparada.',
    category: 'estrategico',
    icon: Sprout,
  },
  {
    key: 'usuarios',
    path: '/usuarios',
    name: 'Usuários',
    description: 'Administração dos usuários internos e seus perfis de acesso.',
    category: 'suporte',
    icon: Users,
  },
]

export const DEFAULT_ENABLED_MODULES = MODULE_DEFINITIONS.map((module) => module.key)



