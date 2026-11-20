import { useId } from 'react';
import { cx } from '../utils/cx';
import './Input.css';

// Campo de texto con etiqueta asociada, ayuda y mensaje de error accesibles
export default function Input({ label, error, hint, id, className, ...rest }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cx('field', className)}>
      <label htmlFor={inputId} className="field__label">{label}</label>
      <input
        id={inputId}
        className="field__input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint && !error && <p id={hintId} className="field__hint">{hint}</p>}
      <p id={errorId} className="field__error" aria-live="polite">{error}</p>
    </div>
  );
}
