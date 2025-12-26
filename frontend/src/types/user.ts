export type BaseRole =
  | 'owner'
  | 'manager'
  | 'financial'
  | 'operational'
  | 'system_admin'

// Tipo antigo mantido para compatibilidade (será removido gradualmente)
export type UserRole =
  | 'gestor-geral'
  | 'gerente-producao'
  | 'gestor-estoque'
  | 'operador-maquina'
  | 'engenheiro-agronomo'
  | 'financeiro'
  | 'motorista-logistica'
  | 'system_admin'

export type User = {
  id: string | number
  group_id?: number
  nome?: string
  name?: string
  email: string
  role?: UserRole
  base_role?: BaseRole
  avatar?: string
  ativo?: boolean
  active?: boolean
  cpf?: string
  created_at?: string
}

export type MenuItem = {
  id: string
  label: string
  path: string
  icon: string
  roles: UserRole[]
}

export type ModulePermission = {
  read: boolean
  create: boolean
  update: boolean
  delete: boolean
}

export type GranularPermissions = Record<string, ModulePermission>

export type UserPermissions = {
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
