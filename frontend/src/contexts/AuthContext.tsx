import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserRole } from '../types/user'
import { getUserByEmail, getUserById, getUserPermissions } from '../data/users'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: keyof ReturnType<typeof getUserPermissions>) => boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar se há usuário salvo no localStorage ao carregar
  useEffect(() => {
    const savedUserId = localStorage.getItem('fazenda-imperial-user-id')
    if (savedUserId) {
      const savedUser = getUserById(savedUserId)
      if (savedUser) {
        setUser(savedUser)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Simulação de delay de login
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Para demonstração, qualquer senha funciona
      const foundUser = getUserByEmail(email)
      
      if (foundUser && foundUser.ativo) {
        setUser(foundUser)
        localStorage.setItem('fazenda-imperial-user-id', foundUser.id)
        setIsLoading(false)
        return true
      }
      
      setIsLoading(false)
      return false
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('fazenda-imperial-user-id')
  }

  const hasPermission = (permission: keyof ReturnType<typeof getUserPermissions>): boolean => {
    if (!user) return false
    const permissions = getUserPermissions(user.role)
    return permissions[permission]
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    isLoading
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

