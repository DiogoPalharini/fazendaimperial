import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types/user'
import { authService, UserResponse } from '../services/auth'
import { getUserPermissions } from '../data/users'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User | null>
  logout: () => void
  hasPermission: (permission: keyof ReturnType<typeof getUserPermissions>) => boolean
  hasModulePermission: (module: string, action?: 'read' | 'create' | 'update' | 'delete' | 'dashboard' | 'manage_weight' | 'manage_quality' | string) => boolean
  isLoading: boolean
  allowedModules: string[] // Deprecated: use granularPermissions keys
  granularPermissions: Record<string, any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

// Converter UserResponse do backend para User do frontend
function mapUserResponseToUser(userResponse: UserResponse): User {
  return {
    id: userResponse.id,
    group_id: userResponse.group_id,
    name: userResponse.name,
    email: userResponse.email,
    base_role: userResponse.base_role,
    active: userResponse.active,
    cpf: userResponse.cpf,
    created_at: userResponse.created_at,
    // Mapear base_role para role antigo para compatibilidade
    role: mapBaseRoleToOldRole(userResponse.base_role),
    ativo: userResponse.active,
  }
}

// Mapear base_role para role antigo (temporário para compatibilidade)
function mapBaseRoleToOldRole(baseRole: string): 'system_admin' | 'gestor-geral' | 'financeiro' {
  const mapping: Record<string, 'system_admin' | 'gestor-geral' | 'financeiro'> = {
    system_admin: 'system_admin',
    owner: 'gestor-geral',
    manager: 'gestor-geral',
    financial: 'financeiro',
    operational: 'gestor-geral',
  }
  return mapping[baseRole] || 'gestor-geral'
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [allowedModules, setAllowedModules] = useState<string[]>([])
  const [granularPermissions, setGranularPermissions] = useState<Record<string, any>>({})

  // Buscar módulos permitidos quando o usuário mudar
  useEffect(() => {
    if (user && user.base_role !== 'system_admin') {
      authService.getAllowedModules()
        .then(data => {
          // Se o backend retornar lista de strings (velho) ou objeto (novo), lidar com ambos
          if (Array.isArray(data)) {
            setAllowedModules(data)
            // Converter array antigo para granular (assumir read=true para todos)
            const granular: Record<string, any> = {}
            data.forEach(m => granular[m] = { read: true, dashboard: true, create: true, update: true, delete: true })
            setGranularPermissions(granular)
          } else {
            setGranularPermissions(data)
            setAllowedModules(Object.keys(data))
          }
        })
        .catch(() => {
          setAllowedModules([])
          setGranularPermissions({})
        })
    } else {
      setAllowedModules([])
      setGranularPermissions({})
    }
  }, [user])

  // Verificar se há token salvo e buscar dados do usuário
  useEffect(() => {
    const token = localStorage.getItem('integrarural-token')
    const savedUser = localStorage.getItem('integrarural-user')

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        // Validar token buscando dados atualizados do backend
        authService.getCurrentUser()
          .then((userResponse) => {
            const mappedUser = mapUserResponseToUser(userResponse)
            setUser(mappedUser)
            localStorage.setItem('integrarural-user', JSON.stringify(mappedUser))
          })
          .catch(() => {
            // Token inválido, limpar
            localStorage.removeItem('integrarural-token')
            localStorage.removeItem('integrarural-user')
            setUser(null)
          })
          .finally(() => setIsLoading(false))
      } catch {
        localStorage.removeItem('integrarural-token')
        localStorage.removeItem('integrarural-user')
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true)

    try {
      const response = await authService.login({ username: email, password })

      // Salvar token
      localStorage.setItem('integrarural-token', response.access_token)

      // Buscar dados do usuário
      const userResponse = await authService.getCurrentUser()
      const mappedUser = mapUserResponseToUser(userResponse)

      setUser(mappedUser)
      localStorage.setItem('integrarural-user', JSON.stringify(mappedUser))
      setIsLoading(false)
      return mappedUser
    } catch (error: any) {
      setIsLoading(false)
      console.error('Login error:', error)
      return null
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('integrarural-token')
    localStorage.removeItem('integrarural-user')
  }

  const hasPermission = (permission: keyof ReturnType<typeof getUserPermissions>): boolean => {
    if (!user) return false
    // Usar role antigo para compatibilidade com sistema de permissões existente
    const role = user.role || mapBaseRoleToOldRole(user.base_role || 'operational')
    const permissions = getUserPermissions(role)
    return permissions[permission]
  }

  const hasModulePermission = (module: string, action: string = 'read'): boolean => {
    // System admin tem acesso total
    if (user?.base_role === 'system_admin') return true

    // Se não tiver granular permissions carregado ainda (ou for usuario antigo), usar allowedModules
    const modulePerms = granularPermissions[module]
    if (!modulePerms) {
      // Fallback: se está na lista de allowedModules, assume true?
      // Não, se não tem granular, e está na lista, assume FULL access (comportamento antigo)
      return allowedModules.includes(module)
    }

    // Se tiver granular, checar flag específica
    return !!modulePerms[action]
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    hasModulePermission,
    isLoading,
    allowedModules, // Manter por compatibilidade
    granularPermissions
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

