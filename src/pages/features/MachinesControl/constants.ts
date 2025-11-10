import type { Machine, MaintenanceLog, MachineType, MachineStatus, MachineForm, TractorTelemetry } from './types'

export const MACHINE_TYPES: MachineType[] = ['Trator', 'Caminhão', 'Caminhonete']
export const MACHINE_STATUSES: MachineStatus[] = ['Disponível', 'Em operação', 'Em manutenção']

export const INITIAL_MACHINES: Machine[] = [
  {
    id: 'm-1',
    nome: 'Trator Massey 7725',
    tipo: 'Trator',
    identificacao: 'AAA1B23',
    status: 'Em operação',
    horasTrabalhadas: 2834,
    consumoMedio: 24.6,
    ultimaManutencao: '2025-07-16',
    proximaManutencao: '2025-09-15',
  },
  {
    id: 'm-2',
    nome: 'Caminhão Volvo FH',
    tipo: 'Caminhão',
    identificacao: 'BCX4D56',
    status: 'Disponível',
    horasTrabalhadas: 1920,
    consumoMedio: 32.1,
    ultimaManutencao: '2025-06-30',
    proximaManutencao: '2025-10-02',
  },
  {
    id: 'm-3',
    nome: 'Caminhonete Hilux 4x4',
    tipo: 'Caminhonete',
    identificacao: 'HIL-9281',
    status: 'Em manutenção',
    horasTrabalhadas: 1120,
    consumoMedio: 12.4,
    ultimaManutencao: '2025-08-01',
    proximaManutencao: '2025-08-28',
  },
  {
    id: 'm-4',
    nome: 'Trator John Deere 7R',
    tipo: 'Trator',
    identificacao: 'JDR-7710',
    status: 'Disponível',
    horasTrabalhadas: 3250,
    consumoMedio: 26.9,
    ultimaManutencao: '2025-07-02',
    proximaManutencao: '2025-08-31',
  },
]

export const INITIAL_MAINTENANCE: MaintenanceLog[] = [
  {
    id: 'log-1',
    machineId: 'm-3',
    machineName: 'Caminhonete Hilux 4x4',
    tipo: 'Revisão',
    data: '2025-08-10',
    observacao: 'Revisão geral dos 1.000 km e alinhamento da suspensão',
  },
  {
    id: 'log-2',
    machineId: 'm-1',
    machineName: 'Trator Massey 7725',
    tipo: 'Troca de óleo',
    data: '2025-08-03',
    observacao: 'Troca de filtros e óleo hidráulico',
  },
  {
    id: 'log-3',
    machineId: 'm-2',
    machineName: 'Caminhão Volvo FH',
    tipo: 'Substituição de peças',
    data: '2025-07-22',
    observacao: 'Substituição de pastilhas de freio dianteiras',
  },
]

export const emptyForm: MachineForm = {
  nome: '',
  tipo: 'Trator',
  identificacao: '',
  status: 'Disponível',
  horasTrabalhadas: 0,
  consumoMedio: 0,
  ultimaManutencao: '',
  proximaManutencao: '',
}

// Coordenadas centrais da fazenda (mesmas do Meteorologia)
const FARM_CENTER_LAT = -13.640478551735246
const FARM_CENTER_LNG = -59.302807777717724

// Dados simulados de telemetria em tempo real
export const INITIAL_TELEMETRY: TractorTelemetry[] = [
  {
    machineId: 'm-1',
    nome: 'Trator Massey 7725',
    identificacao: 'AAA1B23',
    latitude: FARM_CENTER_LAT + 0.001,
    longitude: FARM_CENTER_LNG + 0.0005,
    velocidade: 8.5,
    rotacaoMotor: 1850,
    nivelCombustivel: 72,
    nivelOleo: 85,
    temperaturaMotor: 82,
    temperaturaHidraulico: 65,
    pressaoOleo: 45,
    horasTrabalho: 2834.5,
    gastoPorHora: 125.50,
    consumoAtual: 24.6,
    ultimaAtualizacao: new Date().toISOString(),
    status: 'Em movimento',
  },
  {
    machineId: 'm-4',
    nome: 'Trator John Deere 7R',
    identificacao: 'JDR-7710',
    latitude: FARM_CENTER_LAT - 0.0015,
    longitude: FARM_CENTER_LNG + 0.001,
    velocidade: 0,
    rotacaoMotor: 0,
    nivelCombustivel: 45,
    nivelOleo: 78,
    temperaturaMotor: 0,
    temperaturaHidraulico: 0,
    pressaoOleo: 0,
    horasTrabalho: 3250.2,
    gastoPorHora: 0,
    consumoAtual: 0,
    ultimaAtualizacao: new Date().toISOString(),
    status: 'Desligado',
  },
]
