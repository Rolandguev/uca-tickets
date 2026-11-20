import Badge from '../components/Badge';
import Button from '../components/Button';
import DetailRows from '../components/DetailRows';
import EmptyState from '../components/EmptyState';
import ProgressSteps from '../components/ProgressSteps';
import StatusScreen from '../components/StatusScreen';
import { formatMoney } from '../utils/format';
import { ORDER_LABEL, ORDER_TONE } from '../utils/tickets';
import './ResultPages.css';

// Pago rechazado: el carrito se conserva para reintentar
export default function FailedPage({ order, onRetry, onChangeMethod, onEvents }) {
  if (!order) {
    return (
      <div className="container container--narrow">
        <EmptyState title="No encontramos este pedido" action={<Button onClick={onEvents}>Ver eventos</Button>} />
      </div>
    );
  }
  return (
    <div className="container container--narrow result">
      <ProgressSteps current={3} />
      <StatusScreen
        tone="error"
        icon="x"
        title="No pudimos procesar tu pago"
        message="Tu banco rechazó la transacción. Verifica los datos de tu tarjeta o prueba con otro método. No se hizo ningún cobro."
      />
      <DetailRows
        items={[
          { label: 'Pedido', value: `#${order.id}` },
          { label: 'Total', value: formatMoney(order.total) },
          { label: 'Estado', value: <Badge tone={ORDER_TONE[order.status]}>{ORDER_LABEL[order.status]}</Badge> },
        ]}
      />
      <div className="result__actions">
        <Button block onClick={onRetry}>Intentar de nuevo</Button>
        <Button block variant="secondary" onClick={onChangeMethod}>Cambiar método de pago</Button>
      </div>
    </div>
  );
}
