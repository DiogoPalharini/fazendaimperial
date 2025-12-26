import api from './api'

export interface DestinatarioData {
    razao_social: string
    nome_fantasia: string
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    municipio: string
    uf: string
    cep: string
    situacao_cadastral: string
}

export const destinatariosService = {
    buscarPorCNPJ: async (cnpj: string): Promise<DestinatarioData> => {
        const { data } = await api.get<DestinatarioData>(`/destinatarios/busca`, {
            params: { cnpj }
        })
        return data
    },

    buscarCEP: async (cep: string) => {
        // Fallback via BrasilAPI ou ViaCEP se não tivermos no backend (mas geralmente frontend usa viacep direto ou backend proxy)
        // Para manter consistência, se o usuario pediu 'ViaCEP' no prompt, podemos chamar direto ou usar proxy.
        // Vou usar ViaCEP direto aqui por simplicidade e velocidade no frontend.
        const cleanCep = cep.replace(/\D/g, '')
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        if (!response.ok) throw new Error('Erro ao buscar CEP')
        return response.json()
    }
}
