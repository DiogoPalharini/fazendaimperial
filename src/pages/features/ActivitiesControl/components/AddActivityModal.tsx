import { useState, type ChangeEvent, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { Activity, ActivityType, ActivityStatus, ActivityPriority } from '../types'
import { ACTIVITY_TYPES, ACTIVITY_STATUSES, ACTIVITY_PRIORITIES, FUNCIONARIOS, TALHOES, CULTURAS } from '../constants'
import '../ActivitiesControl.css'

type AddActivityModalProps = {
  onClose: () => void
  onSave: (activity: Omit<Activity, 'id'>) => void
}

export default function AddActivityModal({ onClose, onSave }: AddActivityModalProps) {
  const [formState, setFormState] = useState({
    titulo: '',
    descricao: '',
    tipo: 'Plantio' as ActivityType,
    funcionario: '',
    talhao: '',
    cultura: '',
    dataInicio: new Date().toISOString().slice(0, 10),
    dataFim: '',
    status: 'Pendente' as ActivityStatus,
    prioridade: 'Média' as ActivityPriority,
    observacoes: '',
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

    if (!formState.titulo || !formState.descricao || !formState.funcionario || !formState.dataInicio) {
      setErro('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    onSave({
      titulo: formState.titulo,
      descricao: formState.descricao,
      tipo: formState.tipo,
      funcionario: formState.funcionario,
      talhao: formState.talhao || undefined,
      cultura: formState.cultura || undefined,
      dataInicio: formState.dataInicio,
      dataFim: formState.dataFim || undefined,
      status: formState.status,
      prioridade: formState.prioridade,
      observacoes: formState.observacoes.trim() || undefined,
      dataConclusao: formState.status === 'Concluída' ? new Date().toISOString().slice(0, 10) : undefined,
    })
  }

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
            <h3 className="modal-title">Nova Atividade</h3>
            <p className="modal-subtitle">Cadastre uma nova atividade para os funcionários</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        {erro && <div className="modal-error">{erro}</div>}

        <form className="inputs-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="full-width">
              Título
              <input
                type="text"
                value={formState.titulo}
                onChange={handleChange('titulo')}
                placeholder="Ex: Aplicação de Defensivos - Talhão 07"
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label className="full-width">
              Descrição
              <textarea
                value={formState.descricao}
                onChange={handleChange('descricao')}
                placeholder="Descreva a atividade a ser realizada..."
                rows={3}
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Tipo
              <select value={formState.tipo} onChange={handleChange('tipo')} required>
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Funcionário
              <select value={formState.funcionario} onChange={handleChange('funcionario')} required>
                <option value="">Selecione o funcionário</option>
                {FUNCIONARIOS.map((funcionario) => (
                  <option key={funcionario} value={funcionario}>
                    {funcionario}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Talhão (opcional)
              <select value={formState.talhao} onChange={handleChange('talhao')}>
                <option value="">Nenhum</option>
                {TALHOES.map((talhao) => (
                  <option key={talhao} value={talhao}>
                    {talhao}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cultura (opcional)
              <select value={formState.cultura} onChange={handleChange('cultura')}>
                <option value="">Nenhuma</option>
                {CULTURAS.map((cultura) => (
                  <option key={cultura} value={cultura}>
                    {cultura}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Data de Início
              <input type="date" value={formState.dataInicio} onChange={handleChange('dataInicio')} required />
            </label>
            <label>
              Data de Fim (opcional)
              <input type="date" value={formState.dataFim} onChange={handleChange('dataFim')} />
            </label>
          </div>

          <div className="form-row">
            <label>
              Status
              <select value={formState.status} onChange={handleChange('status')} required>
                {ACTIVITY_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Prioridade
              <select value={formState.prioridade} onChange={handleChange('prioridade')} required>
                {ACTIVITY_PRIORITIES.map((prioridade) => (
                  <option key={prioridade} value={prioridade}>
                    {prioridade}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label className="full-width">
              Observações (opcional)
              <textarea
                value={formState.observacoes}
                onChange={handleChange('observacoes')}
                placeholder="Adicione observações sobre esta atividade..."
                rows={3}
              />
            </label>
          </div>

          <footer className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              Salvar Atividade
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

