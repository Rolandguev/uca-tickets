import { useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import EventPoster from '../components/EventPoster';
import ZoneMap from '../components/ZoneMap';
import ZoneList from '../components/ZoneList';
import QuantityStepper from '../components/QuantityStepper';
import ProgressSteps from '../components/ProgressSteps';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Icon from '../components/Icon';
import { MAX_PER_ZONE } from '../data/events';
import { eventStatus, findEvent, findZone, zoneAvailable, STATUS_LABEL, STATUS_TONE } from '../utils/events';
import { formatLongDate, formatMoney, plural } from '../utils/format';
import './EventDetailPage.css';

// Paso 1 de 4: selección de zona y cantidad
export default function EventDetailPage({ catalog, eventId, orders, onAdd, onBack }) {
  const event = findEvent(catalog.data ?? [], eventId);
  const [zoneId, setZoneId] = useState(null);
  const [qty, setQty] = useState(1);

  if (catalog.status === 'loading') return <div className="container"><Loader label="Cargando evento…" /></div>;
  if (catalog.status === 'error') {
    return (
      <div className="container">
        <ErrorMessage title="No pudimos cargar el evento" message={catalog.error.message} onRetry={catalog.reload} />
      </div>
    );
  }
  if (!event) {
    return (
      <div className="container">
        <EmptyState
          title="Este evento no existe"
          message="Puede que se haya retirado. Vuelve al listado para ver los eventos disponibles."
          action={<Button onClick={onBack}>Ver eventos</Button>}
        />
      </div>
    );
  }

  const getAvailable = (zone) => zoneAvailable(event, zone, orders);
  const status = eventStatus(event, orders);
  const soldOut = status === 'agotado';

  // Valores derivados (no se guardan en el estado): zona efectiva y cantidad máxima
  const firstFree = event.zones.find((z) => getAvailable(z) > 0);
  const zone = findZone(event, zoneId) && getAvailable(findZone(event, zoneId)) > 0 ? findZone(event, zoneId) : firstFree;
  const maxQty = zone ? Math.min(MAX_PER_ZONE, getAvailable(zone)) : 0;
  const safeQty = Math.min(qty, Math.max(maxQty, 1));
  const subtotal = zone ? zone.price * safeQty : 0;

  return (
    <div className="container">
      <Button variant="ghost" size="sm" onClick={onBack}>← Volver a eventos</Button>
      <ProgressSteps current={1} />

      <header className="page-header">
        <h1 tabIndex={-1}>Selecciona tus entradas</h1>
        <p>Elige la zona y la cantidad de boletos para continuar.</p>
      </header>

      <div className="detail">
        <Card className="detail__info">
          <EventPoster event={event} />
          <div className="stack detail__text">
            <div className="row">
              <Badge tone="primary">{event.category}</Badge>
              <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
            </div>
            <h2>{event.title}</h2>
            <p className="muted small detail__line"><Icon name="clock" size={16} /> {formatLongDate(event.date)}</p>
            <p className="muted small detail__line"><Icon name="pin" size={16} /> {event.venue}, {event.city}</p>
            <p className="small">{event.description}</p>
          </div>
        </Card>

        <Card className="detail__map" aria-label="Mapa del recinto">
          <ZoneMap event={event} selectedId={zone?.id} getAvailable={getAvailable} onSelect={setZoneId} />
          <p className="muted small detail__hint">Toca una zona del mapa o elígela en la lista de precios.</p>
        </Card>

        <Card className="detail__buy">
          <ZoneList event={event} selectedId={zone?.id} getAvailable={getAvailable} onSelect={setZoneId} />

          {soldOut ? (
            <div className="stack detail__soldout">
              <p role="status"><strong>Este evento está agotado.</strong> Revisa otros eventos disponibles.</p>
              <Button block variant="secondary" onClick={onBack}>Ver otros eventos</Button>
            </div>
          ) : (
            <>
              <div className="detail__qty">
                <span id="qty-label" className="detail__qty-label">Seleccionar cantidad</span>
                <QuantityStepper value={safeQty} min={1} max={maxQty} label="Cantidad de boletos" onChange={setQty} />
              </div>
              <p className="muted small" aria-live="polite">
                {zone && `Máximo ${plural(maxQty, 'boleto', 'boletos')} para esta zona.`}
              </p>
              <dl className="detail__totals">
                <div><dt>Tus boletos</dt><dd>{zone && `${plural(safeQty, 'boleto', 'boletos')} · ${zone.name}`}</dd></div>
                <div className="detail__subtotal"><dt>Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div>
              </dl>
              <Button block disabled={!zone} onClick={() => onAdd({ eventId: event.id, zoneId: zone.id, qty: safeQty }, maxQty)}>
                Comprar boletos
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
