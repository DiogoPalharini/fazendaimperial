import { useState, type ChangeEvent, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { Safra, Cultura, UnidadeProducao } from '../types'
import { CULTURAS, UNIDADES_PRODUCAO } from '../constants'
import '../SafraControl.css'

type AddSafraModalProps = {
  onClose: () => void
  onSave: (safra: Omit<Safra, 'id' | 'createdAt' | 'updatedAt' | 'indicadores'>) => void
  safraEditando?: Safra
}

export default function AddSafraModal({ onClose, onSave, safraEditando }: AddSafraModalProps) {
  const [formState, setFormState] = useState({
    nome: safraEditando?.nome || '',
    cultura: (safraEditando?.cultura || 'Soja') as Cultura,
    areaTotal: safraEditando?.areaTotal.toString() || '',
    dataPlantio: safraEditando?.dataPlantio || '',
    dataColheita: safraEditando?.dataColheita || '',
    areaPlantada: safraEditando?.receitas.producao.areaPlantada.toString() || '',
    produtividadeEsperada: safraEditando?.receitas.producao.produtividadeEsperada.toString() || '',
    unidade: (safraEditando?.receitas.producao.unidade || 'sc/ha') as UnidadeProducao,
    precoPorUnidade: safraEditando?.receitas.precoVenda.precoPorUnidade.toString() || '',
    observacoes: safraEditando?.observacoes || '',
  })
  const [erro, setErro] = useState<string | null>(null)

  const handleChange = (field: keyof typeof formState) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }))
    setErro(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErro(null)

    if (!formState.nome || !formState.areaTotal || !formState.dataPlantio || !formState.dataColheita) {
      setErro('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    const areaTotal = Number(formState.areaTotal)
    const areaPlantada = Number(formState.areaPlantada) || areaTotal
    const produtividadeEsperada = Number(formState.produtividadeEsperada)
    const precoPorUnidade = Number(formState.precoPorUnidade)

    if (Number.isNaN(areaTotal) || areaTotal <= 0) {
      setErro('Área total deve ser um número válido maior que zero.')
      return
    }

    if (Number.isNaN(areaPlantada) || areaPlantada <= 0) {
      setErro('Área plantada deve ser um número válido maior que zero.')
      return
    }

    if (Number.isNaN(produtividadeEsperada) || produtividadeEsperada <= 0) {
      setErro('Produtividade esperada deve ser um número válido maior que zero.')
      return
    }

    if (Number.isNaN(precoPorUnidade) || precoPorUnidade <= 0) {
      setErro('Preço por unidade deve ser um número válido maior que zero.')
      return
    }

    const producaoTotal = areaPlantada * produtividadeEsperada
    const receitaBrutaPrevista = producaoTotal * precoPorUnidade

    onSave({
      nome: formState.nome,
      cultura: formState.cultura,
      areaTotal,
      dataPlantio: formState.dataPlantio,
      dataColheita: formState.dataColheita,
      receitas: {
        producao: {
          areaPlantada,
          produtividadeEsperada,
          unidade: formState.unidade,
          producaoTotal,
        },
        precoVenda: {
          precoPorUnidade,
          receitaBrutaPrevista,
        },
        outrasReceitas: safraEditando?.receitas.outrasReceitas || [],
      },
      custos: safraEditando?.custos || {
        insumos: [],
        operacoesMecanicas: [],
        maoDeObra: [],
        custosIndiretos: [],
        depreciacoes: [],
        arrendamentos: [],
        logisticas: [],
      },
      observacoes: formState.observacoes.trim() || undefined,
    })
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
            <h3 className="modal-title">{safraEditando ? 'Editar Safra' : 'Nova Safra'}</h3>
            <p className="modal-subtitle">
              {safraEditando ? 'Atualize as informações da safra' : 'Cadastre uma nova safra'}
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        {erro && <div className="modal-error">{erro}</div>}

        <form className="safra-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h4 className="form-section-title">Informações Básicas</h4>
            <div className="form-row">
              <label className="full-width">
                Nome da Safra
                <input
                  type="text"
                  value={formState.nome}
                  onChange={handleChange('nome')}
                  placeholder="Ex: Soja 2025/2026"
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Cultura
                <select value={formState.cultura} onChange={handleChange('cultura')} required>
                  {CULTURAS.map((cultura) => (
                    <option key={cultura} value={cultura}>
                      {cultura}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Área Total (ha)
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formState.areaTotal}
                  onChange={handleChange('areaTotal')}
                  placeholder="0.00"
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Data de Plantio
                <input
                  type="date"
                  value={formState.dataPlantio}
                  onChange={handleChange('dataPlantio')}
                  required
                />
              </label>
              <label>
                Data de Colheita
                <input
                  type="date"
                  value={formState.dataColheita}
                  onChange={handleChange('dataColheita')}
                  required
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h4 className="form-section-title">Produção e Preço</h4>
            <div className="form-row">
              <label>
                Área Plantada (ha)
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formState.areaPlantada}
                  onChange={handleChange('areaPlantada')}
                  placeholder="Igual à área total"
                />
              </label>
              <label>
                Produtividade Esperada
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formState.produtividadeEsperada}
                  onChange={handleChange('produtividadeEsperada')}
                  placeholder="60"
                  required
                />
              </label>
              <label>
                Unidade
                <select value={formState.unidade} onChange={handleChange('unidade')} required>
                  {UNIDADES_PRODUCAO.map((unidade) => (
                    <option key={unidade} value={unidade}>
                      {unidade}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                Preço por {formState.unidade === 'sc/ha' ? 'Saca' : 'Tonelada'}
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formState.precoPorUnidade}
                  onChange={handleChange('precoPorUnidade')}
                  placeholder="150.00"
                  required
                />
              </label>
            </div>
          </div>

          <div className="form-row">
            <label className="full-width">
              Observações (opcional)
              <textarea
                value={formState.observacoes}
                onChange={handleChange('observacoes')}
                placeholder="Adicione observações sobre esta safra..."
                rows={3}
              />
            </label>
          </div>

          <footer className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              {safraEditando ? 'Atualizar Safra' : 'Criar Safra'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

