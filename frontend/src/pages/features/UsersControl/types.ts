export type UserRole =
  | 'funcionario-comum'
  | 'operador-maquinas'
  | 'controle-financeiro'
  | 'gerente'
  | 'administrador-local'
  | 'desativado'

export type UserStatus = 'ativo' | 'inativo'

export interface User {
  id: string
  nome: string
  email: string
  senha?: string
  cargo: UserRole
  setor?: string
  status: UserStatus
  avatar?: string
  fazenda?: string
  dataCriacao?: string
  ultimoAcesso?: string
}

export interface UserForm {
  nome: string
  email: string
  senha: string
  cargo: UserRole
  setor: string
  status: UserStatus
  fazenda: string
}

