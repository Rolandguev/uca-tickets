import { cx } from '../utils/cx';
import './EventPoster.css';

// Afiche del evento: imagen (public/img/eventos) con el título encima.
// Si el evento no tiene imagen (p. ej. creado desde el panel), se usa un degradado con su paleta.
export default function EventPoster({ event, className, priority = false }) {
  const [c1, c2] = event.palette ?? ['#5b21b6', '#be185d'];
  return (
    <div className={cx('poster', className)} style={{ '--p1': c1, '--p2': c2 }}>
      {event.image ? (
        <img
          className="poster__img"
          src={`${import.meta.env.BASE_URL}${event.image}`}
          alt={`Afiche de ${event.title}`}
          width="640"
          height="480"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : (
        <span className="sr-only">Afiche de {event.title}</span>
      )}
      <span className="poster__tag" aria-hidden="true">{event.category}</span>
      <span className="poster__title" aria-hidden="true">{event.title}</span>
      <span className="poster__meta" aria-hidden="true">{event.venue}</span>
    </div>
  );
}
