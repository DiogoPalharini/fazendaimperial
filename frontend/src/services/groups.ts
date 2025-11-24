import api from './api'

export interface Farm {
  id: number
  name: string
  certificate_a1?: string | null
  modules?: Record<string, any> | null
  created_at: string
}

export interface Owner {
  id: number
  name: string
  cpf: string
  email: string
}

export interface Group {
  id: number
  owner_id: number | null
  name: string
  created_at: string
  farms: Farm[]
  owner?: Owner | null
}

export interface OwnerCreate {
  name: string
  cpf: string
  email: string
  password: string
}

export interface FarmCreate {
  name: string
  certificate_a1?: string
  modules?: Record<string, any>
}

export interface GroupWithOwnerFarmCreate {
  group: {
    name: string
  }
  owner: OwnerCreate
  farm?: FarmCreate
}

export interface GroupUpdate {
  name?: string
  owner_id?: number | null
}

export const groupsService = {
  async createGroupWithOwnerFarm(payload: GroupWithOwnerFarmCreate): Promise<Group> {
    const response = await api.post<Group>('/groups/with-owner-farm', payload)
    return response.data
  },

  async getGroups(): Promise<Group[]> {
    const response = await api.get<Group[]>('/groups')
    return response.data
  },

  async getGroup(groupId: number): Promise<Group> {
    const response = await api.get<Group>(`/groups/${groupId}`)
    return response.data
  },

  async updateGroup(groupId: number, payload: GroupUpdate): Promise<Group> {
    const response = await api.patch<Group>(`/groups/${groupId}`, payload)
    return response.data
  },

  async deleteGroup(groupId: number): Promise<void> {
    await api.delete(`/groups/${groupId}`)
  },

  async updateGroupFull(groupId: number, payload: any): Promise<Group> {
    const response = await api.patch<Group>(`/groups/${groupId}/full`, payload)
    return response.data
  },
}

