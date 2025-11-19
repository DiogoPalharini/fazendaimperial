import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
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
  FlaskConical,
  ShieldCheck,
  X,
  Sun,
  Moon,
} from 'lucide-react'

type SidebarProps = {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { key: 'system-admin', path: '/admin/sistema', translationKey: 'sidebar.systemAdmin', Icon: ShieldCheck },
  { key: 'dashboard', path: '/dashboard', translationKey: 'sidebar.dashboard', Icon: LayoutDashboard },
  { key: 'truck-loading', path: '/carregamento', translationKey: 'sidebar.truckLoading', Icon: Truck },
  { key: 'invoice', path: '/nota-fiscal', translationKey: 'sidebar.invoice', Icon: FileText },
  { key: 'machines', path: '/maquinas', translationKey: 'sidebar.machines', Icon: Tractor },
  { key: 'inputs', path: '/insumos', translationKey: 'sidebar.inputs', Icon: Package },
  { key: 'finance', path: '/financeiro', translationKey: 'sidebar.finance', Icon: Wallet },
  { key: 'activities', path: '/atividades', translationKey: 'sidebar.activities', Icon: ClipboardList },
  { key: 'meteorologia', path: '/meteorologia', translationKey: 'sidebar.meteorology', Icon: Cloud },
  { key: 'solo', path: '/solo', translationKey: 'sidebar.soil', Icon: FlaskConical },
  { key: 'safra', path: '/safra', translationKey: 'sidebar.harvest', Icon: Sprout },
  { key: 'users', path: '/usuarios', translationKey: 'sidebar.users', Icon: Users },
]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const t = useTranslation()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const isActive = (path: string) => location.pathname === path

  const ToggleIcon = isOpen ? ChevronLeft : ChevronRight

  return (
    <>
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
          <button
            className={`settings-btn ${isOpen ? 'open' : ''}`}
            title={t('layout.settings')}
            aria-label={t('layout.settings')}
            type="button"
            onClick={() => setSettingsModalOpen(true)}
          >
            <Settings size={22} />
            {isOpen && <span className="settings-label">Configurações</span>}
          </button>
        </div>
      </aside>

      {settingsModalOpen && (
        <div className="settings-modal" role="dialog" aria-modal="true" onClick={() => setSettingsModalOpen(false)}>
          <div className="settings-modal__card" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <h3>Configurações</h3>
                <p>Personalize sua experiência</p>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setSettingsModalOpen(false)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </header>

            <div className="settings-content">
              <div className="settings-section">
                <h4>
                  <Settings size={18} />
                  Aparência
                </h4>
                <div className="settings-option">
                  <label htmlFor="theme-select">Tema</label>
                  <div className="theme-selector">
                    <button
                      type="button"
                      className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => setTheme('light')}
                    >
                      <Sun size={18} />
                      <span>Claro</span>
                    </button>
                    <button
                      type="button"
                      className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => setTheme('dark')}
                    >
                      <Moon size={18} />
                      <span>Escuro</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <footer>
              <button
                type="button"
                className="primary-button"
                onClick={() => setSettingsModalOpen(false)}
              >
                Fechar
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  )
}


