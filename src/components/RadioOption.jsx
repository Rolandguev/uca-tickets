import { cx } from '../utils/cx';
import './RadioOption.css';

// Opción de un grupo de radios con aspecto de tarjeta (zonas, métodos de pago)
export default function RadioOption({ name, value, checked, onChange, disabled, className, children }) {
  return (
    <label className={cx('radio-option', checked && 'is-checked', disabled && 'is-disabled', className)}>
      <input
        type="radio"
        className="sr-only"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      <span className="radio-option__dot" aria-hidden="true" />
      <span className="radio-option__body">{children}</span>
    </label>
  );
}
