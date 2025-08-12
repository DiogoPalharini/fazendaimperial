// src/components/ItemFormModal.tsx
import { useState } from "react";

export type Item = {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  custo: number;
};

type Props = {
  initial: Item;
  categorias: string[];
  onClose: () => void;
  onSave: (item: Item) => void;
};

export default function ItemFormModal({ initial, categorias, onClose, onSave }: Props) {
  const [item, setItem] = useState<Item>(initial);
  const [erro, setErro] = useState<string | null>(null);

  function salvar() {
    if (!item.nome.trim()) { setErro("Informe o nome do item."); return; }
    if (!item.categoria) { setErro("Selecione a categoria."); return; }
    setErro(null);
    onSave(item);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{item.id ? "Editar Item" : "Novo Item"}</h3>
        {erro && <div className="modal-error">{erro}</div>}
        <div className="modal-grid">
          <div className="field">
            <label>Nome</label>
            <input className="input" value={item.nome} onChange={(e) => setItem({ ...item, nome: e.target.value })} placeholder="Ex.: Milho" />
          </div>
          <div className="field">
            <label>Categoria</label>
            <select className="select" value={item.categoria} onChange={(e) => setItem({ ...item, categoria: e.target.value })}>
              <option value="">Selecione...</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Quantidade</label>
            <input className="input" type="number" value={item.quantidade} onChange={(e) => setItem({ ...item, quantidade: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Unidade</label>
            <input className="input" value={item.unidade} onChange={(e) => setItem({ ...item, unidade: e.target.value })} placeholder="kg, un, L" />
          </div>
          <div className="field">
            <label>Custo</label>
            <input className="input" type="number" step="0.01" value={item.custo} onChange={(e) => setItem({ ...item, custo: Number(e.target.value) })} />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={salvar}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
