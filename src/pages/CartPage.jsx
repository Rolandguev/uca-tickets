import { useState } from 'react';
import Button from '../components/Button';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';
import ProgressSteps from '../components/ProgressSteps';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import { MAX_PER_ZONE } from '../data/events';
import { zoneAvailable } from '../utils/events';
import { plural } from '../utils/format';
import './CartPage.css';

// Paso 2 de 4: carrito y resumen de compra
export default function CartPage({ catalog, lines, totals, orders, onQty, onRemove, onClear, onCheckout, onBack }) {
  // pending: null | { type: 'one', line } | { type: 'all' }
  const [pending, setPending] = useState(null);

  if (catalog.status === 'loading') return <div className="container"><Loader label="Cargando carrito…" /></div>;
  if (catalog.status === 'error') {
    return (
      <div className="container">
        <ErrorMessage title="No pudimos cargar tu carrito" message={catalog.error.message} onRetry={catalog.reload} />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container container--medium">
        <header className="page-header"><h1 tabIndex={-1}>Tu carrito</h1></header>
        <EmptyState
          icon="cart"
          title="Tu carrito está vacío"
          message="Todavía no has agregado boletos. Elige un evento y una zona para empezar."
          action={<Button onClick={onBack}>Ver eventos</Button>}
        />
      </div>
    );
  }

  function confirmRemove() {
    if (pending?.type === 'all') onClear();
    if (pending?.type === 'one') onRemove(pending.line);
    setPending(null);
  }

  return (
    <div className="container">
      <ProgressSteps current={2} />
      <header className="page-header">
        <h1 tabIndex={-1}>Tu carrito</h1>
        <p>{plural(totals.count, 'boleto', 'boletos')} en tu pedido. Revisa los datos antes de pagar.</p>
      </header>

      <div className="cart">
        <div className="cart__list">
          <ul className="stack cart__items">
            {lines.map((line) => (
              <CartItem
                key={`${line.eventId}-${line.zoneId}`}
                line={line}
                max={Math.min(MAX_PER_ZONE, zoneAvailable(line.event, line.zone, orders))}
                onQtyChange={(l, qty) => onQty(l, qty)}
                onRemove={(l) => setPending({ type: 'one', line: l })}
              />
            ))}
          </ul>
          <Button variant="ghost" size="sm" onClick={() => setPending({ type: 'all' })}>Vaciar carrito</Button>
        </div>

        <aside className="cart__side" aria-label="Resumen de compra">
          <OrderSummary lines={lines} totals={totals} />
          <Button block onClick={onCheckout}>Continuar al pago</Button>
          <Button block variant="secondary" onClick={onBack}>Seguir comprando</Button>
        </aside>
      </div>

      <Modal
        open={pending !== null}
        title={pending?.type === 'all' ? '¿Vaciar el carrito?' : '¿Quitar este boleto?'}
        onClose={() => setPending(null)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setPending(null)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmRemove}>
              {pending?.type === 'all' ? 'Sí, vaciar' : 'Sí, quitar'}
            </Button>
          </>
        }
      >
        {pending?.type === 'all'
          ? 'Se quitarán todos los boletos de tu pedido.'
          : pending && `Se quitará "${pending.line.event.title}" (zona ${pending.line.zone.name}) de tu pedido.`}
      </Modal>
    </div>
  );
}
