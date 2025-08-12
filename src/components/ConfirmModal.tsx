// src/components/ConfirmModal.tsx
type Props = {
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
  };
  
  export default function ConfirmModal({ message, onCancel, onConfirm }: Props) {
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
    );
  }
  