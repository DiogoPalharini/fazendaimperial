import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'
import logo from '../assets/Fazenda Imperial.png'
import { Boxes, LayoutDashboard, Tags, BarChart3, Settings, ChevronLeft } from 'lucide-react'

type SidebarProps = {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`} onClick={() => { if (!isOpen) onToggle() }}>
      <div className="brand">
        {isOpen && (
          <button className="toggle-btn" onClick={(e) => { e.stopPropagation(); onToggle() }} aria-label="Fechar menu">
            <ChevronLeft size={24} />
          </button>
        )}
        <img className="brand-logo" src={logo} alt="Fazenda Imperial" />
      </div>
      <nav className="nav">
        <Link to="/dashboard" title="Visão Geral" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
          <LayoutDashboard size={22} />
          <span className="label">Visão Geral</span>
        </Link>
        <Link to="/itens" title="Gestão de Itens" className={`nav-item ${isActive('/itens') ? 'active' : ''}`}>
          <Boxes size={22} />
          <span className="label">Gestão de Itens</span>
        </Link>
        <Link to="/categorias" title="Categorias" className={`nav-item ${isActive('/categorias') ? 'active' : ''}`}>
          <Tags size={22} />
          <span className="label">Categorias</span>
        </Link>
        <Link to="#" title="Relatórios" className="nav-item">
          <BarChart3 size={22} />
          <span className="label">Relatórios</span>
        </Link>
      </nav>
      <div className="toolbar">
        <button className="icon-btn" title="Configurações" aria-label="Configurações">
          <Settings size={22} />
        </button>
      </div>
    </aside>
  )
}


