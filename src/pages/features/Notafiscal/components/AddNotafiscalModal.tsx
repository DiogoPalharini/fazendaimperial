import { useState, type ChangeEvent, type FormEvent } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Invoice, InvoiceType, InvoiceProduct } from '../types'
import { INVOICE_TYPES, CLIENTES, FORNECEDORES } from '../constants'
import '../Notafiscal.css'

type AddNotafiscalModalProps = {
  onClose: () => void
  onSave: (invoice: Omit<Invoice, 'id' | 'numero' | 'status'>) => void
}

const UNIDADES = ['kg', 'L', 'sc', 'un', 'm³', 'm²', 'ton', 'sacas']

export default function AddNotafiscalModal({ onClose, onSave }: AddNotafiscalModalProps) {
  const [formState, setFormState] = useState({
    tipo: '' as InvoiceType | '',
    dataEmissao: new Date().toISOString().slice(0, 16),
    cliente: '',
    fornecedor: '',
    carregamentoId: '',
    servico: '',
    observacoes: '',
    produtos: [] as InvoiceProduct[],
  })
  const [erro, setErro] = useState<string | null>(null)
  const [produtoAtual, setProdutoAtual] = useState({
    descricao: '',
    quantidade: '',
    unidade: '',
    valorUnitario: '',
  })

  const handleChange = (field: keyof typeof formState) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value
    setFormState((prev) => {
      const updated = { ...prev, [field]: newValue }
      // Se o serviço mudou e já existe um produto de serviço, atualiza a descrição
      if (field === 'servico' && prev.produtos.length === 1 && prev.produtos[0].id === 'serv-1') {
        updated.produtos = [
          {
            ...prev.produtos[0],
            descricao: newValue || 'Serviço',
          },
        ]
      }
      return updated
    })
    setErro(null)
  }

  const handleProdutoChange = (field: keyof typeof produtoAtual) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setProdutoAtual((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const adicionarProduto = () => {
    if (!produtoAtual.descricao || !produtoAtual.quantidade || !produtoAtual.unidade || !produtoAtual.valorUnitario) {
      setErro('Preencha todos os campos do produto.')
      return
    }

    const quantidade = Number(produtoAtual.quantidade)
    const valorUnitario = Number(produtoAtual.valorUnitario)

    if (Number.isNaN(quantidade) || quantidade <= 0) {
      setErro('Quantidade deve ser um número válido maior que zero.')
      return
    }

    if (Number.isNaN(valorUnitario) || valorUnitario <= 0) {
      setErro('Valor unitário deve ser um número válido maior que zero.')
      return
    }

    const novoProduto: InvoiceProduct = {
      id: `prod-${Date.now()}`,
      descricao: produtoAtual.descricao,
      quantidade,
      unidade: produtoAtual.unidade,
      valorUnitario,
      valorTotal: quantidade * valorUnitario,
    }

    setFormState((prev) => ({
      ...prev,
      produtos: [...prev.produtos, novoProduto],
    }))

    setProdutoAtual({
      descricao: '',
      quantidade: '',
      unidade: '',
      valorUnitario: '',
    })
    setErro(null)
  }

  const removerProduto = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      produtos: prev.produtos.filter((p) => p.id !== id),
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErro(null)

    if (!formState.tipo) {
      setErro('Selecione o tipo de notafiscal.')
      return
    }

    // Validações específicas por tipo
    if (formState.tipo === 'Carregamento' || formState.tipo === 'Venda de Grãos' || formState.tipo === 'Venda de Gado' || formState.tipo === 'Venda de Sementes') {
      if (!formState.cliente) {
        setErro('Cliente é obrigatório para este tipo de notafiscal.')
        return
      }
      if (formState.produtos.length === 0) {
        setErro('Adicione pelo menos um produto.')
        return
      }
    }

    if (formState.tipo === 'Compra de Insumos' || formState.tipo === 'Compra de Sementes' || formState.tipo === 'Compra de Máquinas') {
      if (!formState.fornecedor) {
        setErro('Fornecedor é obrigatório para este tipo de notafiscal.')
        return
      }
      if (formState.produtos.length === 0) {
        setErro('Adicione pelo menos um produto.')
        return
      }
    }

    if (formState.tipo === 'Serviços Agrícolas' || formState.tipo === 'Prestação de Serviços') {
      if (!formState.cliente) {
        setErro('Cliente é obrigatório para este tipo de notafiscal.')
        return
      }
      if (!formState.servico) {
        setErro('Descrição do serviço é obrigatória.')
        return
      }
    }

    const valorTotalProdutos = formState.produtos.reduce((acc, p) => acc + p.valorTotal, 0)
    const valorTotal = valorTotalProdutos || 0

    onSave({
      tipo: formState.tipo,
      dataEmissao: formState.dataEmissao,
      cliente: formState.cliente || undefined,
      fornecedor: formState.fornecedor || undefined,
      carregamentoId: formState.carregamentoId || undefined,
      servico: formState.servico || undefined,
      observacoes: formState.observacoes || undefined,
      produtos: formState.produtos.length > 0 ? formState.produtos : undefined,
      valorTotal,
    })
  }

  const isVenda = formState.tipo === 'Carregamento' || formState.tipo === 'Venda de Grãos' || formState.tipo === 'Venda de Gado' || formState.tipo === 'Venda de Sementes'
  const isCompra = formState.tipo === 'Compra de Insumos' || formState.tipo === 'Compra de Sementes' || formState.tipo === 'Compra de Máquinas'
  const isServico = formState.tipo === 'Serviços Agrícolas' || formState.tipo === 'Prestação de Serviços'
  const precisaProdutos = isVenda || isCompra
  const precisaServico = isServico

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal inputs-modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h3 className="modal-title">Nova Notafiscal</h3>
            <p className="modal-subtitle">Cadastre uma nova notafiscal no sistema</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        {erro && <div className="modal-error">{erro}</div>}

        <form className="inputs-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Tipo de Notafiscal
              <select value={formState.tipo} onChange={handleChange('tipo')} required>
                <option value="" disabled>
                  Selecione o tipo
                </option>
                {INVOICE_TYPES.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Data de Emissão
              <input
                type="datetime-local"
                value={formState.dataEmissao}
                onChange={handleChange('dataEmissao')}
                required
              />
            </label>
          </div>

          {isVenda && (
            <div className="form-row">
              <label>
                Cliente
                <select value={formState.cliente} onChange={handleChange('cliente')} required>
                  <option value="">Selecione o cliente</option>
                  {CLIENTES.map((cliente) => (
                    <option key={cliente} value={cliente}>
                      {cliente}
                    </option>
                  ))}
                </select>
              </label>
              {formState.tipo === 'Carregamento' && (
                <label>
                  ID do Carregamento (opcional)
                  <input
                    type="text"
                    value={formState.carregamentoId}
                    onChange={handleChange('carregamentoId')}
                    placeholder="Ex: car-001"
                  />
                </label>
              )}
            </div>
          )}

          {isCompra && (
            <div className="form-row">
              <label>
                Fornecedor
                <select value={formState.fornecedor} onChange={handleChange('fornecedor')} required>
                  <option value="">Selecione o fornecedor</option>
                  {FORNECEDORES.map((fornecedor) => (
                    <option key={fornecedor} value={fornecedor}>
                      {fornecedor}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {isServico && (
            <div className="form-row">
              <label>
                Cliente
                <select value={formState.cliente} onChange={handleChange('cliente')} required>
                  <option value="">Selecione o cliente</option>
                  {CLIENTES.map((cliente) => (
                    <option key={cliente} value={cliente}>
                      {cliente}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Descrição do Serviço
                <input
                  type="text"
                  value={formState.servico}
                  onChange={handleChange('servico')}
                  placeholder="Ex: Aplicação de Defensivos"
                  required
                />
              </label>
            </div>
          )}

          {precisaProdutos && (
            <div className="products-section">
              <h4>Produtos</h4>
              <div className="add-product-form">
                <div className="form-row">
                  <label>
                    Descrição
                    <input
                      type="text"
                      value={produtoAtual.descricao}
                      onChange={handleProdutoChange('descricao')}
                      placeholder="Ex: Soja em Grãos"
                    />
                  </label>
                  <label>
                    Quantidade
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={produtoAtual.quantidade}
                      onChange={handleProdutoChange('quantidade')}
                      placeholder="0"
                    />
                  </label>
                  <label>
                    Unidade
                    <select value={produtoAtual.unidade} onChange={handleProdutoChange('unidade')}>
                      <option value="">Selecione</option>
                      {UNIDADES.map((unidade) => (
                        <option key={unidade} value={unidade}>
                          {unidade}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Valor Unitário
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={produtoAtual.valorUnitario}
                      onChange={handleProdutoChange('valorUnitario')}
                      placeholder="0.00"
                    />
                  </label>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={adicionarProduto}
                    style={{ marginTop: '24px' }}
                  >
                    <Plus size={18} /> Adicionar
                  </button>
                </div>
              </div>

              {formState.produtos.length > 0 && (
                <div className="products-list">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Descrição</th>
                        <th>Quantidade</th>
                        <th>Valor Unit.</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formState.produtos.map((produto) => (
                        <tr key={produto.id}>
                          <td>{produto.descricao}</td>
                          <td>
                            {produto.quantidade.toLocaleString('pt-BR')} {produto.unidade}
                          </td>
                          <td>{produto.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td>{produto.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td>
                            <button
                              type="button"
                              className="icon-button"
                              onClick={() => removerProduto(produto.id)}
                              aria-label="Remover produto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                          Total:
                        </td>
                        <td style={{ fontWeight: 'bold' }}>
                          {formState.produtos
                            .reduce((acc, p) => acc + p.valorTotal, 0)
                            .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {precisaServico && (
            <div className="form-row">
              <label>
                Valor do Serviço
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formState.produtos.length > 0 ? formState.produtos[0].valorTotal : ''}
                  onChange={(e) => {
                    const valor = Number(e.target.value)
                    if (!Number.isNaN(valor) && valor > 0) {
                      setFormState((prev) => ({
                        ...prev,
                        produtos: [
                          {
                            id: 'serv-1',
                            descricao: formState.servico || 'Serviço',
                            quantidade: 1,
                            unidade: 'un',
                            valorUnitario: valor,
                            valorTotal: valor,
                          },
                        ],
                      }))
                    } else {
                      setFormState((prev) => ({ ...prev, produtos: [] }))
                    }
                  }}
                  placeholder="0.00"
                  required
                />
              </label>
            </div>
          )}

          <div className="form-row">
            <label className="full-width">
              Observações (opcional)
              <textarea
                value={formState.observacoes}
                onChange={handleChange('observacoes')}
                placeholder="Adicione observações sobre esta notafiscal..."
                rows={3}
              />
            </label>
          </div>

          <footer className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              Salvar Notafiscal
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

