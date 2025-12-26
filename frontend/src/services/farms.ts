import api from './api'

export interface Field {
    id: number
    farm_id: number
    name: string
    product: string
    variety?: string
    area_hectares?: number
}

export interface Farm {
    id: number
    name: string
    group_id: number
    fields: Field[]
    cnpj?: string
    inscricao_estadual?: string
    // Add other fields as needed
}

export const farmsService = {
    getAll: async () => {
        const response = await api.get<Farm[]>('/farms')
        return response.data
    },

    create: async (data: any) => {
        const response = await api.post<Farm>('/farms', data)
        return response.data
    },

    getById: async (id: number) => {
        // Currently getAll returns everything, but if we need detail:
        // const response = await api.get<Farm>(`/farms/${id}`)
        // return response.data
        // For now, list_farms includes fields, so getAll might be enough or we filter client side
        return null
    },

    delete: async (id: number) => {
        await api.delete(`/farms/${id}`)
    },

    // Fields
    createField: async (farmId: number, data: any) => {
        const response = await api.post<Field>(`/farms/${farmId}/fields`, data)
        return response.data
    },

    getFields: async (farmId: number) => {
        const response = await api.get<Field[]>(`/farms/${farmId}/fields`)
        return response.data
    },

    updateField: async (farmId: number, fieldId: number, data: any) => {
        const response = await api.put<Field>(`/farms/${farmId}/fields/${fieldId}`, data)
        return response.data
    },

    deleteField: async (farmId: number, fieldId: number) => {
        await api.delete(`/farms/${farmId}/fields/${fieldId}`)
    }
}
