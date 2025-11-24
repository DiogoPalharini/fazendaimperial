import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function HomeRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Redirecionar baseado no role
  if (user?.base_role === 'system_admin') {
    return <Navigate to="/admin/sistema" replace />
  }

  return <Navigate to="/dashboard" replace />
}

