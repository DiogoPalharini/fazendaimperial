import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'
import logo from '../assets/icon.png'
import {
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Truck,
  FileText,
  Tractor,
  Package,
  Wallet,
  ClipboardList,
} from 'lucide-react'

type SidebarProps = {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { key: 'dashboard', path: '/dashboard', label: 'Visão Geral', Icon: LayoutDashboard },
  { key: 'truck-loading', path: '/carregamento', label: 'Carregamento de Caminhão', Icon: Truck },
  { key: 'invoice', path: '/nota-fiscal', label: 'Nota Fiscal', Icon: FileText },
  { key: 'machines', path: '/maquinas', label: 'Controle de Máquinas', Icon: Tractor },
  { key: 'inputs', path: '/insumos', label: 'Controle de Insumos', Icon: Package },
  { key: 'finance', path: '/financeiro', label: 'Controle Financeiro', Icon: Wallet },
  { key: 'activities', path: '/atividades', label: 'Controle de Atividades', Icon: ClipboardList },
]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const ToggleIcon = isOpen ? ChevronLeft : ChevronRight

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`} aria-expanded={isOpen} aria-label="Menu principal">
      <div className="sidebar-header">
        <img className="brand-logo" src={logo} alt="Fazenda Imperial" />
        <button
          type="button"
          className="sidebar-toggle"
          aria-label={isOpen ? 'Recolher menu' : 'Expandir menu'}
          aria-expanded={isOpen}
          aria-controls="sidebar-nav"
          onClick={onToggle}
        >
          <span className="sr-only">{isOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'}</span>
          <ToggleIcon size={20} aria-hidden="true" />
        </button>
      </div>

      <nav id="sidebar-nav" className="sidebar-nav" aria-label="Navegação principal">
        <ul className="nav-list">
          {menuItems.map(({ key, path, label, Icon }) => (
            <li className="nav-item" key={key}>
              <Link
                to={path}
                className={`nav-link ${isActive(path) ? 'active' : ''}`}
                title={label}
              >
                <Icon size={22} aria-hidden="true" className="nav-icon" />
                <span className="nav-label">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="icon-btn" title="Configurações" aria-label="Configurações" type="button">
          <Settings size={22} />
        </button>
      </div>
    </aside>
  )
}


