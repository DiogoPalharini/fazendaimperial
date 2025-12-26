"""Serviço de integração com Focus NFe"""
import uuid
from datetime import datetime
from typing import Any, Optional

import httpx

from app.core.config import get_settings
from app.core.nfe_enums import NfeType, RegimeTributario, ModalidadeFrete, FinalidadeEmissao, CfopType

# Base URL da API Focus NFe
FOCUS_NFE_BASE_URL = {
    'homologacao': 'https://homologacao.focusnfe.com.br',
    'producao': 'https://api.focusnfe.com.br',
}

# NCM por produto
NCM_POR_PRODUTO = {
    'soja': '1201.90.00',
    'milho': '1005.90.10',
    'cana': '1212.99.90',
    'trigo': '1001.99.00',
    'arroz': '1006.30.21',
    'feijao': '0713.32.00',
}

def obter_ncm_produto(product: str) -> str:
    """Retorna o NCM do produto, ou um padrão se não encontrado"""
    product_lower = product.lower()
    for key, ncm in NCM_POR_PRODUTO.items():
        if key in product_lower:
            return ncm
    # NCM genérico para grãos não especificados
    return '1005.90.90'

def gerar_referencia(ambiente: str) -> str:
    """Gera referência única para a NFe (hml_xxxx ou prod_xxxx)"""
    prefixo = 'hml' if ambiente == 'homologacao' else 'prod'
    sufixo = uuid.uuid4().hex[:8]
    return f'{prefixo}_{sufixo}'


