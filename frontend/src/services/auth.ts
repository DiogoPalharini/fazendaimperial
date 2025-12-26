import api from './api'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface UserResponse {
  id: number
  group_id: number
  name: string
  cpf: string
  email: string
  base_role: 'owner' | 'manager' | 'financial' | 'operational' | 'system_admin'
  active: boolean
  created_at: string
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/auth/me')
    return response.data
  },

  async getAllowedModules(): Promise<Record<string, any>> { // Using Record<string, any> temporarily to avoid type errors until full migration
    const response = await api.get('/auth/me/modules')
    return response.data
  },
}

