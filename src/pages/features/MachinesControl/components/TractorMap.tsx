import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { TractorTelemetry } from '../types'

// Coordenadas centrais da fazenda
const FARM_CENTER = {
  lat: -13.640478551735246,
  lng: -59.302807777717724,
}

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

// Ícone customizado para trator
function getTractorIcon(status: string) {
  const color = status === 'Em movimento' ? '#3a7d44' : status === 'Ligado' ? '#e9b543' : '#999'
  return L.divIcon({
    className: 'custom-tractor-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      ">🚜</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

type TractorMapProps = {
  tractors: TractorTelemetry[]
  selectedTractor?: string | null
  onTractorClick?: (tractor: TractorTelemetry) => void
}

export default function TractorMap({ tractors, selectedTractor, onTractorClick }: TractorMapProps) {
  return (
    <div className="tractor-map-container">
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

        {tractors.map((tractor) => (
          <Marker
            key={tractor.machineId}
            position={[tractor.latitude, tractor.longitude]}
            icon={getTractorIcon(tractor.status)}
            eventHandlers={{
              click: () => {
                onTractorClick?.(tractor)
              },
            }}
          >
            <Popup>
              <div className="tractor-popup">
                <strong>{tractor.nome}</strong>
                <br />
                <span>{tractor.identificacao}</span>
                <br />
                <br />
                <div style={{ fontSize: '0.9rem' }}>
                  <div>Status: <strong>{tractor.status}</strong></div>
                  {tractor.status === 'Em movimento' && (
                    <>
                      <div>Velocidade: {Math.round(tractor.velocidade * 10) / 10} km/h</div>
                      <div>Combustível: {Math.round(tractor.nivelCombustivel)}%</div>
                    </>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

