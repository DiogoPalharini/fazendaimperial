import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Safra, Insumo, OperacaoMecanica, MaoDeObra, CustoIndireto, Depreciacao, Arrendamento, Logistica, TipoInsumo, TipoOperacao, TipoMaoDeObra, TipoArrendamento } from '../types'
import { TIPOS_INSUMO, TIPOS_OPERACAO, TIPOS_MAO_DE_OBRA, TIPOS_ARRENDAMENTO, OPERACOES_LABELS, INSUMOS_LABELS } from '../constants'
import '../SafraControl.css'

type AddCustoModalProps = {
  safra: Safra
  tipoCusto: string
  custoEditando?: any
  onClose: () => void
  onSave: (tipo: string, data: any) => void
}

export default function AddCustoModal({ safra, tipoCusto, custoEditando, onClose, onSave }: AddCustoModalProps) {
  const [formState, setFormState] = useState<any>({})

  useEffect(() => {
    if (custoEditando) {
      setFormState(custoEditando)
    } else {
      // Inicializar formulário baseado no tipo
      setFormState({
        tipo: tipoCusto === 'insumo' ? 'Semente' : tipoCusto === 'operacao' ? 'PreparoSolo' : tipoCusto === 'maoDeObra' ? 'Mensal' : tipoCusto === 'arrendamento' ? 'Arrendamento' : '',
        nome: '',
        descricao: '',
        quantidadePorHa: '',
        precoUnitario: '',
        valorPorHa: '',
        valorPorHora: '',
        numeroHoras: '',
        valorMensalOuDiaria: '',
        quantidade: '',
        periodoMeses: '',
        categoria: '',
        valorMensal: '',
        duracaoMeses: '',
        valorInicial: '',
        vidaUtilAnos: '',
        valorPorHaArr: '',
        percentual: '',
        custoPorUnidade: '',
        quantidadeLog: '',
      })
    }
  }, [custoEditando, tipoCusto])

  const handleChange = (field: string) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev: any) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let data: any = { id: custoEditando?.id || `${tipoCusto}-${Date.now()}` }

    if (tipoCusto === 'insumo') {
      const quantidadePorHa = Number(formState.quantidadePorHa)
      const precoUnitario = Number(formState.precoUnitario)
      const total = (quantidadePorHa * precoUnitario) * safra.areaTotal

      data = {
        ...data,
        tipo: formState.tipo as TipoInsumo,
        nome: formState.nome,
        quantidadePorHa,
        precoUnitario,
        total,
      }
    } else if (tipoCusto === 'operacao') {
      const valorPorHa = formState.valorPorHa ? Number(formState.valorPorHa) : undefined
      const valorPorHora = formState.valorPorHora ? Number(formState.valorPorHora) : undefined
      const numeroHoras = formState.numeroHoras ? Number(formState.numeroHoras) : undefined
      let total = 0
      if (valorPorHa !== undefined) {
        total = valorPorHa * safra.areaTotal
      } else if (valorPorHora !== undefined && numeroHoras !== undefined) {
        total = valorPorHora * numeroHoras
      }

      data = {
        ...data,
        tipo: formState.tipo as TipoOperacao,
        descricao: formState.descricao,
        valorPorHa,
        valorPorHora,
        numeroHoras,
        total,
      }
    } else if (tipoCusto === 'maoDeObra') {
      const valorMensalOuDiaria = Number(formState.valorMensalOuDiaria)
      const quantidade = Number(formState.quantidade)
      const periodoMeses = Number(formState.periodoMeses) || 1
      const total = valorMensalOuDiaria * quantidade * periodoMeses

      data = {
        ...data,
        tipo: formState.tipo as TipoMaoDeObra,
        descricao: formState.descricao,
        valorMensalOuDiaria,
        quantidade,
        periodoMeses,
        total,
      }
    } else if (tipoCusto === 'custoIndireto') {
      const valorMensal = Number(formState.valorMensal)
      const duracaoMeses = Number(formState.duracaoMeses)
      const total = valorMensal * duracaoMeses

      data = {
        ...data,
        categoria: formState.categoria,
        descricao: formState.descricao,
        valorMensal,
        duracaoMeses,
        total,
      }
    } else if (tipoCusto === 'depreciacao') {
      const valorInicial = Number(formState.valorInicial)
      const vidaUtilAnos = Number(formState.vidaUtilAnos)
      const depreciacaoAnual = valorInicial / vidaUtilAnos
      const depreciacaoPorSafra = depreciacaoAnual / 1 // Assumindo 1 safra por ano

      data = {
        ...data,
        descricao: formState.descricao,
        valorInicial,
        vidaUtilAnos,
        depreciacaoAnual,
        depreciacaoPorSafra,
      }
    } else if (tipoCusto === 'arrendamento') {
      const tipo = formState.tipo as TipoArrendamento
      let total = 0
      if (tipo === 'Arrendamento' && formState.valorPorHaArr) {
        total = Number(formState.valorPorHaArr) * safra.areaTotal
      } else if (tipo === 'Parceria' && formState.percentual) {
        const receitaBruta = safra.receitas.precoVenda.receitaBrutaPrevista
        total = receitaBruta * (Number(formState.percentual) / 100)
      }

      data = {
        ...data,
        tipo,
        valorPorHa: formState.valorPorHaArr ? Number(formState.valorPorHaArr) : undefined,
        percentual: formState.percentual ? Number(formState.percentual) : undefined,
        total,
      }
    } else if (tipoCusto === 'logistica') {
      const custoPorUnidade = Number(formState.custoPorUnidade)
      const quantidade = Number(formState.quantidadeLog)
      const total = custoPorUnidade * quantidade

      data = {
        ...data,
        descricao: formState.descricao,
        custoPorUnidade,
        quantidade,
        total,
      }
    }

    onSave(tipoCusto, data)
  }

  const getTipoLabel = () => {
    const labels: Record<string, string> = {
      insumo: 'Insumo',
      operacao: 'Operação Mecânica',
      maoDeObra: 'Mão de Obra',
      custoIndireto: 'Custo Indireto',
      depreciacao: 'Depreciação',
      arrendamento: 'Arrendamento/Parceria',
      logistica: 'Logística e Pós-colheita',
    }
    return labels[tipoCusto] || 'Custo'
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal safra-modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h3 className="modal-title">
              {custoEditando ? 'Editar' : 'Adicionar'} {getTipoLabel()}
            </h3>
            <p className="modal-subtitle">Preencha os dados do custo</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <form className="safra-form" onSubmit={handleSubmit}>
          {tipoCusto === 'insumo' && (
            <>
              <div className="form-row">
                <label>
                  Tipo de Insumo
                  <select value={formState.tipo || ''} onChange={handleChange('tipo')} required>
                    {TIPOS_INSUMO.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {INSUMOS_LABELS[tipo]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label className="full-width">
                  Nome do Insumo
                  <input
                    type="text"
                    value={formState.nome || ''}
                    onChange={handleChange('nome')}
                    placeholder="Ex: Semente de Soja RR"
                    required
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Quantidade por Hectare
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formState.quantidadePorHa || ''}
                    onChange={handleChange('quantidadePorHa')}
                    placeholder="60"
                    required
                  />
                </label>
                <label>
                  Preço Unitário
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formState.precoUnitario || ''}
                    onChange={handleChange('precoUnitario')}
                    placeholder="8.50"
                    required
                  />
                </label>
              </div>
            </>
          )}

          {tipoCusto === 'operacao' && (
            <>
              <div className="form-row">
                <label>
                  Tipo de Operação
                  <select value={formState.tipo || ''} onChange={handleChange('tipo')} required>
                    {TIPOS_OPERACAO.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {OPERACOES_LABELS[tipo]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label className="full-width">
                  Descrição
                  <input
                    type="text"
                    value={formState.descricao || ''}
                    onChange={handleChange('descricao')}
                    placeholder="Ex: Preparo do solo com grade"
                    required
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Valor por Hectare (opcional)
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formState.valorPorHa || ''}
                    onChange={handleChange('valorPorHa')}
                    placeholder="150.00"
                  />
                </label>
                <label>
                  OU Valor por Hora
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formState.valorPorHora || ''}
                    onChange={handleChange('valorPorHora')}
                    placeholder="200.00"
                  />
                </label>
                <label>
                  Número de Horas
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formState.numeroHoras || ''}
                    onChange={handleChange('numeroHoras')}
                    placeholder="8"
                  />
                </label>
              </div>
            </>
          )}

          {tipoCusto === 'maoDeObra' && (
            <>
              <div className="form-row">
                <label>
                  Tipo
                  <select value={formState.tipo || ''} onChange={handleChange('tipo')} required>
                    {TIPOS_MAO_DE_OBRA.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label className="full-width">
                  Descrição
                  <input
                    type="text"
                    value={formState.descricao || ''}
                    onChange={handleChange('descricao')}
                    placeholder="Ex: Operador de máquina"
                    required
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Valor Mensal ou por Diária
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formState.valorMensalOuDiaria || ''}
                    onChange={handleChange('valorMensalOuDiaria')}
                    placeholder="2500.00"
                    required
                  />
                </label>
                <label>
                  Quantidade
                  <input
                    type="number"
                    min={0}
                    value={formState.quantidade || ''}
                    onChange={handleChange('quantidade')}
                    placeholder="2"
                    required
                  />
                </label>
                <label>
                  Período (meses)
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={formState.periodoMeses || ''}
                    onChange={handleChange('periodoMeses')}
                    placeholder="6"
                    required
                  />
                </label>
              </div>
            </>
          )}

          {tipoCusto === 'custoIndireto' && (
            <>
              <div className="form-row">
                <label>
                  Categoria
                  <input
                    type="text"
                    value={formState.categoria || ''}
                    onChange={handleChange('categoria')}
                    placeholder="Ex: Administrativo"
                    required
                  />
                </label>
              </div>
              <div className="form-row">
                <label className="full-width">
                  Descrição
                  <input
                    type="text"
                    value={formState.descricao || ''}
                    onChange={handleChange('descricao')}
                    placeholder="Ex: Contabilidade"
                    required
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Valor Mensal
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formState.valorMensal || ''}
                    onChange={handleChange('valorMensal')}
                    placeholder="500.00"
                    required
                  />
                </label>
                <label>
                  Duração (meses)
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={formState.duracaoMeses || ''}
                    onChange={handleChange('duracaoMeses')}
                    placeholder="6"
                    required
                  />
                </label>
              </div>
            </>
          )}

          {tipoCusto === 'depreciacao' && (
            <>
              <div className="form-row">
                <label className="full-width">
                  Descrição
                  <input
                    type="text"
                    value={formState.descricao || ''}
                    onChange={handleChange('descricao')}
                    placeholder="Ex: Trator John Deere 7230"
                    required
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Valor Inicial do Bem
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formState.valorInicial || ''}
                    onChange={handleChange('valorInicial')}
                    placeholder="300000.00"
                    required
                  />
                </label>
                <label>
                  Vida Útil (anos)
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={formState.vidaUtilAnos || ''}
                    onChange={handleChange('vidaUtilAnos')}
                    placeholder="10"
                    required
                  />
                </label>
              </div>
            </>
          )}

          {tipoCusto === 'arrendamento' && (
            <>
              <div className="form-row">
                <label>
                  Tipo
                  <select value={formState.tipo || ''} onChange={handleChange('tipo')} required>
                    {TIPOS_ARRENDAMENTO.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {formState.tipo === 'Arrendamento' && (
                <div className="form-row">
                  <label>
                    Valor por Hectare
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={formState.valorPorHaArr || ''}
                      onChange={handleChange('valorPorHaArr')}
                      placeholder="500.00"
                      required
                    />
                  </label>
                </div>
              )}
              {formState.tipo === 'Parceria' && (
                <div className="form-row">
                  <label>
                    Percentual da Produção (%)
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={formState.percentual || ''}
                      onChange={handleChange('percentual')}
                      placeholder="30"
                      required
                    />
                  </label>
                </div>
              )}
            </>
          )}

          {tipoCusto === 'logistica' && (
            <>
              <div className="form-row">
                <label className="full-width">
                  Descrição
                  <input
                    type="text"
                    value={formState.descricao || ''}
                    onChange={handleChange('descricao')}
                    placeholder="Ex: Transporte até armazém"
                    required
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Custo por {safra.receitas.producao.unidade === 'sc/ha' ? 'Saca' : 'Tonelada'}
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formState.custoPorUnidade || ''}
                    onChange={handleChange('custoPorUnidade')}
                    placeholder="5.00"
                    required
                  />
                </label>
                <label>
                  Quantidade
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formState.quantidadeLog || ''}
                    onChange={handleChange('quantidadeLog')}
                    placeholder="30000"
                    required
                  />
                </label>
              </div>
            </>
          )}

          <footer className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              {custoEditando ? 'Atualizar' : 'Adicionar'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

