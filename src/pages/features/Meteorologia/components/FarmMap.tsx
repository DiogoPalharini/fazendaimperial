import { useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Sensor, Talhao } from '../types'
import { FARM_CENTER } from '../constants'
import { getStatusColor } from '../utils'

// Fix para ícones do Leaflet no React
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

// Componente para ajustar o tamanho do mapa
function MapResizeHandler() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [map])
  return null
}

type FarmMapProps = {
  sensors: Sensor[]
  talhoes: Talhao[]
  onLocationClick?: (location: { id: string; nome: string; lat: number; lng: number }) => void
}

export default function FarmMap({ sensors, talhoes, onLocationClick }: FarmMapProps) {

  const getSensorIcon = (status: string) => {
    const color = getStatusColor(status)
    return L.divIcon({
      className: 'custom-sensor-marker',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }

  return (
    <div className="farm-map-container">
      <MapContainer
        center={[FARM_CENTER.lat, FARM_CENTER.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%', borderRadius: '16px' }}
        scrollWheelZoom={true}
      >
        <MapResizeHandler />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Desenhar talhões como polígonos */}
        {talhoes.map((talhao) => {
          const polygonPoints = talhao.coordenadas.pontos.map((p) => [p.lat, p.lng] as [number, number])
          return (
            <Polygon
              key={talhao.id}
              positions={polygonPoints}
              pathOptions={{
                color: '#3a7d44',
                fillColor: '#4caf50',
                fillOpacity: 0.3,
                weight: 2,
              }}
              eventHandlers={{
                click: () => {
                  onLocationClick?.({
                    id: talhao.id,
                    nome: talhao.nome,
                    lat: talhao.coordenadas.latitude,
                    lng: talhao.coordenadas.longitude,
                  })
                },
              }}
            >
              <Popup>
                <div>
                  <strong>{talhao.nome}</strong>
                  <br />
                  Área: {talhao.area} ha
                  <br />
                  Cultura: {talhao.cultura}
                  <br />
                  Fase: {talhao.fase}
                </div>
              </Popup>
            </Polygon>
          )
        })}

        {/* Marcadores dos sensores */}
        {sensors.map((sensor) => (
          <Marker
            key={sensor.id}
            position={[sensor.latitude, sensor.longitude]}
            icon={getSensorIcon(sensor.status)}
            eventHandlers={{
              click: () => {
                onLocationClick?.({
                  id: sensor.id,
                  nome: sensor.nome,
                  lat: sensor.latitude,
                  lng: sensor.longitude,
                })
              },
            }}
          >
            <Popup>
              <div>
                <strong>{sensor.nome}</strong>
                <br />
                <span>{sensor.localizacao}</span>
                <br />
                Status: {sensor.status}
                <br />
                Temp: {sensor.temperatura.toFixed(1)}°C
                <br />
                Umidade: {sensor.umidade}%
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

