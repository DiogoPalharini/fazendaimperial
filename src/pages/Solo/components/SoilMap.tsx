import { useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { SoilAnalysis } from '../types'

// Coordenadas centrais da fazenda
const FARM_CENTER = {
  lat: -13.640478551735246,
  lng: -59.302807777717724,
}

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

// Função para obter cor baseada na qualidade do solo
function getSoilQualityColor(quality: string): { fill: string; stroke: string } {
  const colors: Record<string, { fill: string; stroke: string }> = {
    excelente: { fill: '#3A7D44', stroke: '#2a5d32' },
    bom: { fill: '#6B9E4B', stroke: '#5a8a3f' },
    regular: { fill: '#E5E07B', stroke: '#d4c86a' },
    ruim: { fill: '#F4A261', stroke: '#e8934f' },
    critico: { fill: '#D7263D', stroke: '#c01e32' },
  }
  return colors[quality] || colors.regular
}

// Coordenadas dos talhões (exemplo - você pode ajustar conforme necessário)
const TALHOES_COORDENADAS: Record<string, { pontos: [number, number][] }> = {
  'Talhão A1 • Soja': {
    pontos: [
      [-13.641, -59.303],
      [-13.6405, -59.303],
      [-13.6405, -59.3025],
      [-13.641, -59.3025],
    ],
  },
  'Talhão B2 • Milho': {
    pontos: [
      [-13.6405, -59.3035],
      [-13.64, -59.3035],
      [-13.64, -59.303],
      [-13.6405, -59.303],
    ],
  },
  'Talhão C3 • Algodão': {
    pontos: [
      [-13.6415, -59.303],
      [-13.641, -59.303],
      [-13.641, -59.3025],
      [-13.6415, -59.3025],
    ],
  },
}

type SoilMapProps = {
  analyses: SoilAnalysis[]
  onFieldClick?: (field: string) => void
}

export default function SoilMap({ analyses, onFieldClick }: SoilMapProps) {
  // Criar um mapa de análises por talhão
  const analysesByField = new Map(analyses.map((a) => [a.field, a]))

  return (
    <div className="soil-map-container">
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
        {Object.entries(TALHOES_COORDENADAS).map(([fieldName, coordenadas]) => {
          const analysis = analysesByField.get(fieldName)
          const quality = analysis?.soilQuality || 'regular'
          const colors = getSoilQualityColor(quality)

          return (
            <Polygon
              key={fieldName}
              positions={coordenadas.pontos}
              pathOptions={{
                color: colors.stroke,
                fillColor: colors.fill,
                fillOpacity: 0.5,
                weight: 3,
              }}
              eventHandlers={{
                click: () => {
                  onFieldClick?.(fieldName)
                },
              }}
            >
              <Popup>
                <div className="soil-popup">
                  <strong>{fieldName}</strong>
                  {analysis ? (
                    <>
                      <div className="popup-quality">
                        <span
                          className="quality-badge"
                          style={{ backgroundColor: colors.fill }}
                        >
                          Qualidade: {quality.charAt(0).toUpperCase() + quality.slice(1)}
                        </span>
                      </div>
                      <div className="popup-details">
                        <div>
                          <strong>pH:</strong> {analysis.ph}
                        </div>
                        <div>
                          <strong>Fósforo:</strong> {analysis.phosphorus} mg/dm³
                        </div>
                        <div>
                          <strong>Potássio:</strong> {analysis.potassium} mg/dm³
                        </div>
                        <div>
                          <strong>Última análise:</strong> {analysis.date}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="popup-no-analysis">Sem análise registrada</div>
                  )}
                </div>
              </Popup>
            </Polygon>
          )
        })}
      </MapContainer>
    </div>
  )
}


