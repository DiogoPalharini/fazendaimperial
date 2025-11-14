import { useMemo, useState } from 'react'
import { Plus, Search, Filter, TrendingUp, TrendingDown, Calculator, DollarSign, Sprout } from 'lucide-react'
import AddSafraModal from './components/AddSafraModal'
import SafraDetailsModal from './components/SafraDetailsModal'
import type { Safra } from './types'
import { INITIAL_SAFRAS } from './constants'
import { formatCurrency, formatNumber, formatDate, atualizarIndicadoresSafra } from './utils'
import '../FeaturePage.css'
import './SafraControl.css'

export default function SafraControl() {
  const [search, setSearch] = useState('')
  const [culturaFilter, setCulturaFilter] = useState<string>('Todas')
  const [safras, setSafras] = useState<Safra[]>(INITIAL_SAFRAS)
  const [selectedSafra, setSelectedSafra] = useState<Safra | null>(null)
  const [addSafraModalOpen, setAddSafraModalOpen] = useState(false)
  const [safraEditando, setSafraEditando] = useState<Safra | null>(null)

  const filteredSafras = useMemo(() => {
    return safras.filter((safra) => {
      const searchTerm = search.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        safra.nome.toLowerCase().includes(searchTerm) ||
        safra.cultura.toLowerCase().includes(searchTerm)

      const matchesCultura = culturaFilter === 'Todas' || safra.cultura === culturaFilter

      return matchesSearch && matchesCultura
    })
  }, [safras, search, culturaFilter])

  const summary = useMemo(() => {
    const totalSafras = safras.length
    const receitaTotal = safras.reduce((acc, safra) => {
      const outrasReceitas = safra.receitas.outrasReceitas.reduce((sum, r) => sum + r.valor, 0)
      return acc + safra.receitas.precoVenda.receitaBrutaPrevista + outrasReceitas
    }, 0)
    const custoTotal = safras.reduce((acc, safra) => acc + safra.indicadores.custoTotal, 0)
    const lucroTotal = safras.reduce((acc, safra) => acc + safra.indicadores.lucroLiquido, 0)

    return {
      totalSafras,
      receitaTotal,
      custoTotal,
      lucroTotal,
    }
  }, [safras])

  const handleSaveSafra = (safraData: Omit<Safra, 'id' | 'createdAt' | 'updatedAt' | 'indicadores'>) => {
    if (safraEditando) {
      const safraAtualizada: Safra = {
        ...safraEditando,
        ...safraData,
        updatedAt: new Date().toISOString(),
      }
      const safraComIndicadores = atualizarIndicadoresSafra(safraAtualizada)
      setSafras((prev) => prev.map((s) => (s.id === safraEditando.id ? safraComIndicadores : s)))
      setSafraEditando(null)
    } else {
      const newSafra: Safra = {
        id: `safra-${Date.now()}`,
        ...safraData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        indicadores: {
          custoTotal: 0,
          custoPorHectare: 0,
          custoPorUnidade: 0,
          lucroBruto: 0,
          lucroLiquido: 0,
          margemLucro: 0,
          pontoEquilibrio: 0,
        },
      }
      const safraComIndicadores = atualizarIndicadoresSafra(newSafra)
      setSafras((prev) => [safraComIndicadores, ...prev])
    }
    setAddSafraModalOpen(false)
  }

  const handleEditSafra = (safra: Safra) => {
    setSafraEditando(safra)
    setAddSafraModalOpen(true)
    setSelectedSafra(null)
  }

  const handleDeleteSafra = (id: string) => {
    setSafras((prev) => prev.filter((s) => s.id !== id))
    setSelectedSafra(null)
  }

  const handleAddCusto = (safraId: string, tipoCusto: string, data: any) => {
    setSafras((prev) => {
      return prev.map((safra) => {
        if (safra.id !== safraId) return safra

        const custosAtualizados = { ...safra.custos }
        const tipoMap: Record<string, keyof typeof custosAtualizados> = {
          insumo: 'insumos',
          operacao: 'operacoesMecanicas',
          maoDeObra: 'maoDeObra',
          custoIndireto: 'custosIndiretos',
          depreciacao: 'depreciacoes',
          arrendamento: 'arrendamentos',
          logistica: 'logisticas',
        }

        const chave = tipoMap[tipoCusto]
        if (chave) {
          ;(custosAtualizados[chave] as any[]) = [...(custosAtualizados[chave] as any[]), data]
        }

        const safraAtualizada = { ...safra, custos: custosAtualizados }
        return atualizarIndicadoresSafra(safraAtualizada)
      })
    })
  }

  const handleEditCusto = (safraId: string, tipoCusto: string, custoId: string, data: any) => {
    setSafras((prev) => {
      return prev.map((safra) => {
        if (safra.id !== safraId) return safra

        const custosAtualizados = { ...safra.custos }
        const tipoMap: Record<string, keyof typeof custosAtualizados> = {
          insumo: 'insumos',
          operacao: 'operacoesMecanicas',
          maoDeObra: 'maoDeObra',
          custoIndireto: 'custosIndiretos',
          depreciacao: 'depreciacoes',
          arrendamento: 'arrendamentos',
          logistica: 'logisticas',
        }

        const chave = tipoMap[tipoCusto]
        if (chave) {
          ;(custosAtualizados[chave] as any[]) = (custosAtualizados[chave] as any[]).map((item: any) =>
            item.id === custoId ? data : item
          )
        }

        const safraAtualizada = { ...safra, custos: custosAtualizados }
        return atualizarIndicadoresSafra(safraAtualizada)
      })
    })
  }

  const handleDeleteCusto = (safraId: string, tipoCusto: string, custoId: string) => {
    setSafras((prev) => {
      return prev.map((safra) => {
        if (safra.id !== safraId) return safra

        const custosAtualizados = { ...safra.custos }
        const tipoMap: Record<string, keyof typeof custosAtualizados> = {
          insumo: 'insumos',
          operacao: 'operacoesMecanicas',
          maoDeObra: 'maoDeObra',
          custoIndireto: 'custosIndiretos',
          depreciacao: 'depreciacoes',
          arrendamento: 'arrendamentos',
          logistica: 'logisticas',
        }

        const chave = tipoMap[tipoCusto]
        if (chave) {
          ;(custosAtualizados[chave] as any[]) = (custosAtualizados[chave] as any[]).filter(
            (item: any) => item.id !== custoId
          )
        }

        const safraAtualizada = { ...safra, custos: custosAtualizados }
        return atualizarIndicadoresSafra(safraAtualizada)
      })
    })
  }

  return (
    <div className="inputs-page safra-page">
      <header className="inputs-header">
        <div>
          <h2>Gestão de Safras</h2>
          <p>
            Planeje e gerencie suas safras, acompanhe receitas, custos e indicadores financeiros para tomar
            decisões estratégicas.
          </p>
        </div>
      </header>

      <section className="inputs-summary">
        <article className="summary-card">
          <Sprout size={24} />
          <div>
            <span>Total de Safras</span>
            <strong>{summary.totalSafras}</strong>
          </div>
        </article>
        <article className="summary-card">
          <TrendingUp size={24} />
          <div>
            <span>Receita Total Prevista</span>
            <strong className="positive">{formatCurrency(summary.receitaTotal)}</strong>
          </div>
        </article>
        <article className="summary-card warning">
          <TrendingDown size={24} />
          <div>
            <span>Custo Total</span>
            <strong className="negative">{formatCurrency(summary.custoTotal)}</strong>
          </div>
        </article>
        <article className="summary-card">
          <Calculator size={24} />
          <div>
            <span>Lucro Total Previsto</span>
            <strong className={summary.lucroTotal >= 0 ? 'positive' : 'negative'}>
              {formatCurrency(summary.lucroTotal)}
            </strong>
          </div>
        </article>
      </section>

      <section className="inputs-toolbar">
        <div className="search-group">
          <Search size={18} />
          <input
            type="search"
            placeholder="Buscar por nome ou cultura"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="select-group">
            <Filter size={16} />
            <select
              value={culturaFilter}
              onChange={(event) => setCulturaFilter(event.target.value)}
            >
              <option value="Todas">Todas as culturas</option>
              {['Soja', 'Milho', 'Algodão', 'Café', 'Cana-de-açúcar', 'Trigo', 'Outros'].map((cultura) => (
                <option key={cultura} value={cultura}>
                  {cultura}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="inputs-table-header">
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setSafraEditando(null)
            setAddSafraModalOpen(true)
          }}
        >
          <Plus size={18} /> Nova Safra
        </button>
      </div>

      <section className="inputs-table-wrapper">
        <table className="inputs-table">
          <thead>
            <tr>
              <th>Nome da Safra</th>
              <th>Cultura</th>
              <th>Área (ha)</th>
              <th>Produção Prevista</th>
              <th>Receita Prevista</th>
              <th>Custo Total</th>
              <th>Lucro Líquido</th>
              <th>Margem (%)</th>
            </tr>
          </thead>
          <tbody>
            {filteredSafras.map((safra) => {
              const producaoTotal = safra.receitas.producao.producaoTotal
              const unidade = safra.receitas.producao.unidade === 'sc/ha' ? 'sc' : 't'
              return (
                <tr
                  key={safra.id}
                  className="input-row"
                  onClick={() => setSelectedSafra(safra)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedSafra(safra)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <td>
                    <div className="item-name">
                      <strong>{safra.nome}</strong>
                      <span className="item-meta">
                        {formatDate(safra.dataPlantio)} - {formatDate(safra.dataColheita)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="stock-chip">{safra.cultura}</span>
                  </td>
                  <td>{formatNumber(safra.areaTotal)}</td>
                  <td>
                    {formatNumber(producaoTotal)} {unidade}
                  </td>
                  <td>
                    <strong className="positive-value">
                      {formatCurrency(safra.receitas.precoVenda.receitaBrutaPrevista)}
                    </strong>
                  </td>
                  <td>
                    <strong className="negative-value">
                      {formatCurrency(safra.indicadores.custoTotal)}
                    </strong>
                  </td>
                  <td>
                    <strong
                      className={safra.indicadores.lucroLiquido >= 0 ? 'positive-value' : 'negative-value'}
                    >
                      {formatCurrency(safra.indicadores.lucroLiquido)}
                    </strong>
                  </td>
                  <td>
                    <span
                      className={`stock-chip ${
                        safra.indicadores.margemLucro >= 0 ? 'status-pago' : 'status-pendente'
                      }`}
                    >
                      {formatNumber(safra.indicadores.margemLucro)}%
                    </span>
                  </td>
                </tr>
              )
            })}
            {filteredSafras.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">
                  Nenhuma safra corresponde aos filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {addSafraModalOpen && (
        <AddSafraModal
          onClose={() => {
            setAddSafraModalOpen(false)
            setSafraEditando(null)
          }}
          onSave={handleSaveSafra}
          safraEditando={safraEditando || undefined}
        />
      )}

      {selectedSafra && (
        <SafraDetailsModal
          safra={selectedSafra}
          onClose={() => setSelectedSafra(null)}
          onEdit={handleEditSafra}
          onDelete={handleDeleteSafra}
          onAddCusto={handleAddCusto}
          onEditCusto={handleEditCusto}
          onDeleteCusto={handleDeleteCusto}
        />
      )}
    </div>
  )
}

