import Card from './Card';
import Badge from './Badge';
import Button from './Button';
import EventPoster from './EventPoster';
import { formatDateTime, formatMoney } from '../utils/format';
import { minPrice, STATUS_LABEL, STATUS_TONE } from '../utils/events';
import './EventCard.css';

export default function EventCard({ event, status, onOpen }) {
  const soldOut = status === 'agotado';
  return (
    <Card as="article" className="event-card" aria-labelledby={`ev-${event.id}`}>
      <EventPoster event={event} />
      <div className="event-card__body">
        {status !== 'disponible' && (
          <div className="row">
            <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
          </div>
        )}
        <h2 id={`ev-${event.id}`} className="event-card__title">{event.title}</h2>
        <p className="muted small">{formatDateTime(event.date)}</p>
        <p className="muted small">{event.venue}, {event.city}</p>
        <p className="event-card__price">
          {soldOut ? 'Sin boletos disponibles' : <>Desde <strong>{formatMoney(minPrice(event))}</strong></>}
        </p>
        <Button
          block
          variant={soldOut ? 'secondary' : 'primary'}
          onClick={() => onOpen(event.id)}
          aria-label={`${soldOut ? 'Ver detalle' : 'Comprar boletos'}: ${event.title}`}
        >
          {soldOut ? 'Ver detalle' : 'Comprar boletos'}
        </Button>
      </div>
    </Card>
  );
}
