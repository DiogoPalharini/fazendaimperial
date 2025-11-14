import { User, UserRole, MenuItem, UserPermissions } from '../types/user'

// Usuários de teste
export const TEST_USERS: User[] = [
  {
    id: '1',
    nome: 'Carlos Silva',
    email: 'carlos@fazendaimperial.com',
    role: 'gestor-geral',
    avatar: '👨‍💼',
    ativo: true
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria@fazendaimperial.com',
    role: 'gerente-producao',
    avatar: '👩‍🌾',
    ativo: true
  },
  {
    id: '3',
    nome: 'João Oliveira',
    email: 'joao@fazendaimperial.com',
    role: 'gestor-estoque',
    avatar: '👨‍💼',
    ativo: true
  },
  {
    id: '4',
    nome: 'Pedro Costa',
    email: 'pedro@fazendaimperial.com',
    role: 'operador-maquina',
    avatar: '👨‍🔧',
    ativo: true
  },
  {
    id: '5',
    nome: 'Ana Lima',
    email: 'ana@fazendaimperial.com',
    role: 'engenheiro-agronomo',
    avatar: '👩‍🔬',
    ativo: true
  },
  {
    id: '6',
    nome: 'Roberto Ferreira',
    email: 'roberto@fazendaimperial.com',
    role: 'financeiro',
    avatar: '👨‍💼',
    ativo: true
  },
  {
    id: '7',
    nome: 'Fernando Alves',
    email: 'fernando@fazendaimperial.com',
    role: 'motorista-logistica',
    avatar: '👨‍🚛',
    ativo: true
  }
]

// Configuração de menus por tipo de usuário
export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Visão Geral',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['gestor-geral', 'gerente-producao', 'gestor-estoque', 'engenheiro-agronomo', 'financeiro']
  },
  {
    id: 'itens',
    label: 'Gestão de Itens',
    path: '/itens',
    icon: 'Boxes',
    roles: ['gestor-geral', 'gestor-estoque']
  },
  {
    id: 'categorias',
    label: 'Categorias',
    path: '/categorias',
    icon: 'Tags',
    roles: ['gestor-geral', 'gestor-estoque']
  },
  {
    id: 'producao',
    label: 'Produção',
    path: '/producao',
    icon: 'Sprout',
    roles: ['gestor-geral', 'gerente-producao', 'operador-maquina', 'engenheiro-agronomo']
  },
  {
    id: 'estoque',
    label: 'Controle de Estoque',
    path: '/estoque',
    icon: 'Warehouse',
    roles: ['gestor-geral', 'gestor-estoque']
  },
  {
    id: 'maquinas',
    label: 'Máquinas e Equipamentos',
    path: '/maquinas',
    icon: 'Tractor',
    roles: ['gestor-geral', 'operador-maquina']
  },
  {
    id: 'solo',
    label: 'Análise de Solo',
    path: '/solo',
    icon: 'Droplets',
    roles: ['gestor-geral', 'engenheiro-agronomo']
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    path: '/financeiro',
    icon: 'DollarSign',
    roles: ['gestor-geral', 'financeiro']
  },
  {
    id: 'logistica',
    label: 'Logística',
    path: '/logistica',
    icon: 'Truck',
    roles: ['gestor-geral', 'motorista-logistica']
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    path: '/relatorios',
    icon: 'BarChart3',
    roles: ['gestor-geral', 'gerente-producao', 'gestor-estoque', 'engenheiro-agronomo', 'financeiro']
  },
  {
    id: 'usuarios',
    label: 'Usuários',
    path: '/usuarios',
    icon: 'Users',
    roles: ['gestor-geral']
  }
]

// Permissões por tipo de usuário
export const USER_PERMISSIONS: Record<UserRole, UserPermissions> = {
  'gestor-geral': {
    canViewDashboard: true,
    canManageItems: true,
    canManageCategories: true,
    canViewReports: true,
    canManageUsers: true,
    canViewProduction: true,
    canManageInventory: true,
    canViewMachinery: true,
    canViewSoilAnalysis: true,
    canManageFinancial: true,
    canViewLogistics: true
  },
  'gerente-producao': {
    canViewDashboard: true,
    canManageItems: false,
    canManageCategories: false,
    canViewReports: true,
    canManageUsers: false,
    canViewProduction: true,
    canManageInventory: false,
    canViewMachinery: false,
    canViewSoilAnalysis: false,
    canManageFinancial: false,
    canViewLogistics: false
  },
  'gestor-estoque': {
    canViewDashboard: true,
    canManageItems: true,
    canManageCategories: true,
    canViewReports: true,
    canManageUsers: false,
    canViewProduction: false,
    canManageInventory: true,
    canViewMachinery: false,
    canViewSoilAnalysis: false,
    canManageFinancial: false,
    canViewLogistics: false
  },
  'operador-maquina': {
    canViewDashboard: false,
    canManageItems: false,
    canManageCategories: false,
    canViewReports: false,
    canManageUsers: false,
    canViewProduction: true,
    canManageInventory: false,
    canViewMachinery: true,
    canViewSoilAnalysis: false,
    canManageFinancial: false,
    canViewLogistics: false
  },
  'engenheiro-agronomo': {
    canViewDashboard: true,
    canManageItems: false,
    canManageCategories: false,
    canViewReports: true,
    canManageUsers: false,
    canViewProduction: true,
    canManageInventory: false,
    canViewMachinery: false,
    canViewSoilAnalysis: true,
    canManageFinancial: false,
    canViewLogistics: false
  },
  'financeiro': {
    canViewDashboard: true,
    canManageItems: false,
    canManageCategories: false,
    canViewReports: true,
    canManageUsers: false,
    canViewProduction: false,
    canManageInventory: false,
    canViewMachinery: false,
    canViewSoilAnalysis: false,
    canManageFinancial: true,
    canViewLogistics: false
  },
  'motorista-logistica': {
    canViewDashboard: false,
    canManageItems: false,
    canManageCategories: false,
    canViewReports: false,
    canManageUsers: false,
    canViewProduction: false,
    canManageInventory: false,
    canViewMachinery: false,
    canViewSoilAnalysis: false,
    canManageFinancial: false,
    canViewLogistics: true
  }
}

// Função para obter permissões do usuário
export function getUserPermissions(role: UserRole): UserPermissions {
  return USER_PERMISSIONS[role]
}

// Função para obter menu items baseado no role
export function getMenuItemsForRole(role: UserRole): MenuItem[] {
  return MENU_ITEMS.filter(item => item.roles.includes(role))
}

// Função para obter usuário por email (simulação de login)
export function getUserByEmail(email: string): User | null {
  return TEST_USERS.find(user => user.email === email) || null
}

// Função para obter usuário por ID
export function getUserById(id: string): User | null {
  return TEST_USERS.find(user => user.id === id) || null
}

