import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './AppLayout.css'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className={`layout ${sidebarOpen ? 'with-sidebar' : 'sidebar-collapsed'}`}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />

      <main className="content">
        <header className="header">
          <div className="header-left">
            <h1 className="page-title">Fazenda Imperial</h1>
          </div>
          <div className="header-right">
            <button className="icon-button" aria-label="Notificações">🔔</button>
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