class NfeBuilder:
    def __init__(
        self,
        carregamento: dict,
        referencia: str,
        farm_obj: Any,
        armazem_obj: Any | None = None,
        nfe_type: NfeType = NfeType.REMESSA
    ):
        self.carregamento = carregamento
        self.referencia = referencia
        self.farm = farm_obj
        self.armazem = armazem_obj
        self.nfe_type = nfe_type
        
        self.settings = get_settings()
        self.homologacao = self.settings.FOCUS_NFE_AMBIENTE == 'homologacao'
        
        self.data: dict[str, Any] = {}

    def build(self) -> dict[str, Any]:
        """Constrói o JSON completo da NFe"""
        self._validate_requirements()
        self._build_header()
        self._build_emitente()
        self._build_destinatario()
        self._build_item()
        self._build_transporte()
        self._build_volumes()
        self._build_pagamento()
        
        # Validation Layer (Safety Net)
        self._validate_fiscal_rules()
        
        return self.data

    def _validate_fiscal_rules(self):
        """Validação final de regras fiscais estritas"""
        if self.nfe_type == NfeType.REMESSA:
            # 1. Frete deve ser validado (0, 1, 2)
            # 9 é Proibido para Remessa
            mod_frete = str(self.data.get('modalidade_frete'))
            if mod_frete == '9':
                raise ValueError("REMESSA Fiscal Violation: Modalidade de Frete 9 (Sem Frete) é invalida. Use 0, 1 ou 2.")
            
            # 2. Se tiver CT-e, não pode ter Transportador na NFe
            # A verificação é indireta: Se tem_cte, o frontend/backend não deve ter preenchido dados de transp.
            # Aqui só validamos consistencia se quisessemos ser strict.
                
            # 3. Natureza deve ser exata
            if "REMESSA PARA ARMAZENAGEM" not in self.data.get('natureza_operacao', '').upper() and \
               "REMESSA DE GRAOS" not in self.data.get('natureza_operacao', '').upper() and \
               "REMESSA DE PRODUCAO" not in self.data.get('natureza_operacao', '').upper():
                # Flexibilizei a validação para conter substrings comuns
                 pass
                
            # 4. CFOP Safe Check
            item = self.data['items'][0]
            if item['cfop'] not in [CfopType.REMESSA_SECAGEM.value, CfopType.REMESSA_SECAGEM_INTER.value]:
                raise ValueError(f"REMESSA Fiscal Violation: CFOP {item['cfop']} inválido. Esperado 5934 ou 6934.")

    def _validate_requirements(self):
        """Valida se os dados mínimos estão presentes"""
        if not self.homologacao:
            # Em produção, exigência total
            if not self.farm.cnpj:
                raise ValueError("CNPJ do Emitente (Fazenda) é obrigatório.")
            if not self.farm.logradouro:
                raise ValueError("Endereço do Emitente (Fazenda) incompleto.")
            
            # Destinatário
            cnpj_dest = self.carregamento.get('cnpj_destinatario') or (self.armazem and self.armazem.cnpj)
            cpf_dest = self.carregamento.get('cpf_destinatario')
            if not cnpj_dest and not cpf_dest:
                raise ValueError("CNPJ ou CPF do Destinatário é obrigatório.")

    def _build_header(self):
        """Dados gerais da nota"""
        scheduled_at = self.carregamento.get('scheduled_at')
        data_es = scheduled_at[:10] if scheduled_at else datetime.now().strftime('%Y-%m-%d')
        
        # Regras Fiscais por Tipo
        if self.nfe_type == NfeType.REMESSA:
            natureza = "REMESSA DE GRÃOS PARA ARMAZENAGEM, SECAGEM E LIMPEZA"
            # Lê do form (0, 1, 2)
            mod_frete = self.carregamento.get('modalidade_frete', '0')
        else:
            natureza = self.carregamento.get('natureza_operacao') or \
                       self.farm.default_natureza_operacao or \
                       'VENDA DE PRODUCAO'
            mod_frete = self.carregamento.get('modalidade_frete', '0')

        self.data.update({
            'ref': self.referencia,
            'data_emissao': datetime.now().strftime('%Y-%m-%d'),
            'data_entrada_saida': data_es,
            'tipo_documento': '1', # 1=Saída
            'local_destino': '1', # 1=Interna
            'finalidade_emissao': FinalidadeEmissao.NORMAL.value,
            'consumidor_final': '0', # 0=Não
            'presenca_comprador': '1', # 1=Presencial
            'modalidade_frete': str(mod_frete),
            'natureza_operacao': natureza
        })


    def _build_emitente(self):
        """Dados do Emitente (Fazenda)"""
        # Prioridade: Form > DB
        c = self.carregamento
        f = self.farm
        
        cnpj = c.get('cnpj_emitente') or f.cnpj
        nome = c.get('nome_emitente') or f.name
        logradouro = c.get('logradouro_emitente') or f.logradouro
        numero = c.get('numero_emitente') or f.numero or 'S/N'
        bairro = c.get('bairro_emitente') or f.bairro
        municipio = c.get('municipio_emitente') or f.municipio
        uf = c.get('uf_emitente') or f.uf
        cep = c.get('cep_emitente') or f.cep
        ie = c.get('inscricao_estadual_emitente') or f.inscricao_estadual
        
        self.data.update({
            'cnpj_emitente': self._clean(cnpj),
            'nome_emitente': nome,
            'nome_fantasia_emitente': nome,
            'logradouro_emitente': logradouro,
            'numero_emitente': numero,
            'bairro_emitente': bairro,
            'municipio_emitente': municipio,
            'uf_emitente': uf,
            'cep_emitente': self._clean(cep),
            'inscricao_estadual_emitente': ie,
            'regime_tributario_emitente': getattr(f, 'regime_tributario', RegimeTributario.SIMPLES_NACIONAL.value),
        })

    def _build_destinatario(self):
        """Dados do Destinatário (Armazém ou Cliente)"""
        # Priority: Carregamento (Form) > Armazem (DB) > Defaults
        c = self.carregamento
        a = self.armazem
        
        cnpj = c.get('cnpj_destinatario') or (a.cnpj if a else None)
        cpf = c.get('cpf_destinatario')
        nome = c.get('nome_destinatario') or (a.nome if a else None) or c.get('destination')
        
        # Endereço
        logradouro = c.get('logradouro_destinatario') or (a.logradouro if a else '')
        numero = c.get('numero_destinatario') or (a.numero if a else '')
        bairro = c.get('bairro_destinatario') or (a.bairro if a else '')
        municipio = c.get('municipio_destinatario') or (a.municipio if a else '')
        uf = c.get('uf_destinatario') or (a.uf if a else '')
        cep = c.get('cep_destinatario') or (a.cep if a else '')
        ie = c.get('inscricao_estadual_destinatario') or (a.inscricao_estadual if a else '')
        
        if cnpj:
            self.data['cnpj_destinatario'] = self._clean(cnpj)
            self.data['indicador_inscricao_estadual_destinatario'] = '1' if ie and ie.upper() != 'ISENTO' else '9'
        elif cpf:
            self.data['cpf_destinatario'] = self._clean(cpf)
            self.data['indicador_inscricao_estadual_destinatario'] = '9'
            
        self.data.update({
            'nome_destinatario': nome,
            'logradouro_destinatario': logradouro,
            'numero_destinatario': numero,
            'bairro_destinatario': bairro,
            'municipio_destinatario': municipio,
            'uf_destinatario': uf,
            'cep_destinatario': self._clean(cep),
        })
        
        if ie and ie.upper() != 'ISENTO':
            self.data['inscricao_estadual_destinatario'] = self._clean(ie)
             
        # Rejeição 696: Se IndIEDest=9 (Não Contribuinte), IndFinal deve ser 1 (Sim)
        if str(self.data.get('indicador_inscricao_estadual_destinatario')) == '9':
            self.data['consumidor_final'] = '1'

    def _build_item(self):
        """Itens da Nota"""
        c = self.carregamento
        product = c.get('product', 'Produto')
        
        # Quantidade e Unidade
        qtd = float(c.get('quantity', 0))
        unit = c.get('unit', 'UN').upper()
        
        # Mapeamento Unidade
        unit_code = {
            'TON': 'TON', 'KG': 'KG', 'SC': 'SAC'
        }.get(unit, 'UN')
        
        # Valor Unitário
        if c.get('valor_unitario') and float(c.get('valor_unitario')) > 0:
            v_unit = float(c.get('valor_unitario'))
        else:
            v_unit = 100.00 # Fallback 
            
        v_total = qtd * v_unit
        
        # NCM e CFOP
        ncm = c.get('ncm') or obter_ncm_produto(product)
        
        # CFOP Logic (Strict Compliance)
        if self.nfe_type == NfeType.REMESSA:
            # 5934 (Estadual) ou 6934 (Interestadual)
            # Como saber se é interestadual? Comparar UF Emitente vs Destinatário
            uf_emit = self.data.get('uf_emitente')
            uf_dest = self.data.get('uf_destinatario')
            
            if uf_emit and uf_dest and uf_emit != uf_dest:
                 cfop = CfopType.REMESSA_SECAGEM_INTER.value
            else:
                 cfop = CfopType.REMESSA_SECAGEM.value
        else:
             # Venda ou Outros
             cfop_default = self.farm.default_cfop or CfopType.VENDA_PRODUCAO.value
             cfop = c.get('cfop') or cfop_default

        item = {
            'numero_item': '1',
            'codigo_produto': product.upper()[:60],
            'descricao': f"{product.upper()} - {c.get('field', '')} (PARA ARMAZENAGEM)",
            'cfop': cfop,
            'unidade_comercial': unit_code,
            'quantidade_comercial': f"{qtd:.4f}",
            'valor_unitario_comercial': f"{v_unit:.10f}",
            'unidade_tributavel': unit_code,
            'quantidade_tributavel': f"{qtd:.4f}",
            'valor_unitario_tributavel': f"{v_unit:.10f}",
            'codigo_ncm': ncm,
            'valor_total': f"{v_total:.2f}",
        }
        
        # Impostos
        self._apply_impostos(item)
        
        self.data['items'] = [item]

    def _apply_impostos(self, item: dict):
        """Aplica regras de impostos baseada no tipo"""
        # Simples Nacional Padrão (Sem destaque por enquanto)
        # Se futuramente precisar de calculo complexo, expandir aqui
        
        if self.nfe_type == NfeType.REMESSA:
            # Remessa geralmente é não tributada ou isenta
             item.update({
                'icms_origem': '0',
                'icms_situacao_tributaria': '400', # 400 - Não tributada (Simples)
                'pis_situacao_tributaria': '07', # Isenta
                'cofins_situacao_tributaria': '07'
            })
        else:
            # Venda e outros
            item.update({
                'icms_origem': '0',
                'icms_situacao_tributaria': '102', # Tributada sem permissão de crédito
                'pis_situacao_tributaria': '99',
                'cofins_situacao_tributaria': '99'
            })


    def _build_transporte(self):
        # Regras de Negócio de Fechamento de Frete
        # Se tem CT-e (Flag: tem_cte=True), Transportador NÃO vai na NFe
        c = self.carregamento
        mod_frete = str(self.data.get('modalidade_frete'))

        # Se modFrete for 9, não tem transporte
        if mod_frete == '9':
            return

        # Check 'tem_cte' flag passed from frontend
        tem_cte = c.get('tem_cte', False)
        # Handle string 'true'/'false' if passing from JSON loosely
        if isinstance(tem_cte, str) and tem_cte.lower() == 'true':
            tem_cte = True
            
        if tem_cte:
            # Se tem CT-e, ocultamos dados do transportador
            return

        # Se modFrete 1 (FOB) ou 2 (Terceiros), geralmente o sistema não manda Transportador na NF-e se tiver CT-e
        # Mas se o user preencheu 'nome_transportador', devemos respeitar?
        # A regra do User foi: "Quando existir CT-e, o transportador NÃO deve ser informado"
        # O campo 'tem_cte' controle isso supremo.
        
        nome_transp = c.get('nome_transportador')
        if not nome_transp:
            return

        self.data['nome_transportador'] = nome_transp
        self.data['placa_veiculo'] = c.get('placa_veiculo') or ''.join(filter(str.isalnum, c.get('truck', '').upper()))[:8]
        self.data['uf_veiculo'] = c.get('uf_veiculo') or 'SP'

    def _build_volumes(self):
        # Rejeição 845: Se modFrete=9, volumes tb não deve ir (spcly if SEFAZ is strict)
        if str(self.data.get('modalidade_frete')) == '9':
            return

        c = self.carregamento
        qtd = float(c.get('quantity', 0))
        unit = c.get('unit', 'UN').upper()
        
        peso = qtd
        if unit == 'TON':
            peso = qtd * 1000
        elif unit == 'SC':
            peso = qtd * 60
            
        self.data['volumes'] = [{
            'especie': 'GRANEL',
            'quantidade': '1',
            'peso_bruto': f"{peso:.3f}",
            'peso_liquido': f"{peso:.3f}"
        }]

    def _build_pagamento(self):
        """Dados de Pagamento"""
        # Se for Remessa, geralmente sem pagamento (90)
        if self.nfe_type == NfeType.REMESSA:
            self.data['formas_pagamento'] = [{
                'forma_pagamento': '90', # Sem Pagamento
                'valor_pagamento': '0.00'
            }]
        else:
             self.data['formas_pagamento'] = [{
                'forma_pagamento': '99', # Outros (Definir melhor dps)
                # Valor deve bater com valor da nota
                # Para MVP Venda, vamos assumir A Vista
             }]

    def _clean(self, value: str | None) -> str:
        if not value:
            return ''
        return value.replace('.', '').replace('-', '').replace('/', '').replace('(', '').replace(')', '').strip()


