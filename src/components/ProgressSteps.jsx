import './ProgressSteps.css';

export const STEPS = ['Selección', 'Carrito', 'Pago', 'Confirmación'];

// Indicador de progreso de la compra (4 pasos). "current" va de 1 a 4.
export default function ProgressSteps({ current }) {
  return (
    <div className="progress" role="group" aria-label="Progreso de la compra">
      <ol className="progress__bars">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < current ? 'done' : n === current ? 'current' : 'todo';
          return (
            <li
              key={label}
              className={`progress__bar progress__bar--${state}`}
              aria-current={n === current ? 'step' : undefined}
            >
              <span className="sr-only">{`Paso ${n}: ${label}${state === 'done' ? ' (completado)' : ''}`}</span>
            </li>
          );
        })}
      </ol>
      <p className="progress__label">Paso {current} de {STEPS.length} · {STEPS[current - 1]}</p>
    </div>
  );
}
