from enum import Enum

class NfeType(str, Enum):
    REMESSA = 'remessa'
    VENDA = 'venda'
    DEVOLUCAO = 'devolucao'

class CfopType(str, Enum):
    # Remessa
    REMESSA_CONSERTO = '5915'
    REMESSA_CONSIGNACAO = '5917'
    REMESSA_DEPOSITO = '5905'
    REMESSA_ARMAZEM = '5906'
    REMESSA_SECAGEM = '5934' # Remessa para Armazenagem e Secagem (Estadual)
    REMESSA_SECAGEM_INTER = '6934' # Remessa para Armazenagem e Secagem (Interestadual)
    OUTRA_SAIDA = '5949'
    
    # Venda
    VENDA_PRODUCAO = '5101'
    VENDA_MERCADORIA = '5102'

class RegimeTributario(str, Enum):
    SIMPLES_NACIONAL = '1'
    SIMPLES_EXCESSO = '2'
    NORMAL = '3'

class ModalidadeFrete(str, Enum):
    EMITENTE = '0'
    DESTINATARIO = '1'
    TERCEIROS = '2'
    SEM_FRETE = '9'

class FinalidadeEmissao(str, Enum):
    NORMAL = '1'
    COMPLEMENTAR = '2'
    AJUSTE = '3'
    DEVOLUCAO = '4'
