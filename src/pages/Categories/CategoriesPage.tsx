import { useMemo, useState } from 'react'
import './CategoriesPage.css'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

type Category = {
  id: string
  nome: string
  descricao: string
}

export default function CategoriesPage() {
  const [query, setQuery] = useState('')
  const [pagina, setPagina] = useState(1)
  const [itensPorPagina] = useState(8)
  const [categorias, setCategorias] = useState<Category[]>([
    { id: '1', nome: 'Grãos', descricao: 'Cereais e leguminosas' },
    { id: '2', nome: 'Frutas', descricao: 'Frutas frescas e processadas' },
    { id: '3', nome: 'Hortaliças', descricao: 'Verduras e legumes' },
    { id: '4', nome: 'Laticínios', descricao: 'Leite e derivados' },
    { id: '5', nome: 'Carnes', descricao: 'Bovino, suíno, aves' },
    { id: '6', nome: 'Bebidas', descricao: 'Sucos e outros' },
    { id: '7', nome: 'Sementes', descricao: 'Sementes para plantio' },
    { id: '8', nome: 'Fertilizantes', descricao: 'Nutrientes para solo' },
    { id: '9', nome: 'Ferramentas', descricao: 'Ferramentas e equipamentos' },
    { id: '10', nome: 'Outros', descricao: 'Diversos' },
  ])

  const [modalAberto, setModalAberto] = useState(false)
  const [edicao, setEdicao] = useState<Category | null>(null)
  const [confirmacao, setConfirmacao] = useState<Category | null>(null)

  const filtradas = useMemo(() => {
    const q = query.toLowerCase()
    return categorias.filter((c) =>
      !q || c.nome.toLowerCase().includes(q) || c.descricao.toLowerCase().includes(q),
    )
  }, [categorias, query])

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / itensPorPagina))
  const inicio = (pagina - 1) * itensPorPagina
  const paginaAtual = filtradas.slice(inicio, inicio + itensPorPagina)

  function abrirNovo() {
    setEdicao({ id: '', nome: '', descricao: '' })
    setModalAberto(true)
  }
  function abrirEdicao(c: Category) {
    setEdicao(c)
    setModalAberto(true)
  }
  function fecharModal() {
    setModalAberto(false)
    setEdicao(null)
  }
  function salvarCategoria(cat: Category) {
    if (!cat.nome.trim()) return
    if (cat.id) {
      setCategorias((prev) => prev.map((c) => (c.id === cat.id ? cat : c)))
    } else {
      setCategorias((prev) => [{ ...cat, id: String(Date.now()) }, ...prev])
    }
    fecharModal()
  }
  function removerCategoria(cat: Category) {
    setCategorias((prev) => prev.filter((c) => c.id !== cat.id))
    setConfirmacao(null)
  }

  return (
    <div className="categories-page">
      <div className="toolbar">
        <div className="search-group">
          <Search size={18} />
          <input
            className="input"
            placeholder="Buscar por nome ou descrição"
            value={query}
            onChange={(e) => { setPagina(1); setQuery(e.target.value) }}
          />
        </div>
        <button className="add-button" onClick={abrirNovo}>
          <Plus size={18} /> Adicionar Nova Categoria
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th className="center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginaAtual.map((c, idx) => (
              <tr key={c.id} className={idx % 2 === 0 ? 'alt' : ''}>
                <td>{c.nome}</td>
                <td>{c.descricao}</td>
                <td className="center actions">
                  <button className="icon green" onClick={() => abrirEdicao(c)} aria-label={`Editar ${c.nome}`}>
                    <Pencil size={18} />
                  </button>
                  <button className="icon danger" onClick={() => setConfirmacao(c)} aria-label={`Remover ${c.nome}`}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {paginaAtual.length === 0 && (
              <tr>
                <td colSpan={3} className="empty">Nenhuma categoria encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={pagina === 1} onClick={() => setPagina((p) => Math.max(1, p - 1))}>Anterior</button>
        {Array.from({ length: totalPaginas }).map((_, i) => (
          <button
            key={i}
            className={`page ${pagina === i + 1 ? 'active' : ''}`}
            onClick={() => setPagina(i + 1)}
          >{i + 1}</button>
        ))}
        <button disabled={pagina === totalPaginas} onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}>Próxima</button>
      </div>

      {modalAberto && edicao && (
        <CategoryModal initial={edicao} onClose={fecharModal} onSave={salvarCategoria} />
      )}

      {confirmacao && (
        <ConfirmModal
          message={`Remover \"${confirmacao.nome}\"? Esta ação não pode ser desfeita.`}
          onCancel={() => setConfirmacao(null)}
          onConfirm={() => removerCategoria(confirmacao)}
        />
      )}
    </div>
  )
}

type CategoryModalProps = {
  initial: Category
  onClose: () => void
  onSave: (cat: Category) => void
}

function CategoryModal({ initial, onClose, onSave }: CategoryModalProps) {
  const [cat, setCat] = useState<Category>(initial)
  const [erro, setErro] = useState<string | null>(null)

  function salvar() {
    if (!cat.nome.trim()) { setErro('Informe o nome da categoria.'); return }
    setErro(null)
    onSave(cat)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{cat.id ? 'Editar Categoria' : 'Nova Categoria'}</h3>
        {erro && <div className="modal-error">{erro}</div>}
        <div className="modal-grid">
          <div className="field">
            <label>Nome da Categoria</label>
            <input className="input" value={cat.nome} onChange={(e) => setCat({ ...cat, nome: e.target.value })} placeholder="Ex.: Grãos" />
          </div>
          <div className="field">
            <label>Descrição</label>
            <textarea className="textarea" value={cat.descricao} onChange={(e) => setCat({ ...cat, descricao: e.target.value })} placeholder="Descrição da categoria" />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={salvar}>Salvar</button>
        </div>
      </div>
    </div>
  )
}

type ConfirmModalProps = {
  message: string
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmModal({ message, onCancel, onConfirm }: ConfirmModalProps) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn danger" onClick={onConfirm}>Remover</button>
        </div>
      </div>
    </div>
  )
}


