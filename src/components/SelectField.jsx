import { useId } from 'react';
import { cx } from '../utils/cx';
import './Input.css';

// Lista desplegable con etiqueta y error accesibles (usa los mismos estilos que Input)
//   options: lista de textos, por ejemplo ['Rock', 'Jazz']
export default function SelectField({ label, error, id, options, className, ...rest }) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const errorId = `${selectId}-error`;

  return (
    <div className={cx('field', className)}>
      <label htmlFor={selectId} className="field__label">{label}</label>
      <select
        id={selectId}
        className="field__input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <p id={errorId} className="field__error" aria-live="polite">{error}</p>
    </div>
  );
}
