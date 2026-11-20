import Badge from '../components/Badge';
import Button from '../components/Button';
import DetailRows from '../components/DetailRows';
import EmptyState from '../components/EmptyState';
import ProgressSteps from '../components/ProgressSteps';
import StatusScreen from '../components/StatusScreen';
import { findEvent, findZone } from '../utils/events';
import { formatMoney } from '../utils/format';
import { ORDER_LABEL, ORDER_TONE } from '../utils/tickets';
import './ResultPages.css';

// Resumen de los items de una orden: "2 · Zona General"
export function orderItemsText(order, events) {
  return order.items
    .map((it) => {
      const event = findEvent(events, it.eventId);
      return `${it.qty} · Zona ${findZone(event, it.zoneId)?.name ?? it.zoneId}`;
    })
    .join(', ');
}

export function orderEventsText(order, events) {
  return [...new Set(order.items.map((it) => findEvent(events, it.eventId)?.title ?? it.eventId))].join(', ');
}

// Paso 4 de 4: confirmación (pago exitoso o pedido pendiente)
export default function SuccessPage({ order, events, onTickets, onEvents }) {
  if (!order) {
    return (
      <div className="container container--narrow">
        <EmptyState title="No encontramos este pedido" action={<Button onClick={onEvents}>Ver eventos</Button>} />
      </div>
    );
  }
  const pending = order.status === 'pendiente';

  return (
    <div className="container container--narrow result">
      <ProgressSteps current={4} />
      <StatusScreen
        tone={pending ? 'warning' : 'success'}
        icon={pending ? 'clock' : 'check'}
        title={pending ? 'Pedido registrado' : '¡Pago exitoso!'}
        message={
          pending
            ? 'Tienes 24 horas para completar tu transferencia o pago en efectivo. Tus boletos se activarán al confirmarlo.'
            : `Tu compra fue confirmada. Te enviamos tus boletos a ${order.buyer.email}.`
        }
      />
      <DetailRows
        items={[
          { label: 'Pedido', value: `#${order.id}` },
          { label: 'Evento', value: orderEventsText(order, events) },
          { label: 'Boletos', value: orderItemsText(order, events) },
          { label: 'Total', value: formatMoney(order.total) },
          { label: 'Estado', value: <Badge tone={ORDER_TONE[order.status]}>{ORDER_LABEL[order.status]}</Badge> },
        ]}
      />
      <div className="result__actions">
        <Button block onClick={onTickets}>Ver mis boletos</Button>
        <Button block variant="secondary" onClick={onEvents}>Volver a eventos</Button>
      </div>
    </div>
  );
}
