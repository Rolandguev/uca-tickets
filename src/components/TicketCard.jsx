import Badge from './Badge';
import QRCode from './QRCode';
import { formatDateTime, formatMoney } from '../utils/format';
import { TICKET_LABEL, ORDER_TONE } from '../utils/tickets';
import './TicketCard.css';

// Boleto con QR. Se dibuja sobre una tarjeta blanca para que el QR se pueda escanear.
// "qrValue" es la URL de verificación y "signature" la firma corta que se imprime debajo.
export default function TicketCard({ event, zone, ticket, status, price, qrValue, signature }) {
  return (
    <article className="ticket" aria-label={`Boleto ${ticket.code}`}>
      <header className="ticket__head">
        <div>
          <h2 className="ticket__title">{event.title}</h2>
          <p className="ticket__meta">{formatDateTime(event.date)}</p>
          <p className="ticket__meta">{event.venue}, {event.city}</p>
        </div>
        <Badge tone={ORDER_TONE[status]}>{TICKET_LABEL[status] ?? status}</Badge>
      </header>

      <dl className="ticket__grid">
        <div><dt>Zona</dt><dd>{zone.name}</dd></div>
        <div><dt>Fila</dt><dd>{ticket.row}</dd></div>
        <div><dt>Asiento</dt><dd>{ticket.seat}</dd></div>
        <div><dt>Precio</dt><dd>{formatMoney(price)}</dd></div>
      </dl>

      <div className="ticket__qr">
        <QRCode value={qrValue} label={`Código QR del boleto ${ticket.code}. Al escanearlo se verifica el boleto.`} />
        <p className="ticket__code">{ticket.code}</p>
        <p className="ticket__sig">Verificación: {signature}</p>
      </div>
    </article>
  );
}
