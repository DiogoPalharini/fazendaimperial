import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'pt-BR' | 'en-US'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

// Traduções
const translations: Record<Language, Record<string, string>> = {
  'pt-BR': {
    // Common
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.close': 'Fechar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.create': 'Criar',
    'common.view': 'Ver',
    'common.details': 'Detalhes',
    'common.active': 'Ativo',
    'common.inactive': 'Inativo',
    'common.all': 'Todos',
    'common.none': 'Nenhum',
    'common.optional': 'Opcional',
    'common.required': 'Obrigatório',
    'common.name': 'Nome',
    'common.email': 'Email',
    'common.password': 'Senha',
    'common.status': 'Status',
    'common.date': 'Data',
    'common.actions': 'Ações',
    
    // Layout
    'layout.appName': 'Fazenda Imperial',
    'layout.hello': 'Olá',
    'layout.notifications': 'Notificações',
    'layout.settings': 'Configurações',
    'layout.language': 'Idioma',
    
    // Sidebar
    'sidebar.dashboard': 'Visão Geral',
    'sidebar.truckLoading': 'Carregamento de Caminhão',
    'sidebar.invoice': 'Notafiscal',
    'sidebar.machines': 'Controle de Máquinas',
    'sidebar.inputs': 'Controle de Insumos',
    'sidebar.finance': 'Controle Financeiro',
    'sidebar.activities': 'Controle de Atividades',
    'sidebar.meteorology': 'Meteorologia',
    'sidebar.soil': 'Análise de Solo',
    'sidebar.harvest': 'Gestão de Safras',
    'sidebar.users': 'Administração de Usuários',
    'sidebar.systemAdmin': 'Administração do Sistema',
    
    // Users Control
    'users.title': 'Administração de Usuários',
    'users.description': 'Gerencie os usuários da fazenda, altere permissões e níveis de acesso através do kanban.',
    'users.totalUsers': 'Total de Usuários',
    'users.activeUsers': 'Usuários Ativos',
    'users.inactiveUsers': 'Usuários Inativos',
    'users.searchPlaceholder': 'Buscar por nome, email ou setor...',
    'users.allFarms': 'Todas as Fazendas',
    'users.allSectors': 'Todos os Setores',
    'users.allStatus': 'Todos os Status',
    'users.createUser': 'Criar Novo Usuário',
    'users.commonEmployee': 'Funcionário Comum',
    'users.machineOperator': 'Operador de Máquinas',
    'users.financialControl': 'Controle Financeiro',
    'users.manager': 'Gerente',
    'users.localAdmin': 'Administrador Local',
    'users.deactivated': 'Usuários Desativados',
    'users.noUsersInCategory': 'Nenhum usuário nesta categoria',
    'users.viewDetails': 'Ver detalhes',
    'users.fullName': 'Nome Completo',
    'users.role': 'Cargo/Nível',
    'users.sector': 'Setor',
    'users.farm': 'Fazenda',
    'users.newPassword': 'Nova Senha (deixe em branco para manter a atual)',
    'users.passwordPlaceholder': 'Deixe em branco para manter',
    'users.passwordPlaceholderNew': 'Digite a senha',
    'users.createUserTitle': 'Criar Novo Usuário',
    'users.editUserTitle': 'Editar Usuário',
    'users.createUserSubtitle': 'Cadastre um novo usuário no sistema',
    'users.editUserSubtitle': 'Atualize as informações do usuário',
    'users.userDetailsTitle': 'Detalhes do Usuário',
    'users.userDetailsSubtitle': 'Informações completas do usuário',
    'users.creationDate': 'Data de Criação',
    'users.lastAccess': 'Último Acesso',
    'users.deleteConfirm': 'Tem certeza que deseja excluir o usuário',
    'users.saveChanges': 'Salvar Alterações',
    'users.createUserButton': 'Criar Usuário',
    'users.fillRequiredFields': 'Por favor, preencha todos os campos obrigatórios.',
    'users.passwordRequired': 'A senha é obrigatória para novos usuários.',
    'users.invalidEmail': 'Por favor, insira um email válido.',

    // System Admin
    'systemAdmin.title': 'Superusuário • System Admin',
    'systemAdmin.subtitle': 'Orquestre módulos e fazendas habilitadas na plataforma.',
    'systemAdmin.createFarm': 'Nova Fazenda',
    'systemAdmin.stats.totalFarms': 'Fazendas cadastradas',
    'systemAdmin.stats.activeFarms': 'Fazendas ativas',
    'systemAdmin.stats.modulesCoverage': 'Módulos ativos únicos',
    'systemAdmin.stats.totalUsers': 'Usuários sob gestão',
    'systemAdmin.table.title': 'Fazendas cadastradas',
    'systemAdmin.table.subtitle': 'Cada fazenda possui seu owner e módulos habilitados.',
    'systemAdmin.table.owner': 'Owner',
    'systemAdmin.table.modules': 'Módulos',
    'systemAdmin.table.status': 'Status',
    'systemAdmin.status.active': 'Ativa',
    'systemAdmin.status.inactive': 'Inativa',
    'systemAdmin.modal.title': 'Criar nova fazenda',
    'systemAdmin.modal.subtitle': 'Defina owner, módulos e dados base da operação.',
    'systemAdmin.modal.farmSection': 'Informações da fazenda',
    'systemAdmin.modal.ownerSection': 'Owner da fazenda',
    'systemAdmin.modal.modulesSection': 'Módulos disponíveis',
    'systemAdmin.modal.farmName': 'Nome da fazenda',
    'systemAdmin.modal.farmCode': 'Código interno (opcional)',
    'systemAdmin.modal.cityState': 'Cidade • Estado',
    'systemAdmin.modal.hectares': 'Hectares (ha)',
    'systemAdmin.modal.ownerName': 'Nome completo do owner',
    'systemAdmin.modal.ownerEmail': 'Email do owner',
    'systemAdmin.modal.ownerPhone': 'Telefone (opcional)',
    'systemAdmin.modal.ownerPassword': 'Senha provisória',
    'systemAdmin.modal.modulesSearch': 'Buscar módulos...',
    'systemAdmin.modal.modulesSelected': 'Módulos selecionados',
    'systemAdmin.modal.noModuleFound': 'Nenhum módulo encontrado para o filtro.',
    'systemAdmin.modal.submit': 'Criar fazenda',
    'systemAdmin.modal.validation.required': 'Preencha os campos obrigatórios.',
    'systemAdmin.modal.validation.email': 'Informe um email válido para o owner.',
    'systemAdmin.modal.validation.modules': 'Selecione ao menos um módulo.',
  },
  'en-US': {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.create': 'Create',
    'common.view': 'View',
    'common.details': 'Details',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.all': 'All',
    'common.none': 'None',
    'common.optional': 'Optional',
    'common.required': 'Required',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.actions': 'Actions',
    
    // Layout
    'layout.appName': 'Imperial Farm',
    'layout.hello': 'Hello',
    'layout.notifications': 'Notifications',
    'layout.settings': 'Settings',
    'layout.language': 'Language',
    
    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.truckLoading': 'Truck Loading',
    'sidebar.invoice': 'Invoice',
    'sidebar.machines': 'Machines Control',
    'sidebar.inputs': 'Inputs Control',
    'sidebar.finance': 'Finance Control',
    'sidebar.activities': 'Activities Control',
    'sidebar.meteorology': 'Meteorology',
    'sidebar.soil': 'Soil Analysis',
    'sidebar.harvest': 'Harvest Management',
    'sidebar.users': 'User Administration',
    'sidebar.systemAdmin': 'System Administration',
    
    // Users Control
    'users.title': 'User Administration',
    'users.description': 'Manage farm users, change permissions and access levels through the kanban board.',
    'users.totalUsers': 'Total Users',
    'users.activeUsers': 'Active Users',
    'users.inactiveUsers': 'Inactive Users',
    'users.searchPlaceholder': 'Search by name, email or sector...',
    'users.allFarms': 'All Farms',
    'users.allSectors': 'All Sectors',
    'users.allStatus': 'All Status',
    'users.createUser': 'Create New User',
    'users.commonEmployee': 'Common Employee',
    'users.machineOperator': 'Machine Operator',
    'users.financialControl': 'Financial Control',
    'users.manager': 'Manager',
    'users.localAdmin': 'Local Administrator',
    'users.deactivated': 'Deactivated Users',
    'users.noUsersInCategory': 'No users in this category',
    'users.viewDetails': 'View details',
    'users.fullName': 'Full Name',
    'users.role': 'Role/Level',
    'users.sector': 'Sector',
    'users.farm': 'Farm',
    'users.newPassword': 'New Password (leave blank to keep current)',
    'users.passwordPlaceholder': 'Leave blank to keep',
    'users.passwordPlaceholderNew': 'Enter password',
    'users.createUserTitle': 'Create New User',
    'users.editUserTitle': 'Edit User',
    'users.createUserSubtitle': 'Register a new user in the system',
    'users.editUserSubtitle': 'Update user information',
    'users.userDetailsTitle': 'User Details',
    'users.userDetailsSubtitle': 'Complete user information',
    'users.creationDate': 'Creation Date',
    'users.lastAccess': 'Last Access',
    'users.deleteConfirm': 'Are you sure you want to delete the user',
    'users.saveChanges': 'Save Changes',
    'users.createUserButton': 'Create User',
    'users.fillRequiredFields': 'Please fill in all required fields.',
    'users.passwordRequired': 'Password is required for new users.',
    'users.invalidEmail': 'Please enter a valid email.',

    // System Admin
    'systemAdmin.title': 'Superuser • System Admin',
    'systemAdmin.subtitle': 'Govern enabled farms and modules across the platform.',
    'systemAdmin.createFarm': 'New Farm',
    'systemAdmin.stats.totalFarms': 'Registered farms',
    'systemAdmin.stats.activeFarms': 'Active farms',
    'systemAdmin.stats.modulesCoverage': 'Unique active modules',
    'systemAdmin.stats.totalUsers': 'Users under management',
    'systemAdmin.table.title': 'Registered farms',
    'systemAdmin.table.subtitle': 'Each farm has an owner and its enabled modules.',
    'systemAdmin.table.owner': 'Owner',
    'systemAdmin.table.modules': 'Modules',
    'systemAdmin.table.status': 'Status',
    'systemAdmin.status.active': 'Active',
    'systemAdmin.status.inactive': 'Inactive',
    'systemAdmin.modal.title': 'Create new farm',
    'systemAdmin.modal.subtitle': 'Define owner, modules and baseline data.',
    'systemAdmin.modal.farmSection': 'Farm information',
    'systemAdmin.modal.ownerSection': 'Farm owner',
    'systemAdmin.modal.modulesSection': 'Available modules',
    'systemAdmin.modal.farmName': 'Farm name',
    'systemAdmin.modal.farmCode': 'Internal code (optional)',
    'systemAdmin.modal.cityState': 'City • State',
    'systemAdmin.modal.hectares': 'Hectares (ha)',
    'systemAdmin.modal.ownerName': 'Owner full name',
    'systemAdmin.modal.ownerEmail': 'Owner email',
    'systemAdmin.modal.ownerPhone': 'Phone (optional)',
    'systemAdmin.modal.ownerPassword': 'Temporary password',
    'systemAdmin.modal.modulesSearch': 'Search modules...',
    'systemAdmin.modal.modulesSelected': 'Selected modules',
    'systemAdmin.modal.noModuleFound': 'No modules found for the filter.',
    'systemAdmin.modal.submit': 'Create farm',
    'systemAdmin.modal.validation.required': 'Fill in the required fields.',
    'systemAdmin.modal.validation.email': 'Enter a valid owner email.',
    'systemAdmin.modal.validation.modules': 'Select at least one module.',
  },
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Verificar localStorage ou usar idioma do navegador
    const saved = localStorage.getItem('fazenda-imperial-language') as Language
    if (saved && (saved === 'pt-BR' || saved === 'en-US')) {
      return saved
    }
    // Detectar idioma do navegador
    const browserLang = navigator.language || navigator.languages?.[0] || 'pt-BR'
    return browserLang.startsWith('en') ? 'en-US' : 'pt-BR'
  })

  useEffect(() => {
    localStorage.setItem('fazenda-imperial-language', language)
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || key
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Hook de conveniência para tradução
export function useTranslation() {
  const { t } = useLanguage()
  return t
}

