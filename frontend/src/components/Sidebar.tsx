import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useTranslation } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import './Sidebar.css'
import logo from '../assets/icon.png'
import {
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  LogOut,
} from 'lucide-react'

type SidebarProps = {
  isOpen: boolean
  onToggle: () => void
}

interface MenuItem {
  key: string
  path: string
  translationKey: string
  Icon: React.ElementType
  children?: {
    key: string
    path: string
    label: string
  }[]
}

const menuItems: MenuItem[] = [
  { key: 'system-admin', path: '/admin/sistema', translationKey: 'sidebar.systemAdmin', Icon: ShieldCheck },
  { key: 'dashboard', path: '/dashboard', translationKey: 'sidebar.dashboard', Icon: LayoutDashboard },
  {
    key: 'truck-loading',
    path: '/carregamento', // Parent path (optional usage)
    translationKey: 'sidebar.truckLoading', // Need to add this key
    Icon: Truck,
    children: [
      { key: 'truck-loading-dashboard', path: '/carregamento/dashboard', label: 'Dashboard' },
      { key: 'truck-loading-list', path: '/carregamento', label: 'Gerenciar Cargas' }
    ]
  },
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

// Mapear keys dos menu items para keys de módulos
const moduleKeyMap: Record<string, string> = {
  'dashboard': 'dashboard',
  'truck-loading': 'carregamento',
  'invoice': 'nota-fiscal',
  'machines': 'maquinas',
  'inputs': 'insumos',
  'finance': 'financeiro',
  'activities': 'atividades',
  'meteorologia': 'meteorologia',
  'solo': 'solo',
  'safra': 'safra',
  'users': 'usuarios',
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const t = useTranslation()
  const { theme, setTheme } = useTheme()
  const { user, logout, allowedModules } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({})
  const isActive = (path: string) => location.pathname === path

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const ToggleIcon = isOpen ? ChevronLeft : ChevronRight

  // Filtrar menu items baseado no role do usuário e módulos permitidos
  const filteredMenuItems = useMemo(() => {
    if (!user) return []

    // Se for system_admin, mostrar apenas Administração do Sistema
    if (user.base_role === 'system_admin') {
      return menuItems.filter(item => item.key === 'system-admin')
    }

    // Para owner e outros roles, filtrar pelos módulos permitidos
    // Dashboard sempre deve aparecer
    if (allowedModules.length > 0) {
      return menuItems.filter(item => {
        if (item.key === 'system-admin') return false
        // Dashboard sempre visível
        if (item.key === 'dashboard') return true
        const moduleKey = moduleKeyMap[item.key]
        // Se o módulo estiver mapeado, verificar se está na lista de permitidos
        return moduleKey ? allowedModules.includes(moduleKey) : false
      })
    }

    // Se não tem módulos permitidos, mostrar apenas dashboard
    return menuItems.filter(item => item.key === 'dashboard')
  }, [user, allowedModules])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
            {filteredMenuItems.map((item) => {
              const { key, path, translationKey, Icon, children } = item
              const hasChildren = children && children.length > 0
              const isParentActive = hasChildren && children.some(child => isActive(child.path))
              const isOpen = openSubmenus[key]

              if (hasChildren) {
                return (
                  <li className="nav-item" key={key}>
                    <button
                      className={`nav-link ${isParentActive ? 'active' : ''}`}
                      onClick={() => toggleSubmenu(key)}
                      aria-expanded={isOpen}
                    >
                      <Icon size={22} aria-hidden="true" className="nav-icon" />
                      <span className="nav-label">{t(translationKey)}</span>
                      <ChevronDown
                        size={16}
                        className={`submenu-arrow ${isOpen ? 'open' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <ul className="submenu-list">
                        {children.map(child => (
                          <li key={child.key}>
                            <Link
                              to={child.path}
                              className={`submenu-link ${isActive(child.path) ? 'active' : ''}`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              }

              return (
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
              )
            })}
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
          <button
            className={`logout-btn ${isOpen ? 'open' : ''}`}
            title="Sair"
            aria-label="Sair"
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={22} />
            {isOpen && <span className="logout-label">Sair</span>}
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


