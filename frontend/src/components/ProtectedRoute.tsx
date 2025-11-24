import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Se for system_admin, só pode acessar /admin/sistema
  if (user.base_role === 'system_admin') {
    if (location.pathname !== '/admin/sistema') {
      return <Navigate to="/admin/sistema" replace />
    }
    return <>{children}</>
  }

  // Se não for system_admin, não pode acessar /admin/sistema
  if (location.pathname === '/admin/sistema') {
    return <Navigate to="/dashboard" replace />
  }

  // Verificar se o role está permitido (se especificado)
  if (allowedRoles && !allowedRoles.includes(user.base_role || '')) {
    return <Navigate to={redirectTo || '/dashboard'} replace />
  }

  return <>{children}</>
}

