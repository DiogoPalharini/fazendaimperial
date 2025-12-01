"""Serviço de integração com Focus NFe"""
import uuid
from datetime import datetime
from typing import Any

import httpx

from app.core.config import get_settings

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

# CFOPs comuns para transporte de grãos
CFOP_VENDA = '5933'  # Venda de produção do estabelecimento
CFOP_REMESSA = '6949'  # Remessa em consignação mercantil ou industrial


def gerar_referencia(ambiente: str) -> str:
    """Gera referência única para a NFe (hml_xxxx ou prod_xxxx)"""
    prefixo = 'hml' if ambiente == 'homologacao' else 'prod'
    sufixo = uuid.uuid4().hex[:8]
    return f'{prefixo}_{sufixo}'


def obter_ncm_produto(product: str) -> str:
    """Retorna o NCM do produto, ou um padrão se não encontrado"""
    product_lower = product.lower()
    for key, ncm in NCM_POR_PRODUTO.items():
        if key in product_lower:
            return ncm
    # NCM genérico para grãos não especificados
    return '1005.90.90'


def montar_json_nfe(
    carregamento: dict,
    referencia: str,
    cnpj_emitente: str,
    nome_emitente: str,
    endereco_emitente: dict,
    cnpj_destinatario: str | None = None,
    cpf_destinatario: str | None = None,
    nome_destinatario: str = '',
    endereco_destinatario: dict | None = None,
    descricao_item_homologacao: str | None = None,
) -> dict[str, Any]:
    """
    Monta o JSON completo da NFe conforme documentação Focus NFe 2025
    para transporte de grãos.
    """
    settings = get_settings()  # Carregar settings dentro da função para evitar cache
    ambiente = settings.FOCUS_NFE_AMBIENTE
    homologacao = ambiente == 'homologacao'

    # Em homologação, usar dados mágicos se não foram fornecidos explicitamente
    # (os dados já vêm forçados do endpoint quando em homologação)
    if homologacao:
        # Se os dados mágicos já foram passados, usar eles. Senão, forçar aqui.
        if cnpj_emitente != '11111111000111':
            cnpj_emitente = '11111111000111'
        if 'HOMOLOGACAO' not in nome_emitente.upper():
            nome_emitente = 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL'
        if not cnpj_destinatario or cnpj_destinatario != '99999999000191':
            cnpj_destinatario = '99999999000191'
        if 'HOMOLOGACAO' not in nome_destinatario.upper():
            nome_destinatario = 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL'
    else:
        if not cnpj_destinatario and not cpf_destinatario:
            raise ValueError('CNPJ ou CPF do destinatário é obrigatório em produção')

    # Converter quantidade para float
    quantidade = float(carregamento['quantity'])
    unidade = carregamento['unit'].upper()

    # Converter unidade para código da NFe
    # Códigos comuns: TON (tonelada), KG (quilograma), SC (saca)
    codigo_unidade = {
        'TON': 'TON',
        'KG': 'KG',
        'SC': 'SAC',
    }.get(unidade, 'UN')

    # Calcular peso bruto (assumindo densidade padrão se não fornecido)
    # Soja: ~750 kg/m³, Milho: ~750 kg/m³
    peso_bruto = quantidade
    if unidade == 'TON':
        peso_bruto = quantidade * 1000  # Converter para kg
    elif unidade == 'SC':
        peso_bruto = quantidade * 60  # Saca de 60kg

    # Valor unitário (exemplo - deve vir do cadastro ou ser calculado)
    valor_unitario = 100.00  # Valor padrão, deve ser ajustado
    valor_total = quantidade * valor_unitario

    # Montar JSON da NFe
    nfe_data: dict[str, Any] = {
        'ref': referencia,
        'data_emissao': datetime.now().strftime('%Y-%m-%d'),
        'data_entrada_saida': carregamento['scheduled_at'][:10] if 'scheduled_at' in carregamento else datetime.now().strftime('%Y-%m-%d'),
        'natureza_operacao': 'VENDA DE PRODUCAO DO ESTABELECIMENTO',
        'tipo_documento': '1',  # 0=Entrada, 1=Saída (venda de produção é saída)
        'local_destino': '1',  # 1=Operação interna, 2=Operação interestadual, 3=Operação com exterior
        'finalidade_emissao': '1',  # 1=Normal
        'consumidor_final': '0',  # 0=Normal, 1=Consumidor final
        'presenca_comprador': '1',  # 1=Operação presencial
        'modalidade_frete': '9' if homologacao else '0',
        'cnpj_emitente': cnpj_emitente.replace('.', '').replace('/', '').replace('-', ''),
        'nome_emitente': nome_emitente,
        'nome_fantasia_emitente': nome_emitente,
        'logradouro_emitente': endereco_emitente.get('logradouro', 'RUA EXEMPLO'),
        'numero_emitente': endereco_emitente.get('numero', '123'),
        'bairro_emitente': endereco_emitente.get('bairro', 'CENTRO'),
        'municipio_emitente': endereco_emitente.get('municipio', 'SAO PAULO'),
        'uf_emitente': endereco_emitente.get('uf', 'SP'),
        'cep_emitente': endereco_emitente.get('cep', '01000000').replace('-', ''),
        'inscricao_estadual_emitente': 'ISENTO' if homologacao else endereco_emitente.get('inscricao_estadual', '123456789'),
        'inscricao_municipal_emitente': endereco_emitente.get('inscricao_municipal', ''),
        'cnae_fiscal_emitente': endereco_emitente.get('cnae', '0111301'),  # CNAE para cultivo de soja
    }

    # Dados do destinatário
    if cnpj_destinatario:
        nfe_data['cnpj_destinatario'] = cnpj_destinatario.replace('.', '').replace('/', '').replace('-', '')
        nfe_data['indicador_inscricao_estadual_destinatario'] = '9' if homologacao else '1'
    elif cpf_destinatario:
        nfe_data['cpf_destinatario'] = cpf_destinatario.replace('.', '').replace('-', '')
        nfe_data['indicador_inscricao_estadual_destinatario'] = '9'  # 9=Não contribuinte

    nfe_data['nome_destinatario'] = nome_destinatario or carregamento.get('destination', 'DESTINATARIO')
    
    if endereco_destinatario:
        nfe_data['logradouro_destinatario'] = endereco_destinatario.get('logradouro', '')
        nfe_data['numero_destinatario'] = endereco_destinatario.get('numero', 'S/N')
        nfe_data['bairro_destinatario'] = endereco_destinatario.get('bairro', '')
        nfe_data['municipio_destinatario'] = endereco_destinatario.get('municipio', '')
        nfe_data['uf_destinatario'] = endereco_destinatario.get('uf', '')
        nfe_data['cep_destinatario'] = endereco_destinatario.get('cep', '').replace('-', '')
    else:
        # Endereço padrão para homologação
        nfe_data['logradouro_destinatario'] = 'RUA EXEMPLO'
        nfe_data['numero_destinatario'] = '456'
        nfe_data['bairro_destinatario'] = 'CENTRO'
        nfe_data['municipio_destinatario'] = 'SAO PAULO'
        nfe_data['uf_destinatario'] = 'SP'
        nfe_data['cep_destinatario'] = '01000000'

    # Itens da NFe
    ncm = obter_ncm_produto(carregamento['product'])
    
    # Usar descrição de homologação se fornecida, senão usar padrão
    if descricao_item_homologacao:
        descricao_item = descricao_item_homologacao
    elif homologacao:
        descricao_item = "NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL"
    else:
        descricao_item = f"{carregamento['product'].upper()} - {carregamento.get('field', '')}"
    
    nfe_data['items'] = [
        {
            'numero_item': '1',
            'codigo_produto': carregamento['product'].upper(),
            'descricao': descricao_item,
            'cfop': CFOP_VENDA,
            'unidade_comercial': codigo_unidade,
            'quantidade_comercial': str(quantidade),
            'valor_unitario_comercial': f'{valor_unitario:.2f}',
            'unidade_tributavel': codigo_unidade,
            'quantidade_tributavel': str(quantidade),
            'valor_unitario_tributavel': f'{valor_unitario:.2f}',
            'codigo_ncm': ncm,
            'codigo_cest': '',  # Opcional
            'valor_frete': '0.00',
            'valor_seguro': '0.00',
            'valor_desconto': '0.00',
            'valor_outras_despesas': '0.00',
            'valor_total': f'{valor_total:.2f}',
            'valor_total_tributos': '0.00',
        }
    ]

    # Dados de transporte
    # Limpar placa: remover hífen, espaços e pegar apenas os primeiros 8 caracteres alfanuméricos
    placa = ''.join(filter(str.isalnum, carregamento['truck'].upper()))[:8]
    nfe_data['nome_transportador'] = carregamento.get('driver', 'MOTORISTA')
    nfe_data['cnpj_transportador'] = ''  # Opcional
    nfe_data['inscricao_estadual_transportador'] = ''  # Opcional
    nfe_data['endereco_transportador'] = ''
    nfe_data['municipio_transportador'] = ''
    nfe_data['uf_transportador'] = ''
    nfe_data['placa_veiculo'] = placa
    # Extrair UF da placa (formato ABC1234 ou ABC1D23)
    if len(placa) >= 2:
        # Assumindo que a placa está no formato antigo (ABC1234) ou novo (ABC1D23)
        # A UF geralmente não está na placa, usar padrão
        nfe_data['uf_veiculo'] = 'SP'
    else:
        nfe_data['uf_veiculo'] = 'SP'
    nfe_data['rntc_transportador'] = ''  # Registro Nacional de Transportador de Carga

    # Volumes
    nfe_data['peso_bruto'] = f'{peso_bruto:.2f}'
    nfe_data['peso_liquido'] = f'{peso_bruto:.2f}'
    nfe_data['volumes'] = [
        {
            'quantidade': '1',
            'especie': 'GRANEL',
            'peso_bruto': f'{peso_bruto:.2f}',
            'peso_liquido': f'{peso_bruto:.2f}',
        }
    ]

    return nfe_data


async def enviar_nfe_focus(nfe_data: dict[str, Any]) -> dict[str, Any]:
    """
    Envia a NFe para a API Focus NFe e retorna a resposta.
    
    Raises:
        httpx.HTTPError: Se houver erro na comunicação com a API
        ValueError: Se a resposta da API indicar erro
    """
    settings = get_settings()  # Carregar settings dentro da função para evitar cache
    ambiente = settings.FOCUS_NFE_AMBIENTE
    base_url = FOCUS_NFE_BASE_URL[ambiente]
    token = settings.FOCUS_NFE_TOKEN
    referencia = nfe_data['ref']

    url = f'{base_url}/v2/nfe?ref={referencia}'

    headers = {
        'Authorization': f'Token token={token}',
        'Content-Type': 'application/json',
    }

    # DEBUG: Logs antes de enviar
    print(f"Enviando para URL: {url}")
    print(f"Referência: {url.split('ref=')[-1]}")

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=nfe_data, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        
        # Verificar se há erros na resposta
        if 'erros' in result and result['erros']:
            erros = result['erros']
            mensagem_erro = '; '.join([erro.get('mensagem', str(erro)) for erro in erros])
            raise ValueError(f'Erro na Focus NFe: {mensagem_erro}')
        
        return result

