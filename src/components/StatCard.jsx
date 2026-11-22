import './StatCard.css';

// Tarjeta de una métrica: etiqueta, valor grande y una nota opcional
export default function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card">
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {hint && <p className="stat-card__hint">{hint}</p>}
    </article>
  );
}

