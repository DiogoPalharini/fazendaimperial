export type FarmStatus = 'active' | 'inactive'

export interface FarmOwner {
  id: string
  name: string
  email: string
  phone?: string
}

export interface Farm {
  id: string
  name: string
  code: string
  cityState: string
  hectares: number
  modules: string[]
  owner: FarmOwner
  createdAt: string
  status: FarmStatus
  totalUsers: number
}



