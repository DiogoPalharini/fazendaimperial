export type SoilQuality = 'excelente' | 'bom' | 'regular' | 'ruim' | 'critico'
export type PlantQuality = 'excelente' | 'bom' | 'regular' | 'ruim'

export interface SoilAnalysis {
  id: string
  field: string
  date: string
  ph: number
  phosphorus: number
  potassium: number
  organicMatter: number
  calcium: number
  magnesium: number
  soilQuality: SoilQuality
  plantQuality: PlantQuality
  recommendations: string[]
}


