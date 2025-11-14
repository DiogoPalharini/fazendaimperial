export type WeatherCondition = 'Ensolarado' | 'Parcialmente nublado' | 'Nublado' | 'Chuva' | 'Tempestade' | 'Neblina'

export type SensorStatus = 'Ativo' | 'Inativo' | 'Manutenção'

export type Sensor = {
  id: string
  nome: string
  localizacao: string
  latitude: number
  longitude: number
  status: SensorStatus
  temperatura: number
  umidade: number
  pressao: number
  velocidadeVento: number
  direcaoVento: number
  ultimaAtualizacao: string
}

export type Talhao = {
  id: string
  nome: string
  area: number // em hectares
  coordenadas: {
    latitude: number
    longitude: number
    pontos: Array<{ lat: number; lng: number }> // polígono do talhão
  }
  cultura: string
  fase: string
}

export type WeatherForecast = {
  id: string
  localizacao: string
  data: string
  hora: string
  temperatura: number
  temperaturaMin: number
  temperaturaMax: number
  umidade: number
  pressao: number
  velocidadeVento: number
  direcaoVento: number
  condicao: WeatherCondition
  precipitacao: number
  descricao: string
}

export type Location = {
  id: string
  nome: string
  latitude: number
  longitude: number
  tipo: 'Talhão' | 'Sede' | 'Armazém' | 'Outro'
}

