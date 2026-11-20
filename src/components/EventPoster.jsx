import { cx } from '../utils/cx';
import './EventPoster.css';

// Afiche generado con CSS a partir de la paleta del evento (no hay imágenes externas)
export default function EventPoster({ event, className }) {
  const [c1, c2] = event.palette;
  return (
    <div
      className={cx('poster', className)}
      style={{ '--p1': c1, '--p2': c2 }}
      role="img"
      aria-label={`Afiche de ${event.title}`}
    >
      <span className="poster__tag">{event.category}</span>
      <span className="poster__title">{event.title}</span>
      <span className="poster__meta">{event.venue}</span>
    </div>
  );
}
