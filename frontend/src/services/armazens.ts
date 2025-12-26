import api from './api'

export interface Armazem {
    id: string
    nome: string
    cnpj?: string
    inscricao_estadual?: string
    logradouro?: string
    numero?: string
    bairro?: string
    municipio?: string
    uf?: string
    cep?: string
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
    },
    update: async (id: string, data: Partial<Armazem>) => {
        const response = await api.put<Armazem>(`/armazens/${id}`, data)
        return response.data
    },
    delete: async (id: string) => {
        const response = await api.delete<Armazem>(`/armazens/${id}`)
        return response.data
    }
}
