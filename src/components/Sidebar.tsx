import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '../contexts/LanguageContext'
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
  Cloud,
  Sprout,
  Users,
} from 'lucide-react'

type SidebarProps = {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { key: 'dashboard', path: '/dashboard', translationKey: 'sidebar.dashboard', Icon: LayoutDashboard },
  { key: 'truck-loading', path: '/carregamento', translationKey: 'sidebar.truckLoading', Icon: Truck },
  { key: 'invoice', path: '/nota-fiscal', translationKey: 'sidebar.invoice', Icon: FileText },
  { key: 'machines', path: '/maquinas', translationKey: 'sidebar.machines', Icon: Tractor },
  { key: 'inputs', path: '/insumos', translationKey: 'sidebar.inputs', Icon: Package },
  { key: 'finance', path: '/financeiro', translationKey: 'sidebar.finance', Icon: Wallet },
  { key: 'activities', path: '/atividades', translationKey: 'sidebar.activities', Icon: ClipboardList },
  { key: 'meteorologia', path: '/meteorologia', translationKey: 'sidebar.meteorology', Icon: Cloud },
  { key: 'safra', path: '/safra', translationKey: 'sidebar.harvest', Icon: Sprout },
  { key: 'users', path: '/usuarios', translationKey: 'sidebar.users', Icon: Users },
]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const t = useTranslation()
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const ToggleIcon = isOpen ? ChevronLeft : ChevronRight

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`} aria-expanded={isOpen} aria-label="Menu principal">
      <div className="sidebar-header">
        <img className="brand-logo" src={logo} alt={t('layout.appName')} />
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
          {menuItems.map(({ key, path, translationKey, Icon }) => (
            <li className="nav-item" key={key}>
              <Link
                to={path}
                className={`nav-link ${isActive(path) ? 'active' : ''}`}
                title={t(translationKey)}
              >
                <Icon size={22} aria-hidden="true" className="nav-icon" />
                <span className="nav-label">{t(translationKey)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="icon-btn" title={t('layout.settings')} aria-label={t('layout.settings')} type="button">
          <Settings size={22} />
        </button>
      </div>
    </aside>
  )
}


