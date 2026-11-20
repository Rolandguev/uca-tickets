import './QuantityStepper.css';

// Selector de cantidad accesible: botones − / + y un valor anunciado con aria-live
export default function QuantityStepper({ value, min = 1, max = 8, onChange, label = 'Cantidad' }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button
        type="button"
        className="qty__btn"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Quitar un boleto (${label})`}
      >
        −
      </button>
      <output className="qty__value" aria-live="polite">{value}</output>
      <button
        type="button"
        className="qty__btn"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Agregar un boleto (${label})`}
      >
        +
      </button>
    </div>
  );
}
