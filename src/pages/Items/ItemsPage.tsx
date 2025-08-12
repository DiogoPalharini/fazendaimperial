import { useMemo, useState } from "react";
import "./ItemsPage.css";
import { Plus, Pencil, Trash2, Search, Filter } from "lucide-react";
import ItemFormModal from "../../components/ItemFormModal";
import type { Item } from "../../components/ItemFormModal";
import ConfirmModal from "../../components/ConfirmModal";

const CATEGORIAS = ["Grãos", "Frutas", "Hortaliças", "Laticínios"];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ItemsPage() {
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState<string>("");
  const [ordenarPor, setOrdenarPor] = useState<"nome" | "categoria" | "quantidade" | "custo">("nome");
  const [asc, setAsc] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [itensPorPagina] = useState(8);

  const [itens, setItens] = useState<Item[]>(
    Array.from({ length: 25 }).map((_, i) => ({
      id: String(i + 1),
      nome: `Item ${i + 1}`,
      categoria: CATEGORIAS[i % CATEGORIAS.length],
      quantidade: Math.floor(Math.random() * 500),
      unidade: "kg",
      custo: Number((Math.random() * 100).toFixed(2)),
    }))
  );

  const [modalAberto, setModalAberto] = useState(false);
  const [edicao, setEdicao] = useState<Item | null>(null);
  const [confirmacao, setConfirmacao] = useState<Item | null>(null);

  const itensFiltrados = useMemo(() => {
    let data = itens.filter(
      (i) =>
        (!query || i.nome.toLowerCase().includes(query.toLowerCase())) &&
        (!categoria || i.categoria === categoria)
    );
    data = data.sort((a, b) => {
      const dir = asc ? 1 : -1;
      if (ordenarPor === "nome" || ordenarPor === "categoria") {
        return a[ordenarPor].localeCompare(b[ordenarPor]) * dir;
      }
      return (a as any)[ordenarPor] - (b as any)[ordenarPor] * dir;
    });
    return data;
  }, [itens, query, categoria, ordenarPor, asc]);

  const totalPaginas = Math.max(1, Math.ceil(itensFiltrados.length / itensPorPagina));
  const inicio = (pagina - 1) * itensPorPagina;
  const paginaAtual = itensFiltrados.slice(inicio, inicio + itensPorPagina);

  function abrirNovo() {
    setEdicao({ id: "", nome: "", categoria: "", quantidade: 0, unidade: "un", custo: 0 });
    setModalAberto(true);
  }
  function abrirEdicao(item: Item) {
    setEdicao(item);
    setModalAberto(true);
  }
  function fecharModal() {
    setModalAberto(false);
    setEdicao(null);
  }
  function salvarItem(item: Item) {
    if (!item.nome.trim()) return;
    if (item.id) {
      setItens((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    } else {
      setItens((prev) => [{ ...item, id: String(Date.now()) }, ...prev]);
    }
    fecharModal();
  }
  function removerItem(item: Item) {
    setItens((prev) => prev.filter((i) => i.id !== item.id));
    setConfirmacao(null);
  }

  return (
    <div className="items-page">
      {/* Barra de ferramentas */}
      <div className="toolbar">
        <div className="search-group">
          <Search size={18} />
          <input
            className="input"
            placeholder="Buscar por nome"
            value={query}
            onChange={(e) => {
              setPagina(1);
              setQuery(e.target.value);
            }}
          />
        </div>

        <div className="filters">
          <div className="select-group">
            <Filter size={18} />
            <select className="select" value={categoria} onChange={(e) => { setPagina(1); setCategoria(e.target.value); }}>
              <option value="">Todas as categorias</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="select-group">
            <span className="select-label">Ordenar por</span>
            <select className="select" value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value as any)}>
              <option value="nome">Nome</option>
              <option value="categoria">Categoria</option>
              <option value="quantidade">Quantidade</option>
              <option value="custo">Custo</option>
            </select>
            <button className="toggle" onClick={() => setAsc((v) => !v)}>{asc ? "▲" : "▼"}</button>
          </div>
        </div>

        <button className="add-button" onClick={abrirNovo}>
          <Plus size={18} /> Adicionar Novo Item
        </button>
      </div>

      {/* Tabela */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th className="right">Quantidade</th>
              <th>Unidade</th>
              <th className="right">Custo</th>
              <th className="center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginaAtual.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 0 ? "alt" : ""}>
                <td>{item.nome}</td>
                <td>{item.categoria}</td>
                <td className="right">{item.quantidade}</td>
                <td>{item.unidade}</td>
                <td className="right">{formatCurrency(item.custo)}</td>
                <td className="center actions">
                  <button className="icon green" onClick={() => abrirEdicao(item)}>
                    <Pencil size={18} />
                  </button>
                  <button className="icon danger" onClick={() => setConfirmacao(item)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {paginaAtual.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">Nenhum item encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="pagination">
        <button disabled={pagina === 1} onClick={() => setPagina((p) => Math.max(1, p - 1))}>Anterior</button>
        {Array.from({ length: totalPaginas }).map((_, i) => (
          <button key={i} className={`page ${pagina === i + 1 ? "active" : ""}`} onClick={() => setPagina(i + 1)}>
            {i + 1}
          </button>
        ))}
        <button disabled={pagina === totalPaginas} onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}>Próxima</button>
      </div>

      {/* Modais */}
      {modalAberto && edicao && (
        <ItemFormModal
          initial={edicao}
          categorias={CATEGORIAS}
          onClose={fecharModal}
          onSave={salvarItem}
        />
      )}
      {confirmacao && (
        <ConfirmModal
          message={`Remover "${confirmacao.nome}"? Esta ação não pode ser desfeita.`}
          onCancel={() => setConfirmacao(null)}
          onConfirm={() => removerItem(confirmacao)}
        />
      )}
    </div>
  );
}
