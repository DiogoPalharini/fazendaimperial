import type { InputItem, MovementEntry, InputCategory, MovementType } from './types'

export const INPUT_CATEGORIES: InputCategory[] = ['Fertilizantes', 'Defensivos', 'Sementes', 'Nutrição foliar']
export const MOVEMENT_TYPES: MovementType[] = ['Entrada', 'Saída']
export const RESPONSAVEIS = ['Lucas Andrade', 'Paula Souza', 'Fernanda Lima', 'Equipe Estoque']

export const INITIAL_INPUTS: InputItem[] = [
  {
    id: 'ins-1',
    nome: 'Ureia 45%',
    categoria: 'Fertilizantes',
    estoqueAtual: 12500,
    unidade: 'kg',
    estoqueMinimo: 8000,
  },
  {
    id: 'ins-2',
    nome: 'Glifosato 480 SL',
    categoria: 'Defensivos',
    estoqueAtual: 750,
    unidade: 'L',
    estoqueMinimo: 1000,
  },
  {
    id: 'ins-3',
    nome: 'Sementes de Soja - IPRO',
    categoria: 'Sementes',
    estoqueAtual: 320,
    unidade: 'sc',
    estoqueMinimo: 250,
  },
  {
    id: 'ins-4',
    nome: 'Zinco Foliar 12%',
    categoria: 'Nutrição foliar',
    estoqueAtual: 480,
    unidade: 'L',
    estoqueMinimo: 400,
  },
  {
    id: 'ins-5',
    nome: 'Fungicida Triazol',
    categoria: 'Defensivos',
    estoqueAtual: 410,
    unidade: 'L',
    estoqueMinimo: 450,
  },
]

export const FORNECEDORES = [
  'Nutrimax Agro',
  'Protecta Brasil',
  'Sementes Aurora',
  'GreenLeaf',
  'AgroTech Solutions',
  'Fertilizantes Nacional',
]

export const INITIAL_MOVEMENTS: MovementEntry[] = [
  {
    id: 'mov-1',
    tipo: 'Saída',
    itemId: 'ins-2',
    itemNome: 'Glifosato 480 SL',
    quantidade: 120,
    unidade: 'L',
    data: '2025-08-16T09:30',
    responsavel: 'Paula Souza',
    observacao: 'Aplicação no talhão 07 - cenário pós-plantio',
  },
  {
    id: 'mov-2',
    tipo: 'Entrada',
    itemId: 'ins-1',
    itemNome: 'Ureia 45%',
    quantidade: 3500,
    unidade: 'kg',
    data: '2025-08-14T15:20',
    responsavel: 'Lucas Andrade',
    fornecedor: 'Nutrimax Agro',
    valorPago: 9800.0,
    parcelado: false,
    observacao: 'Compra programada do fornecedor Nutrimax',
  },
  {
    id: 'mov-3',
    tipo: 'Saída',
    itemId: 'ins-4',
    itemNome: 'Zinco Foliar 12%',
    quantidade: 90,
    unidade: 'L',
    data: '2025-08-13T07:50',
    responsavel: 'Equipe Estoque',
  },
]

