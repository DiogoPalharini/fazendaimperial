import type { Sensor, Talhao, WeatherForecast, Location, WeatherCondition } from './types'

export const WEATHER_CONDITIONS: WeatherCondition[] = [
  'Ensolarado',
  'Parcialmente nublado',
  'Nublado',
  'Chuva',
  'Tempestade',
  'Neblina',
]

// Coordenadas centrais da fazenda
const FARM_CENTER_LAT = -13.640478551735246
const FARM_CENTER_LNG = -59.302807777717724

export const FARM_CENTER = {
  lat: FARM_CENTER_LAT,
  lng: FARM_CENTER_LNG,
}

export const INITIAL_SENSORS: Sensor[] = [
  {
    id: 'sensor-1',
    nome: 'Sensor Central',
    localizacao: 'Sede da Fazenda',
    latitude: FARM_CENTER_LAT,
    longitude: FARM_CENTER_LNG,
    status: 'Ativo',
    temperatura: 28.5,
    umidade: 65,
    pressao: 1013.2,
    velocidadeVento: 12.3,
    direcaoVento: 180,
    ultimaAtualizacao: new Date().toISOString(),
  },
  {
    id: 'sensor-2',
    nome: 'Sensor Talhão 01',
    localizacao: 'Talhão 01 - Soja',
    latitude: FARM_CENTER_LAT + 0.002,
    longitude: FARM_CENTER_LNG + 0.001,
    status: 'Ativo',
    temperatura: 27.8,
    umidade: 72,
    pressao: 1012.8,
    velocidadeVento: 10.5,
    direcaoVento: 195,
    ultimaAtualizacao: new Date().toISOString(),
  },
  {
    id: 'sensor-3',
    nome: 'Sensor Talhão 02',
    localizacao: 'Talhão 02 - Milho',
    latitude: FARM_CENTER_LAT - 0.002,
    longitude: FARM_CENTER_LNG - 0.001,
    status: 'Ativo',
    temperatura: 29.2,
    umidade: 58,
    pressao: 1013.5,
    velocidadeVento: 14.1,
    direcaoVento: 170,
    ultimaAtualizacao: new Date().toISOString(),
  },
  {
    id: 'sensor-4',
    nome: 'Sensor Armazém',
    localizacao: 'Armazém Central',
    latitude: FARM_CENTER_LAT + 0.001,
    longitude: FARM_CENTER_LNG - 0.002,
    status: 'Manutenção',
    temperatura: 26.0,
    umidade: 45,
    pressao: 1014.0,
    velocidadeVento: 8.2,
    direcaoVento: 200,
    ultimaAtualizacao: new Date(Date.now() - 3600000).toISOString(),
  },
]

export const INITIAL_TALHOES: Talhao[] = [
  {
    id: 'talhao-1',
    nome: 'Talhão 01 - Soja',
    area: 45.5,
    coordenadas: {
      latitude: FARM_CENTER_LAT + 0.002,
      longitude: FARM_CENTER_LNG + 0.001,
      pontos: [
        { lat: FARM_CENTER_LAT + 0.002, lng: FARM_CENTER_LNG + 0.001 },
        { lat: FARM_CENTER_LAT + 0.003, lng: FARM_CENTER_LNG + 0.002 },
        { lat: FARM_CENTER_LAT + 0.001, lng: FARM_CENTER_LNG + 0.002 },
        { lat: FARM_CENTER_LAT + 0.001, lng: FARM_CENTER_LNG },
      ],
    },
    cultura: 'Soja',
    fase: 'Florescimento',
  },
  {
    id: 'talhao-2',
    nome: 'Talhão 02 - Milho',
    area: 38.2,
    coordenadas: {
      latitude: FARM_CENTER_LAT - 0.002,
      longitude: FARM_CENTER_LNG - 0.001,
      pontos: [
        { lat: FARM_CENTER_LAT - 0.002, lng: FARM_CENTER_LNG - 0.001 },
        { lat: FARM_CENTER_LAT - 0.001, lng: FARM_CENTER_LNG - 0.002 },
        { lat: FARM_CENTER_LAT - 0.003, lng: FARM_CENTER_LNG - 0.002 },
        { lat: FARM_CENTER_LAT - 0.003, lng: FARM_CENTER_LNG },
      ],
    },
    cultura: 'Milho',
    fase: 'Germinação',
  },
  {
    id: 'talhao-3',
    nome: 'Talhão 03 - Algodão',
    area: 52.8,
    coordenadas: {
      latitude: FARM_CENTER_LAT + 0.001,
      longitude: FARM_CENTER_LNG - 0.002,
      pontos: [
        { lat: FARM_CENTER_LAT + 0.001, lng: FARM_CENTER_LNG - 0.002 },
        { lat: FARM_CENTER_LAT + 0.002, lng: FARM_CENTER_LNG - 0.003 },
        { lat: FARM_CENTER_LAT, lng: FARM_CENTER_LNG - 0.003 },
        { lat: FARM_CENTER_LAT, lng: FARM_CENTER_LNG - 0.001 },
      ],
    },
    cultura: 'Algodão',
    fase: 'Crescimento',
  },
]

export const INITIAL_FORECASTS: WeatherForecast[] = [
  {
    id: 'forecast-1',
    localizacao: 'Sede da Fazenda',
    data: new Date().toISOString().split('T')[0],
    hora: '14:00',
    temperatura: 28.5,
    temperaturaMin: 18.0,
    temperaturaMax: 32.0,
    umidade: 65,
    pressao: 1013.2,
    velocidadeVento: 12.3,
    direcaoVento: 180,
    condicao: 'Parcialmente nublado',
    precipitacao: 0,
    descricao: 'Céu parcialmente nublado com possibilidade de chuva isolada no final da tarde',
  },
  {
    id: 'forecast-2',
    localizacao: 'Talhão 01 - Soja',
    data: new Date().toISOString().split('T')[0],
    hora: '14:00',
    temperatura: 27.8,
    temperaturaMin: 17.5,
    temperaturaMax: 31.5,
    umidade: 72,
    pressao: 1012.8,
    velocidadeVento: 10.5,
    direcaoVento: 195,
    condicao: 'Nublado',
    precipitacao: 2.5,
    descricao: 'Nublado com chuva leve prevista para as próximas horas',
  },
]

export const LOCATIONS: Location[] = [
  {
    id: 'loc-1',
    nome: 'Sede da Fazenda',
    latitude: FARM_CENTER_LAT,
    longitude: FARM_CENTER_LNG,
    tipo: 'Sede',
  },
  {
    id: 'loc-2',
    nome: 'Armazém Central',
    latitude: FARM_CENTER_LAT + 0.001,
    longitude: FARM_CENTER_LNG - 0.002,
    tipo: 'Armazém',
  },
  ...INITIAL_TALHOES.map((talhao) => ({
    id: talhao.id,
    nome: talhao.nome,
    latitude: talhao.coordenadas.latitude,
    longitude: talhao.coordenadas.longitude,
    tipo: 'Talhão' as const,
  })),
]

