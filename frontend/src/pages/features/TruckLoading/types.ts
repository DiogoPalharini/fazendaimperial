export type Carregamento = {
  id: string
  scheduledAt: string
  type: 'interno' | 'remessa' | 'venda'
  truck: string
  driver: string
  driver_document?: string | null
  farm: string
  field: string
  product: string
  quantity: string
  unit: string
  destination: string

  // Novos campos de pesagem
  peso_estimado_kg?: number | null
  peso_bruto_kg?: number | null
  tara_kg?: number | null
  peso_liquido_kg?: number | null
  umidade_percent?: number | null
  impurezas_percent?: number | null
  peso_com_desconto_fazenda?: number | null
  peso_com_desconto_armazem?: number | null
  peso_recebido_final_kg?: number | null
  armazem_destino_id?: string | null

  // Comparativo Empresa
  umidade_empresa_percent?: number | null
  impurezas_empresa_percent?: number | null
  peso_com_desconto_empresa?: number | null

  nfe_ref?: string | null
  nfe_status?: string | null
  nfe_xml_url?: string | null
  nfe_danfe_url?: string | null
  nfe_chave?: string | null
  nfe_protocolo?: string | null

  // Configs
  umidade_padrao?: number
  fator_umidade?: number
  impurezas_padrao?: number

  // Campos NFe Opcionais
  natureza_operacao?: string
  cfop?: string
  ncm?: string
  valor_unitario?: string

  // Emitente
  cnpj_emitente?: string
  nome_emitente?: string
  logradouro_emitente?: string
  numero_emitente?: string
  bairro_emitente?: string
  municipio_emitente?: string
  uf_emitente?: string
  cep_emitente?: string
  inscricao_estadual_emitente?: string

  // Destinatário
  cnpj_destinatario?: string
  nome_destinatario?: string
  logradouro_destinatario?: string
  numero_destinatario?: string
  bairro_destinatario?: string
  municipio_destinatario?: string
  uf_destinatario?: string
  cep_destinatario?: string
  indicador_inscricao_estadual_destinatario?: string
  inscricao_estadual_destinatario?: string

  // Transportador
  nome_transportador?: string
  cnpj_transportador?: string
  placa_veiculo?: string
  uf_veiculo?: string
}

export type CarregamentoForm = {
  scheduledAt: string
  type: 'interno' | 'remessa' | 'venda'
  truck: string
  driver: string
  driver_document?: string | null
  farm: string
  field: string
  product: string
  quantity: string
  unit: string
  destination: string

  // Novos campos de pesagem
  peso_estimado_kg?: number | null
  peso_bruto_kg?: number | null
  tara_kg?: number | null
  peso_liquido_kg?: number | null
  umidade_percent?: number | null
  impurezas_percent?: number | null
  peso_com_desconto_fazenda?: number | null
  peso_com_desconto_armazem?: number | null
  peso_recebido_final_kg?: number | null
  armazem_destino_id?: string | null

  // Comparativo Empresa
  umidade_empresa_percent?: number | null
  impurezas_empresa_percent?: number | null
  peso_com_desconto_empresa?: number | null

  // Configs
  umidade_padrao?: number
  fator_umidade?: number
  impurezas_padrao?: number

  // Campos NFe Opcionais
  natureza_operacao?: string
  cfop?: string
  ncm?: string
  valor_unitario?: string

  // Emitente
  cnpj_emitente?: string
  nome_emitente?: string
  logradouro_emitente?: string
  numero_emitente?: string
  bairro_emitente?: string
  municipio_emitente?: string
  uf_emitente?: string
  cep_emitente?: string
  inscricao_estadual_emitente?: string

  // Destinatário
  cnpj_destinatario?: string
  nome_destinatario?: string
  logradouro_destinatario?: string
  numero_destinatario?: string
  bairro_destinatario?: string
  municipio_destinatario?: string
  uf_destinatario?: string
  cep_destinatario?: string
  indicador_inscricao_estadual_destinatario?: string

  // Transportador
  nome_transportador?: string
  cnpj_transportador?: string
  placa_veiculo?: string
  uf_veiculo?: string
}

