export type UserRole = 
  | 'gestor-geral'
  | 'gerente-producao'
  | 'gestor-estoque'
  | 'operador-maquina'
  | 'engenheiro-agronomo'
  | 'financeiro'
  | 'motorista-logistica'
  | 'system_admin'

export interface User {
  id: string
  nome: string
  email: string
  role: UserRole
  avatar?: string
  ativo: boolean
}

export interface MenuItem {
  id: string
  label: string
  path: string
  icon: string
  roles: UserRole[]
}

export interface UserPermissions {
  canViewDashboard: boolean
  canManageItems: boolean
  canManageCategories: boolean
  canViewReports: boolean
  canManageUsers: boolean
  canViewProduction: boolean
  canManageInventory: boolean
  canViewMachinery: boolean
  canViewSoilAnalysis: boolean
  canManageFinancial: boolean
  canViewLogistics: boolean
  canManageFarms: boolean
}

