import { useEffect, useId, useRef } from 'react';
import './Modal.css';

// Diálogo modal basado en <dialog>: el navegador maneja el foco, Esc y el fondo.
export default function Modal({ open, title, onClose, children, actions }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      <div className="modal__body">
        <h2 id={titleId}>{title}</h2>
        <div className="modal__content">{children}</div>
        <div className="modal__actions">{actions}</div>
      </div>
    </dialog>
  );
}
