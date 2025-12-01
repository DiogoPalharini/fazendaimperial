export type Carregamento = {
  id: string
  scheduledAt: string
  truck: string
  driver: string
  farm: string
  field: string
  product: string
  quantity: string
  unit: string
  destination: string
  nfe_ref?: string | null
  nfe_status?: string | null
  nfe_xml_url?: string | null
  nfe_danfe_url?: string | null
}

export type CarregamentoForm = {
  scheduledAt: string
  truck: string
  driver: string
  farm: string
  field: string
  product: string
  quantity: string
  unit: string
  destination: string
}

