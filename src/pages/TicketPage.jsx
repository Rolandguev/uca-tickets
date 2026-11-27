import { useState } from 'react';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import TicketCard from '../components/TicketCard';
import { findEvent, findZone } from '../utils/events';
import { ticketsOf } from '../utils/tickets';
import { downloadDataUrl, qrDataUrl } from '../utils/qr';
import { ticketSignature, verifyUrl } from '../utils/verify';
import './TicketPage.css';

export default function TicketPage({ catalog, order, itemIndex, onSend, onBack }) {
  const [index, setIndex] = useState(0);
  const [action, setAction] = useState(null); // 'download' | 'send' | null
  const [error, setError] = useState('');

  if (catalog.status === 'loading') return <div className="container"><Loader label="Cargando tu boleto…" /></div>;
  if (catalog.status === 'error') {
    return (
      <div className="container">
        <ErrorMessage title="No pudimos cargar tu boleto" message={catalog.error.message} onRetry={catalog.reload} />
      </div>
    );
  }

  const item = order?.items[itemIndex];
  const event = item && findEvent(catalog.data, item.eventId);
  if (!order || !event) {
    return (
      <div className="container container--narrow">
        <EmptyState title="No encontramos este boleto" action={<Button onClick={onBack}>Volver a mis boletos</Button>} />
      </div>
    );
  }

  const tickets = ticketsOf(order, itemIndex);
  const ticket = tickets[Math.min(index, tickets.length - 1)];
  const zone = findZone(event, item.zoneId);
  const pending = order.status === 'pendiente';
  const signature = ticketSignature(order, item, ticket);
  const qrValue = verifyUrl(ticket, signature);

  async function download() {
    setAction('download');
    setError('');
    try {
      const url = await qrDataUrl(qrValue);
      downloadDataUrl(url, `boleto-${ticket.code}.png`);
    } catch {
      setError('No pudimos generar la descarga. Inténtalo de nuevo.');
    } finally {
      setAction(null);
    }
  }

  async function send() {
    setAction('send');
    setError('');
    try {
      await onSend(order);
    } catch (err) {
      setError(err.message);
      setAction(null);
    }
  }

  return (
    <div className="container container--narrow">
      <Button variant="ghost" size="sm" onClick={onBack}>← Mis boletos</Button>
      <header className="page-header">
        <h1 tabIndex={-1}>Tu boleto</h1>
        <p>{pending ? 'Este boleto se activará cuando se confirme tu pago.' : 'Presenta este código en la entrada del evento.'}</p>
      </header>

      <TicketCard
        event={event}
        zone={zone}
        ticket={ticket}
        status={order.status}
        price={item.unitPrice}
        qrValue={qrValue}
        signature={signature}
      />

      {tickets.length > 1 && (
        <div className="ticket-pager" role="group" aria-label="Cambiar de boleto">
          <Button variant="secondary" size="sm" onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
            Anterior
          </Button>
          <span aria-live="polite">Boleto {index + 1} de {tickets.length}</span>
          <Button variant="secondary" size="sm" onClick={() => setIndex((i) => i + 1)} disabled={index >= tickets.length - 1}>
            Siguiente
          </Button>
        </div>
      )}

      <div className="ticket-actions">
        {error && <ErrorMessage message={error} />}
        <Button block onClick={download} disabled={pending || action !== null} loading={action === 'download'} loadingText="Generando…">
          Descargar boleto
        </Button>
        <Button block variant="secondary" onClick={send} disabled={pending || action !== null} loading={action === 'send'} loadingText="Enviando…">
          Enviar por correo
        </Button>
      </div>
    </div>
  );
}
