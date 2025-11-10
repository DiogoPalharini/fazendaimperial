export type MachineStatus = 'Disponível' | 'Em operação' | 'Em manutenção'
export type MachineType = 'Trator' | 'Caminhão' | 'Caminhonete'

export type Machine = {
  id: string
  nome: string
  tipo: MachineType
  identificacao: string
  status: MachineStatus
  horasTrabalhadas: number
  consumoMedio: number
  ultimaManutencao: string
  proximaManutencao: string
}

export type MaintenanceLog = {
  id: string
  machineId: string
  machineName: string
  tipo: 'Revisão' | 'Troca de óleo' | 'Substituição de peças'
  data: string
  observacao: string
}

export type MachineForm = {
  id?: string
  nome: string
  tipo: MachineType
  identificacao: string
  status: MachineStatus
  horasTrabalhadas: number
  consumoMedio: number
  ultimaManutencao: string
  proximaManutencao: string
}

// Tipos para monitoramento em tempo real
export type TractorTelemetry = {
  machineId: string
  nome: string
  identificacao: string
  latitude: number
  longitude: number
  velocidade: number // km/h
  rotacaoMotor: number // RPM
  nivelCombustivel: number // porcentagem 0-100
  nivelOleo: number // porcentagem 0-100
  temperaturaMotor: number // °C
  temperaturaHidraulico: number // °C
  pressaoOleo: number // PSI
  horasTrabalho: number // horas
  gastoPorHora: number // R$/h
  consumoAtual: number // L/h
  ultimaAtualizacao: string
  status: 'Ligado' | 'Desligado' | 'Em movimento' | 'Parado'
}
