import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { groupsService } from '../services/groups'
import PremiumModal from './ui/PremiumModal'
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
  Sun,
  Moon,
  LogOut,
  Building2,
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
  { key: 'armazens', path: '/armazens', translationKey: 'sidebar.warehouses', Icon: Building2 },
  { key: 'armazens', path: '/armazens', translationKey: 'sidebar.warehouses', Icon: Building2 },
  { key: 'farms', path: '/fazendas', translationKey: 'Fazendas', Icon: Sprout }, // Using Sprout or maybe MapPin? Sprout is used for Safra. Let's use MapPin or sticky note? Building2 is Armazen.
  { key: 'users', path: '/usuarios', translationKey: 'sidebar.users', Icon: Users },
]

// Mapear keys dos menu items para keys de módulos
const moduleKeyMap: Record<string, string> = {
  'dashboard': 'dashboard',
  'truck-loading': 'truck-loading',
  'invoice': 'invoice',
  'machines': 'machines',
  'inputs': 'inputs',
  'finance': 'finance',
  'activities': 'activities',
  'meteorologia': 'weather',
  'solo': 'soil',
  'safra': 'harvest',
  'users': 'users',
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const t = useTranslation()
  const { theme, setTheme } = useTheme()
  const { user, logout, allowedModules, hasModulePermission } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Settings Modal State
  const [settingsModalOpen, setSettingsModal] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({})

  // Farm Management State
  const [userFarms, setUserFarms] = useState<any[]>([])
  const [loadingFarms, setLoadingFarms] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Fetch Farms when Settings Modal opens
  useEffect(() => {
    if (settingsModalOpen && user?.group_id) {
      setLoadingFarms(true)
      groupsService.getGroup(user.group_id)
        .then(group => {
          if (group.farms) {
            setUserFarms(group.farms)
          }
        })
        .catch(err => console.error("Error loading user farms:", err))
        .finally(() => setLoadingFarms(false))
    }
  }, [settingsModalOpen, user?.group_id])

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
      return menuItems.reduce<MenuItem[]>((acc, item) => {
        if (item.key === 'system-admin') return acc

        // Dashboard principal sempre visível
        if (item.key === 'dashboard') {
          acc.push(item)
          return acc
        }

        // Logic specific for Truck Loading (has children and granularity)
        if (item.key === 'truck-loading') {
          const hasDashboard = hasModulePermission('truck-loading', 'dashboard')
          const hasList = hasModulePermission('truck-loading', 'read') ||
            hasModulePermission('truck-loading', 'manage_weight') ||
            hasModulePermission('truck-loading', 'manage_quality')

          const visibleChildren = []
          if (hasDashboard) {
            visibleChildren.push({ key: 'truck-loading-dashboard', path: '/carregamento/dashboard', label: 'Dashboard' })
          }
          if (hasList) {
            visibleChildren.push({ key: 'truck-loading-list', path: '/carregamento', label: 'Gerenciar Cargas' })
          }

          if (visibleChildren.length > 0) {
            acc.push({ ...item, children: visibleChildren })
          }
          return acc
        }

        // Verificar children se existirem (genérico para outros itens)
        if (item.children) {
          const visibleChildren = item.children.filter(child => {
            const childModuleKey = moduleKeyMap[child.key]
            return childModuleKey ? allowedModules.includes(childModuleKey) : false
          })

          if (visibleChildren.length > 0) {
            acc.push({ ...item, children: visibleChildren })
          }
          return acc
        }

        const moduleKey = moduleKeyMap[item.key]
        // Se o módulo estiver mapeado, verificar se está na lista de permitidos
        if (moduleKey && allowedModules.includes(moduleKey)) {
          acc.push(item)
        }

        return acc
      }, [])
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
            onClick={() => setSettingsModal(true)}
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

      <PremiumModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModal(false)}
        title="Configurações"
        subtitle="Personalize sua experiência"
        footer={
          <button
            type="button"
            className="premium-btn-primary"
            onClick={() => setSettingsModal(false)}
          >
            Fechar
          </button>
        }
      >
        {/*
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
        */}

        {/* Seção Dados da Fazenda */}
        <div className="settings-section">
          <h4>
            <Sprout size={18} />
            Dados da Fazenda
          </h4>
          <div style={{ padding: '0 8px' }}>
            {loadingFarms ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Carregando fazendas...</p>
            ) : userFarms.length > 0 ? (
              userFarms.map(farm => (
                <div key={farm.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#334155' }}>{farm.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {farm.municipio}/{farm.uf}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Nenhuma fazenda encontrada.</p>
            )}
          </div>
        </div>
      </PremiumModal>

      {/* Modal de Matrículas */}
    </>
  )
}


