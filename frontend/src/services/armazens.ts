import api from './api'

export interface Armazem {
    id: string
    nome: string
    cnpj?: string
    umidade_padrao: number
    fator_umidade: number
    impurezas_padrao: number
    eh_proprio: boolean
}

export const armazensService = {
    getAll: async () => {
        const response = await api.get<Armazem[]>('/armazens/')
        return response.data
    },
    create: async (data: Omit<Armazem, 'id'>) => {
        const response = await api.post<Armazem>('/armazens/', data)
        return response.data
    }
}
