export type TruckOption = {
  label: string
  value: string
}

export const AVAILABLE_TRUCKS: TruckOption[] = [
  { label: 'Caminhão A - Placa ABC1D23', value: 'ABC1D23' },
  { label: 'Caminhão B - Placa DEF4G56', value: 'DEF4G56' },
  { label: 'Caminhão C - Placa HIJ7K89', value: 'HIJ7K89' },
]

const TRUCK_LABEL_MAP: Record<string, string> = AVAILABLE_TRUCKS.reduce(
  (acc, option) => {
    acc[option.value] = option.label
    return acc
  },
  {} as Record<string, string>
)

export const getTruckLabel = (truckValue: string): string =>
  TRUCK_LABEL_MAP[truckValue] ?? truckValue

export const AVAILABLE_DRIVERS = [
  'João Martins',
  'Carla Ribeiro',
  'Pedro Duarte'
]

export const AVAILABLE_FARMS = [
  'Fazenda Imperial',
  'Fazenda Aurora',
  'Fazenda Esperança'
]

export const AVAILABLE_FIELDS = [
  'Talhão 01 - Soja',
  'Talhão 07 - Milho',
  'Talhão 12 - Trigo'
]

export const AVAILABLE_VARIETIES = [
  'Soja Intacta',
  'Milho Safrinha',
  'Trigo Duplo-S'
]

export const AVAILABLE_UNITS = ['kg', 'ton', 'sacas']

export const AVAILABLE_DESTINATIONS = [
  'Armazém Central',
  'Porto Seco',
  'Cliente Final - Cooperativa'
]

export const INITIAL_FORM = {
  scheduledAt: '',
  truck: '',
  driver: '',
  farm: '',
  field: '',
  product: '',
  quantity: '',
  unit: '',
  destination: '',
}

// Dados mockados para demonstração
export const MOCK_CARREGAMENTOS = [
  {
    id: '1',
    scheduledAt: '2024-01-15T10:00',
    truck: 'ABC1D23',
    driver: 'João Martins',
    farm: 'Fazenda Imperial',
    field: 'Talhão 01 - Soja',
    product: 'Soja Intacta',
    quantity: '5000',
    unit: 'kg',
    destination: 'Armazém Central',
  },
  {
    id: '2',
    scheduledAt: '2024-01-16T14:30',
    truck: 'DEF4G56',
    driver: 'Carla Ribeiro',
    farm: 'Fazenda Aurora',
    field: 'Talhão 07 - Milho',
    product: 'Milho Safrinha',
    quantity: '8000',
    unit: 'kg',
    destination: 'Porto Seco',
  },
  {
    id: '3',
    scheduledAt: '2024-01-17T08:00',
    truck: 'HIJ7K89',
    driver: 'Pedro Duarte',
    farm: 'Fazenda Esperança',
    field: 'Talhão 12 - Trigo',
    product: 'Trigo Duplo-S',
    quantity: '3000',
    unit: 'kg',
    destination: 'Cliente Final - Cooperativa',
  },
]

