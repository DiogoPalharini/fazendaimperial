import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './AppLayout.css'
import { ChevronLeft, Menu } from 'lucide-react'

export default function AppLayout() {
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
            <h1 className="page-title">Fazenda Imperial</h1>
          </div>
          <div className="header-right">
            <button className="icon-button" type="button" aria-label="Notificações">🔔</button>
            <div className="user-chip">
              <span className="user-name">Olá, Diogo</span>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}


