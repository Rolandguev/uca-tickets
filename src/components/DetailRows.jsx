import './DetailRows.css';

// Lista de pares etiqueta / valor. "value" puede ser texto o un componente (p. ej. un Badge).
export default function DetailRows({ items }) {
  return (
    <dl className="detail-rows">
      {items.map(({ label, value }) => (
        <div key={label} className="detail-rows__row">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
