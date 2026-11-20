import Badge from '../components/Badge';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { findZone } from '../utils/events';
import { monthDay, plural } from '../utils/format';
import { ORDER_TONE, TICKET_LABEL, ticketGroups } from '../utils/tickets';
import './MyTicketsPage.css';

export default function MyTicketsPage({ catalog, orders, onOpen, onEvents }) {
  if (catalog.status === 'loading') return <div className="container"><Loader label="Cargando tus boletos…" /></div>;
  if (catalog.status === 'error') {
    return (
      <div className="container">
        <ErrorMessage title="No pudimos cargar tus boletos" message={catalog.error.message} onRetry={catalog.reload} />
      </div>
    );
  }

  const groups = ticketGroups(orders, catalog.data);

  return (
    <div className="container container--medium">
      <header className="page-header">
        <h1 tabIndex={-1}>Mis boletos</h1>
        <p>Aquí encuentras las entradas que compraste.</p>
      </header>

      {groups.length === 0 ? (
        <EmptyState
          icon="cart"
          title="Aún no tienes boletos"
          message="Cuando compres entradas aparecerán aquí con su código QR."
          action={<Button onClick={onEvents}>Ver eventos</Button>}
        />
      ) : (
        <ul className="my-tickets">
          {groups.map((g) => {
            const { month, day } = monthDay(g.event.date);
            const zone = findZone(g.event, g.item.zoneId);
            return (
              <li key={g.key}>
                <button type="button" className="my-ticket" onClick={() => onOpen(g.order.id, g.itemIndex)}>
                  <span className="my-ticket__date" aria-hidden="true">
                    <span className="my-ticket__month">{month}</span>
                    <span className="my-ticket__day">{day}</span>
                  </span>
                  <span className="my-ticket__info">
                    <span className="my-ticket__title">{g.event.title}</span>
                    <span className="my-ticket__meta">
                      {g.event.venue} · Zona {zone?.name} · {plural(g.item.qty, 'boleto', 'boletos')}
                    </span>
                  </span>
                  <Badge tone={ORDER_TONE[g.order.status]}>{TICKET_LABEL[g.order.status]}</Badge>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
