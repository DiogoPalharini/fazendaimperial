import api from './api'

export interface User {
    id: number
    group_id: number
    name: string
    cpf: string
    email: string
    base_role: string
    active: boolean
    created_at: string
}

export interface UserCreate {
    name: string
    cpf: string
    email: string
    password: string
    base_role: string
}

export interface ModulePermission {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
}

export interface UserFarmPermissions {
    id: number
    user_id: number
    farm_id: number
    allowed_modules: Record<string, ModulePermission> | null
}

export const usersService = {
    async getGroupUsers(): Promise<User[]> {
        const response = await api.get<User[]>('/users')
        return response.data
    },

    async createUser(payload: UserCreate): Promise<User> {
        const response = await api.post<User>('/users', payload)
        return response.data
    },

    async getUserFarmPermissions(userId: number, farmId: number): Promise<UserFarmPermissions> {
        const response = await api.get<UserFarmPermissions>(`/users/${userId}/permissions/${farmId}`)
        return response.data
    },

    async updateUserFarmPermissions(userId: number, farmId: number, permissions: Record<string, ModulePermission>): Promise<UserFarmPermissions> {
        const response = await api.put<UserFarmPermissions>(`/users/${userId}/permissions/${farmId}`, { allowed_modules: permissions })
        return response.data
    }
}
