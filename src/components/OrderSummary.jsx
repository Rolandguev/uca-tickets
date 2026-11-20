import Card from './Card';
import { formatDateTime, formatMoney } from '../utils/format';
import './OrderSummary.css';

// Resumen de compra: líneas agrupadas por evento + cargo por servicio + total
export default function OrderSummary({ title = 'Resumen de compra', lines, totals }) {
  const groups = lines.reduce((acc, line) => {
    (acc[line.event.id] ??= { event: line.event, lines: [] }).lines.push(line);
    return acc;
  }, {});

  return (
    <Card title={title} className="summary">
      {Object.values(groups).map(({ event, lines: eventLines }) => (
        <div key={event.id} className="summary__event">
          <h3>{event.title}</h3>
          <p className="muted small">{formatDateTime(event.date)}</p>
          <p className="muted small">{event.venue}, {event.city}</p>
          <dl className="summary__rows">
            {eventLines.map((l) => (
              <div key={l.zoneId} className="summary__row">
                <dt>Zona {l.zone.name} × {l.qty}</dt>
                <dd>{formatMoney(l.lineTotal)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      <dl className="summary__rows summary__rows--totals">
        <div className="summary__row">
          <dt>Subtotal</dt>
          <dd>{formatMoney(totals.subtotal)}</dd>
        </div>
        <div className="summary__row">
          <dt>Cargo por servicio</dt>
          <dd>{formatMoney(totals.fee)}</dd>
        </div>
        <div className="summary__row summary__row--total">
          <dt>Total</dt>
          <dd>{formatMoney(totals.total)}</dd>
        </div>
      </dl>
    </Card>
  );
}
