import './BarChart.css';

// Gráfico de barras horizontal hecho con HTML y CSS (sin librerías).
//   data: [{ key, label, value }]     format: (valor) => texto que se muestra junto a la barra
export default function BarChart({ title, data, format = String }) {
  const max = Math.max(0, ...data.map((d) => d.value));

  return (
    <figure className="bar-chart">
      <figcaption className="bar-chart__title">{title}</figcaption>
      {data.length === 0 ? (
        <p className="bar-chart__empty">Sin datos para mostrar.</p>
      ) : (
        <ul className="bar-chart__list">
          {data.map((d) => {
            // Una barra con valor siempre se ve, aunque sea pequeña
            const width = max > 0 && d.value > 0 ? Math.max(2, (d.value / max) * 100) : 0;
            return (
              <li key={d.key} className="bar-chart__row">
                <span className="bar-chart__label">{d.label}</span>
                <span className="bar-chart__track" aria-hidden="true">
                  <span className="bar-chart__fill" style={{ width: `${width}%` }} />
                </span>
                <span className="bar-chart__value">{format(d.value)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </figure>
  );
}
