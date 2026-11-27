import { Link } from 'react-router';
import DetailRows from '../components/DetailRows';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import StatusScreen from '../components/StatusScreen';
import { findEvent, findZone } from '../utils/events';
import { formatDateTime } from '../utils/format';
import { verifyTicket } from '../utils/verify';
import './ResultPages.css';

const RESULT = {
  valido: { tone: 'success', icon: 'check', title: 'Boleto válido', message: 'El boleto existe, está pagado y su firma coincide.' },
  pendiente: { tone: 'warning', icon: 'clock', title: 'Pago pendiente', message: 'El boleto existe, pero su pago todavía no se ha confirmado. No permite el ingreso.' },
  firma: { tone: 'error', icon: 'x', title: 'Boleto alterado', message: 'El código no coincide con su firma de verificación. No permite el ingreso.' },
  rechazado: { tone: 'error', icon: 'x', title: 'Pago rechazado', message: 'La orden de este boleto fue rechazada. No permite el ingreso.' },
  'no-existe': { tone: 'error', icon: 'x', title: 'Boleto no encontrado', message: 'No existe un boleto con este código.' },
};

// Verificación de un boleto escaneado (simulada: se comprueba con las órdenes guardadas en este navegador)
export default function VerifyPage({ catalog, orders, code, signature }) {
  if (catalog.status === 'loading') return <div className="container"><Loader label="Verificando boleto…" /></div>;
  if (catalog.status === 'error') {
    return (
      <div className="container">
        <ErrorMessage title="No pudimos verificar el boleto" message={catalog.error.message} onRetry={catalog.reload} />
      </div>
    );
  }

  const check = verifyTicket(orders, code, signature ?? '');
  const info = RESULT[check.result];
  const event = check.item && findEvent(catalog.data, check.item.eventId);
  const zone = event && findZone(event, check.item.zoneId);

  const rows = [{ label: 'Código', value: code }];
  if (event) {
    rows.push(
      { label: 'Evento', value: event.title },
      { label: 'Fecha', value: formatDateTime(event.date) },
      { label: 'Ubicación', value: `Zona ${zone?.name ?? check.item.zoneId} · Fila ${check.ticket.row} · Asiento ${check.ticket.seat}` },
      { label: 'Pedido', value: `#${check.order.id}` },
    );
  }

  return (
    <div className="container container--narrow result">
      <StatusScreen tone={info.tone} icon={info.icon} title={info.title} message={info.message} />
      <DetailRows items={rows} />
      <p className="muted small result__note">
        Verificación simulada: se compara con las órdenes guardadas en este navegador.
      </p>
      <div className="result__actions">
        <Link to="/eventos" className="btn btn--secondary btn--block">Ir a eventos</Link>
      </div>
    </div>
  );
}
