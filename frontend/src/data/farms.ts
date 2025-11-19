import type { Farm } from '../types/farm'
import { DEFAULT_ENABLED_MODULES } from './modules'

export const MOCK_FARMS: Farm[] = [
  {
    id: 'farm-imp-001',
    name: 'Fazenda Imperial',
    code: 'IMP-001',
    cityState: 'Sorriso • MT',
    hectares: 1250,
    modules: DEFAULT_ENABLED_MODULES,
    owner: {
      id: 'owner-01',
      name: 'Diogo Ferraz',
      email: 'diogo@imperial.com',
      phone: '+55 65 9 9999-0000',
    },
    createdAt: '2022-04-18T10:12:00Z',
    status: 'active',
    totalUsers: 42,
  },
  {
    id: 'farm-imp-002',
    name: 'Fazenda Rio Claro',
    code: 'IMP-002',
    cityState: 'Rio Verde • GO',
    hectares: 860,
    modules: ['dashboard', 'maquinas', 'insumos', 'financeiro', 'atividades', 'usuarios'],
    owner: {
      id: 'owner-02',
      name: 'Luciana Prado',
      email: 'luciana@rioclaro.com',
      phone: '+55 64 9 8888-1111',
    },
    createdAt: '2023-08-02T09:40:00Z',
    status: 'active',
    totalUsers: 27,
  },
  {
    id: 'farm-imp-003',
    name: 'Fazenda Horizonte',
    code: 'IMP-003',
    cityState: 'Luis Eduardo Magalhães • BA',
    hectares: 640,
    modules: ['dashboard', 'meteorologia', 'solo', 'safra'],
    owner: {
      id: 'owner-03',
      name: 'Rafael Albuquerque',
      email: 'rafael@horizonte.com',
    },
    createdAt: '2024-05-15T14:22:00Z',
    status: 'inactive',
    totalUsers: 11,
  },
]



