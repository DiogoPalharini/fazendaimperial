import api from './api'
import type { Carregamento, CarregamentoForm } from '../pages/features/TruckLoading/types'

export type CarregamentoResponse = Carregamento

export const carregamentosService = {
  async create(carregamento: CarregamentoForm): Promise<CarregamentoResponse> {
    const response = await api.post<CarregamentoResponse>('/carregamentos/', carregamento)
    return response.data
  },
  async list(): Promise<CarregamentoResponse[]> {
    const response = await api.get<CarregamentoResponse[]>('/carregamentos/')
    return response.data
  },
  async getById(id: number): Promise<CarregamentoResponse> {
    const response = await api.get<CarregamentoResponse>(`/carregamentos/${id}`)
    return response.data
  },
  async update(id: number, carregamento: CarregamentoForm): Promise<CarregamentoResponse> {
    const response = await api.put<CarregamentoResponse>(`/carregamentos/${id}`, carregamento)
    return response.data
  },
  async getDistinctValues(field: string): Promise<string[]> {
    const response = await api.get<string[]>('/carregamentos/distinct-values', { params: { field } })
    return response.data
  },
  async syncNFe(id: number): Promise<CarregamentoResponse> {
    const response = await api.post<CarregamentoResponse>(`/carregamentos/${id}/sync-nfe`)
    return response.data
  },
  getDownloadUrl(id: number): string {
    return `${api.defaults.baseURL}/carregamentos/${id}/pdf`
  },
  async downloadPDF(id: number): Promise<Blob> {
    const response = await api.get(`/carregamentos/${id}/pdf`, { responseType: 'blob' })
    return response.data
  }
}

