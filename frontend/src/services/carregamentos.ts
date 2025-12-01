import api from './api'
import type { CarregamentoForm } from '../pages/features/TruckLoading/types'

export interface CarregamentoResponse {
  id: number
  nfe_ref: string | null
  nfe_status: string | null
  nfe_xml_url: string | null
  nfe_danfe_url: string | null
}

export const carregamentosService = {
  async gerarNFe(carregamento: CarregamentoForm): Promise<CarregamentoResponse> {
    const response = await api.post<CarregamentoResponse>('/carregamentos/gerar-nfe', carregamento)
    return response.data
  },
}