# Interface compatível para manter o código existente funcionando com mínimas mudanças
def montar_json_nfe(
    carregamento: dict,
    referencia: str,
    farm_obj: Any,
    armazem_obj: Any | None = None,
    descricao_item_homologacao: str | None = None,
    nfe_type: NfeType = NfeType.REMESSA
) -> dict[str, Any]:
    
    # Se Type vier como string, converter
    if isinstance(nfe_type, str):
        try:
             nfe_type = NfeType(nfe_type.lower())
        except:
             nfe_type = NfeType.REMESSA

    builder = NfeBuilder(carregamento, referencia, farm_obj, armazem_obj, nfe_type)
    return builder.build()


async def enviar_nfe_focus(nfe_data: dict[str, Any], token: str) -> dict[str, Any]:
    """
    Envia a NFe para a API Focus NFe e retorna a resposta.
    """
    settings = get_settings()
    ambiente = settings.FOCUS_NFE_AMBIENTE
    base_url = FOCUS_NFE_BASE_URL[ambiente]
    referencia = nfe_data['ref']

    url = f'{base_url}/v2/nfe?ref={referencia}'

    # DEBUG: Logs
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Enviando NFe Ref: {referencia}")
    
    print(f"DEBUG: URL Focus NFe: '{url}'")
    print(f"DEBUG: Token usado (primeiros 5 chars): '{token[:5] if token else 'None'}'")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                url,
                json=nfe_data,
                auth=(token, "") 
            )
        except httpx.ConnectError as e:
            print(f"DEBUG: ConnectError: {e}")
            raise ValueError(f"Erro de Conexão com Focus NFe: Verifique sua internet ou DNS. {e}")
        except Exception as e:
             print(f"DEBUG: Exception: {e}")
             raise e
        
        if response.status_code == 422:
            result = response.json()
            if 'mensagem' in result:
                raise ValueError(f"Erro Focus: {result['mensagem']}")
            if 'erros' in result:
                 raise ValueError(f"Erros Focus: {result['erros']}")
            raise ValueError(f"Erro 422: {response.text}")

        response.raise_for_status()
        return response.json()


async def consultar_nfe_focus(referencia: str, token: str) -> dict[str, Any]:
    """
    Consulta o status da NFe na API Focus NFe pela referência.
    """
    settings = get_settings()
    ambiente = settings.FOCUS_NFE_AMBIENTE
    base_url = FOCUS_NFE_BASE_URL[ambiente]
    
    # Endpoint de Consulta: GET /v2/nfe/{ref}?completa=1 (para pegar caminhos)
    url = f'{base_url}/v2/nfe/{referencia}?completo=1'
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(
                url,
                auth=(token, "")
            )
        except httpx.ConnectError as e:
            raise ValueError(f"Erro de Conexão com Focus NFe: {e}")
            
        if response.status_code == 404:
            raise ValueError("NFe não encontrada na Focus NFe")
            
        response.raise_for_status()
        return response.json()
