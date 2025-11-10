import { useState } from 'react'
import { X, Edit, Trash2, Plus, TrendingUp, TrendingDown, DollarSign, Calculator } from 'lucide-react'
import type { Safra } from '../types'
import { formatCurrency, formatNumber, formatDate } from '../utils'
import AddCustoModal from './AddCustoModal'
import '../SafraControl.css'

type SafraDetailsModalProps = {
  safra: Safra
  onClose: () => void
  onEdit: (safra: Safra) => void
  onDelete: (id: string) => void
  onAddCusto: (safraId: string, tipoCusto: string, data: any) => void
  onEditCusto: (safraId: string, tipoCusto: string, custoId: string, data: any) => void
  onDeleteCusto: (safraId: string, tipoCusto: string, custoId: string) => void
}

export default function SafraDetailsModal({
  safra,
  onClose,
  onEdit,
  onDelete,
  onAddCusto,
  onEditCusto,
  onDeleteCusto,
}: SafraDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'receitas' | 'custos' | 'indicadores'>('receitas')
  const [showAddCustoModal, setShowAddCustoModal] = useState(false)
  const [tipoCustoSelecionado, setTipoCustoSelecionado] = useState<string | null>(null)
  const [custoEditando, setCustoEditando] = useState<{ tipo: string; data: any } | null>(null)

  const handleAddCusto = (tipo: string) => {
    setTipoCustoSelecionado(tipo)
    setShowAddCustoModal(true)
  }

  const handleEditCusto = (tipo: string, custo: any) => {
    setCustoEditando({ tipo, data: custo })
    setShowAddCustoModal(true)
  }

  const handleSaveCusto = (tipo: string, data: any) => {
    if (custoEditando) {
      onEditCusto(safra.id, tipo, data.id, data)
    } else {
      onAddCusto(safra.id, tipo, data)
    }
    setShowAddCustoModal(false)
    setCustoEditando(null)
    setTipoCustoSelecionado(null)
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div
          className="modal safra-details-modal"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="modal-header">
            <div>
              <h3 className="modal-title">{safra.nome}</h3>
              <p className="modal-subtitle">
                {safra.cultura} • {formatNumber(safra.areaTotal)} ha
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => onEdit(safra)}
                aria-label="Editar"
              >
                <Edit size={18} />
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir esta safra?')) {
                    onDelete(safra.id)
                  }
                }}
                aria-label="Excluir"
              >
                <Trash2 size={18} />
              </button>
              <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
          </header>

          <div className="safra-details-tabs">
            <button
              type="button"
              className={activeTab === 'receitas' ? 'active' : ''}
              onClick={() => setActiveTab('receitas')}
            >
              <TrendingUp size={18} />
              Receitas
            </button>
            <button
              type="button"
              className={activeTab === 'custos' ? 'active' : ''}
              onClick={() => setActiveTab('custos')}
            >
              <TrendingDown size={18} />
              Custos
            </button>
            <button
              type="button"
              className={activeTab === 'indicadores' ? 'active' : ''}
              onClick={() => setActiveTab('indicadores')}
            >
              <Calculator size={18} />
              Indicadores
            </button>
          </div>

          <div className="safra-details-content">
            {activeTab === 'receitas' && (
              <div className="safra-section">
                <div className="section-header">
                  <h4>Produção</h4>
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Área Plantada</span>
                    <strong className="detail-value">{formatNumber(safra.receitas.producao.areaPlantada)} ha</strong>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Produtividade Esperada</span>
                    <strong className="detail-value">
                      {formatNumber(safra.receitas.producao.produtividadeEsperada)} {safra.receitas.producao.unidade}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Produção Total Prevista</span>
                    <strong className="detail-value">
                      {formatNumber(safra.receitas.producao.producaoTotal)} {safra.receitas.producao.unidade === 'sc/ha' ? 'sc' : 't'}
                    </strong>
                  </div>
                </div>

                <div className="section-header">
                  <h4>Preço de Venda</h4>
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Preço por {safra.receitas.producao.unidade === 'sc/ha' ? 'Saca' : 'Tonelada'}</span>
                    <strong className="detail-value">{formatCurrency(safra.receitas.precoVenda.precoPorUnidade)}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Receita Bruta Prevista</span>
                    <strong className="detail-value positive">
                      {formatCurrency(safra.receitas.precoVenda.receitaBrutaPrevista)}
                    </strong>
                  </div>
                </div>

                {safra.receitas.outrasReceitas.length > 0 && (
                  <>
                    <div className="section-header">
                      <h4>Outras Receitas</h4>
                    </div>
                    <div className="items-list">
                      {safra.receitas.outrasReceitas.map((receita) => (
                        <div key={receita.id} className="item-row">
                          <div>
                            <strong>{receita.descricao}</strong>
                            <span className="positive-value">{formatCurrency(receita.valor)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'custos' && (
              <div className="safra-section">
                <div className="costs-sections">
                  <div className="cost-section">
                    <div className="section-header">
                      <h4>Insumos</h4>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleAddCusto('insumo')}
                        title="Adicionar Insumo"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {safra.custos.insumos.length === 0 ? (
                      <p className="empty-message">Nenhum insumo cadastrado.</p>
                    ) : (
                      <div className="items-list">
                        {safra.custos.insumos.map((insumo) => (
                          <div key={insumo.id} className="item-row">
                            <div>
                              <strong>{insumo.nome}</strong>
                              <span>{formatCurrency(insumo.total)}</span>
                            </div>
                            <div className="item-actions">
                              <button
                                type="button"
                                className="icon-button small"
                                onClick={() => handleEditCusto('insumo', insumo)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                className="icon-button small danger"
                                onClick={() => onDeleteCusto(safra.id, 'insumo', insumo.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="cost-section">
                    <div className="section-header">
                      <h4>Operações Mecânicas</h4>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleAddCusto('operacao')}
                        title="Adicionar Operação"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {safra.custos.operacoesMecanicas.length === 0 ? (
                      <p className="empty-message">Nenhuma operação cadastrada.</p>
                    ) : (
                      <div className="items-list">
                        {safra.custos.operacoesMecanicas.map((op) => (
                          <div key={op.id} className="item-row">
                            <div>
                              <strong>{op.descricao}</strong>
                              <span>{formatCurrency(op.total)}</span>
                            </div>
                            <div className="item-actions">
                              <button
                                type="button"
                                className="icon-button small"
                                onClick={() => handleEditCusto('operacao', op)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                className="icon-button small danger"
                                onClick={() => onDeleteCusto(safra.id, 'operacao', op.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="cost-section">
                    <div className="section-header">
                      <h4>Mão de Obra</h4>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleAddCusto('maoDeObra')}
                        title="Adicionar Mão de Obra"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {safra.custos.maoDeObra.length === 0 ? (
                      <p className="empty-message">Nenhuma mão de obra cadastrada.</p>
                    ) : (
                      <div className="items-list">
                        {safra.custos.maoDeObra.map((mdo) => (
                          <div key={mdo.id} className="item-row">
                            <div>
                              <strong>{mdo.descricao}</strong>
                              <span>{formatCurrency(mdo.total)}</span>
                            </div>
                            <div className="item-actions">
                              <button
                                type="button"
                                className="icon-button small"
                                onClick={() => handleEditCusto('maoDeObra', mdo)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                className="icon-button small danger"
                                onClick={() => onDeleteCusto(safra.id, 'maoDeObra', mdo.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="cost-section">
                    <div className="section-header">
                      <h4>Custos Indiretos</h4>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleAddCusto('custoIndireto')}
                        title="Adicionar Custo Indireto"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {safra.custos.custosIndiretos.length === 0 ? (
                      <p className="empty-message">Nenhum custo indireto cadastrado.</p>
                    ) : (
                      <div className="items-list">
                        {safra.custos.custosIndiretos.map((ci) => (
                          <div key={ci.id} className="item-row">
                            <div>
                              <strong>{ci.descricao}</strong>
                              <span>{formatCurrency(ci.total)}</span>
                            </div>
                            <div className="item-actions">
                              <button
                                type="button"
                                className="icon-button small"
                                onClick={() => handleEditCusto('custoIndireto', ci)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                className="icon-button small danger"
                                onClick={() => onDeleteCusto(safra.id, 'custoIndireto', ci.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="cost-section">
                    <div className="section-header">
                      <h4>Depreciação</h4>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleAddCusto('depreciacao')}
                        title="Adicionar Depreciação"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {safra.custos.depreciacoes.length === 0 ? (
                      <p className="empty-message">Nenhuma depreciação cadastrada.</p>
                    ) : (
                      <div className="items-list">
                        {safra.custos.depreciacoes.map((dep) => (
                          <div key={dep.id} className="item-row">
                            <div>
                              <strong>{dep.descricao}</strong>
                              <span>{formatCurrency(dep.depreciacaoPorSafra)}</span>
                            </div>
                            <div className="item-actions">
                              <button
                                type="button"
                                className="icon-button small"
                                onClick={() => handleEditCusto('depreciacao', dep)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                className="icon-button small danger"
                                onClick={() => onDeleteCusto(safra.id, 'depreciacao', dep.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="cost-section">
                    <div className="section-header">
                      <h4>Arrendamento/Parcerias</h4>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleAddCusto('arrendamento')}
                        title="Adicionar Arrendamento"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {safra.custos.arrendamentos.length === 0 ? (
                      <p className="empty-message">Nenhum arrendamento cadastrado.</p>
                    ) : (
                      <div className="items-list">
                        {safra.custos.arrendamentos.map((arr) => (
                          <div key={arr.id} className="item-row">
                            <div>
                              <strong>{arr.tipo === 'Arrendamento' ? 'Arrendamento' : 'Parceria'}</strong>
                              <span>{formatCurrency(arr.total)}</span>
                            </div>
                            <div className="item-actions">
                              <button
                                type="button"
                                className="icon-button small"
                                onClick={() => handleEditCusto('arrendamento', arr)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                className="icon-button small danger"
                                onClick={() => onDeleteCusto(safra.id, 'arrendamento', arr.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="cost-section">
                    <div className="section-header">
                      <h4>Logística e Pós-colheita</h4>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => handleAddCusto('logistica')}
                        title="Adicionar Logística"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {safra.custos.logisticas.length === 0 ? (
                      <p className="empty-message">Nenhuma logística cadastrada.</p>
                    ) : (
                      <div className="items-list">
                        {safra.custos.logisticas.map((log) => (
                          <div key={log.id} className="item-row">
                            <div>
                              <strong>{log.descricao}</strong>
                              <span>{formatCurrency(log.total)}</span>
                            </div>
                            <div className="item-actions">
                              <button
                                type="button"
                                className="icon-button small"
                                onClick={() => handleEditCusto('logistica', log)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                className="icon-button small danger"
                                onClick={() => onDeleteCusto(safra.id, 'logistica', log.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'indicadores' && (
              <div className="safra-section">
                <div className="indicators-grid">
                  <div className="indicator-card">
                    <span className="indicator-label">Custo Total da Safra</span>
                    <strong className="indicator-value negative">
                      {formatCurrency(safra.indicadores.custoTotal)}
                    </strong>
                  </div>
                  <div className="indicator-card">
                    <span className="indicator-label">Custo por Hectare</span>
                    <strong className="indicator-value">
                      {formatCurrency(safra.indicadores.custoPorHectare)}
                    </strong>
                  </div>
                  <div className="indicator-card">
                    <span className="indicator-label">
                      Custo por {safra.receitas.producao.unidade === 'sc/ha' ? 'Saca' : 'Tonelada'}
                    </span>
                    <strong className="indicator-value">
                      {formatCurrency(safra.indicadores.custoPorUnidade)}
                    </strong>
                  </div>
                  <div className="indicator-card">
                    <span className="indicator-label">Lucro Bruto</span>
                    <strong className="indicator-value positive">
                      {formatCurrency(safra.indicadores.lucroBruto)}
                    </strong>
                  </div>
                  <div className="indicator-card">
                    <span className="indicator-label">Lucro Líquido</span>
                    <strong className={`indicator-value ${safra.indicadores.lucroLiquido >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(safra.indicadores.lucroLiquido)}
                    </strong>
                  </div>
                  <div className="indicator-card">
                    <span className="indicator-label">Margem de Lucro</span>
                    <strong className={`indicator-value ${safra.indicadores.margemLucro >= 0 ? 'positive' : 'negative'}`}>
                      {formatNumber(safra.indicadores.margemLucro)}%
                    </strong>
                  </div>
                  <div className="indicator-card full-width">
                    <span className="indicator-label">Ponto de Equilíbrio</span>
                    <strong className="indicator-value">
                      {formatNumber(safra.indicadores.pontoEquilibrio)} {safra.receitas.producao.unidade === 'sc/ha' ? 'sc' : 't'}
                    </strong>
                    <p className="indicator-hint">
                      Quantidade mínima necessária para cobrir todos os custos
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddCustoModal && (
        <AddCustoModal
          safra={safra}
          tipoCusto={tipoCustoSelecionado || custoEditando?.tipo || ''}
          custoEditando={custoEditando?.data}
          onClose={() => {
            setShowAddCustoModal(false)
            setCustoEditando(null)
            setTipoCustoSelecionado(null)
          }}
          onSave={handleSaveCusto}
        />
      )}
    </>
  )
}

