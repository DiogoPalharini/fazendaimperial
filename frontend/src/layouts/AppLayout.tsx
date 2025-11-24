import { useEffect, useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import './AppLayout.css'
import { ChevronLeft, Menu } from 'lucide-react'

export default function AppLayout() {
  const t = useTranslation()
  const { isAuthenticated, isLoading, user } = useAuth()
  const MOBILE_BREAKPOINT = 720

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > MOBILE_BREAKPOINT
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleResize = () => {
      setSidebarOpen(window.innerWidth > MOBILE_BREAKPOINT)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const MobileToggleIcon = sidebarOpen ? ChevronLeft : Menu

  // Proteção de rotas - redirecionar para login se não autenticado
  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div
      className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}
      data-sidebar-open={sidebarOpen ? 'true' : 'false'}
    >
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <main className="content">
        <header className="header">
          <div className="header-left">
            <button
              type="button"
              className="menu-toggle"
              aria-label={sidebarOpen ? 'Recolher menu' : 'Abrir menu'}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <MobileToggleIcon size={20} aria-hidden="true" />
            </button>
            <h1 className="page-title">{t('layout.appName')}</h1>
          </div>
          <div className="header-right">
            <LanguageSelector />
            <button className="icon-button" type="button" aria-label={t('layout.notifications')}>🔔</button>
            <div className="user-chip">
              <span className="user-name">{t('layout.hello')}, {user?.name || 'Usuário'}</span>
            </div>
          </div>
        </header>

        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      </main>
    </div>
  )
}


