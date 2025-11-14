export function formatTemperature(value: number): string {
  return `${value.toFixed(1)}°C`
}

export function formatHumidity(value: number): string {
  return `${value}%`
}

export function formatPressure(value: number): string {
  return `${value.toFixed(1)} hPa`
}

export function formatWindSpeed(value: number): string {
  return `${value.toFixed(1)} km/h`
}

export function formatWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export function formatPrecipitation(value: number): string {
  return `${value.toFixed(1)} mm`
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR')
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getWeatherIcon(condition: string): string {
  const icons: Record<string, string> = {
    'Ensolarado': '☀️',
    'Parcialmente nublado': '⛅',
    'Nublado': '☁️',
    'Chuva': '🌧️',
    'Tempestade': '⛈️',
    'Neblina': '🌫️',
  }
  return icons[condition] || '☀️'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Ativo': '#4caf50',
    'Inativo': '#d7263d',
    'Manutenção': '#e9b543',
  }
  return colors[status] || '#666'
}

