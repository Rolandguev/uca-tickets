// RUTAS DE LA PERSONA A: catálogo, compra y boletos.
// Cada "Screen" lee el estado global (Context) y los parámetros de la URL y se los pasa a su página.
import { useParams, useSearchParams } from 'react-router';
import EventsPage from '../pages/EventsPage';
import EventDetailPage from '../pages/EventDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import SuccessPage from '../pages/SuccessPage';
import FailedPage from '../pages/FailedPage';
import MyTicketsPage from '../pages/MyTicketsPage';
import TicketPage from '../pages/TicketPage';
import SentPage from '../pages/SentPage';
import { useData, useMyOrders } from '../context/DataContext';
import { useCart, useCartSummary } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import { usePrefs } from '../context/PrefsContext';
import { processPayment, sendTicketEmail } from '../utils/api';
import { zoneAvailable } from '../utils/events';
import { buildOrder, nextOrderId } from '../utils/tickets';
import { useGo } from './paths';

function EventsScreen() {
  const { catalog, orders } = useData();
  const { category, setCategory } = usePrefs();
  const go = useGo();
  return (
    <EventsPage
      catalog={catalog}
      orders={orders}
      category={category}
      onCategory={setCategory}
      onOpen={(id) => go('event', { id })}
    />
  );
}

function EventDetailScreen() {
  const { id } = useParams();
  const { catalog, orders } = useData();
  const { addItem } = useCart();
  const go = useGo();
  return (
    <EventDetailPage
      key={id}
      catalog={catalog}
      eventId={id}
      orders={orders}
      onAdd={(item, max) => {
        addItem(item, max);
        go('cart');
      }}
      onBack={() => go('events')}
    />
  );
}

function CartScreen() {
  const { catalog, orders } = useData();
  const { setQty, removeItem, clear } = useCart();
  const { lines, totals } = useCartSummary();
  const go = useGo();
  return (
    <CartPage
      catalog={catalog}
      lines={lines}
      totals={totals}
      orders={orders}
      onQty={(l, qty) => setQty(l.eventId, l.zoneId, qty)}
      onRemove={(l) => removeItem(l.eventId, l.zoneId)}
      onClear={clear}
      onCheckout={() => go('checkout')}
      onBack={() => go('events')}
    />
  );
}

function CheckoutScreen() {
  const [searchParams] = useSearchParams();
  const method = searchParams.get('metodo') ?? undefined;
  const { catalog, orders, addOrder } = useData();
  const { lines, totals } = useCartSummary();
  const { clear } = useCart();
  const { session } = useSession();
  const { simulateErrors } = usePrefs();
  const go = useGo();

  const short = lines.find((l) => l.qty > zoneAvailable(l.event, l.zone, orders));
  const stockError = short
    ? `Ya no hay suficientes boletos en ${short.event.title}, zona ${short.zone.name}. Ajusta la cantidad.`
    : '';

  async function handlePay(values) {
    const status = await processPayment(values, { simulateError: simulateErrors });
    const order = buildOrder({
      id: nextOrderId(orders),
      lines,
      buyer: { name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim() },
      method: values.method,
      status,
      guest: !session,
    });
    addOrder(order);
    if (status === 'rechazado') {
      go('failed', { orderId: order.id });
    } else {
      clear(); // solo se vacía si la compra se registró
      go('success', { orderId: order.id });
    }
  }

  return (
    <CheckoutPage
      key={method ?? 'checkout'}
      catalog={catalog}
      lines={lines}
      totals={totals}
      session={session}
      initialMethod={method}
      stockError={stockError}
      onPay={handlePay}
      onBack={() => go('events')}
      onCart={() => go('cart')}
    />
  );
}

function useOrderFromUrl() {
  const { orderId } = useParams();
  const { orders } = useData();
  return orders.find((o) => o.id === orderId);
}

function SuccessScreen() {
  const order = useOrderFromUrl();
  const { events } = useData();
  const go = useGo();
  return <SuccessPage order={order} events={events} onTickets={() => go('tickets')} onEvents={() => go('events')} />;
}

function FailedScreen() {
  const order = useOrderFromUrl();
  const go = useGo();
  return (
    <FailedPage
      order={order}
      onRetry={() => go('checkout')}
      onChangeMethod={() => go('checkout', { method: 'transferencia' })}
      onEvents={() => go('events')}
    />
  );
}

function MyTicketsScreen() {
  const { catalog } = useData();
  const myOrders = useMyOrders();
  const go = useGo();
  return (
    <MyTicketsPage
      catalog={catalog}
      orders={myOrders}
      onOpen={(orderId, itemIndex) => go('ticket', { orderId, itemIndex })}
      onEvents={() => go('events')}
    />
  );
}

function TicketScreen() {
  const { orderId, itemIndex } = useParams();
  const order = useOrderFromUrl();
  const { catalog } = useData();
  const { simulateErrors } = usePrefs();
  const go = useGo();
  return (
    <TicketPage
      key={`${orderId}-${itemIndex}`}
      catalog={catalog}
      order={order}
      itemIndex={Number(itemIndex) || 0}
      onSend={async (o) => {
        await sendTicketEmail(o.buyer.email, { simulateError: simulateErrors });
        go('sent', { orderId: o.id });
      }}
      onBack={() => go('tickets')}
    />
  );
}

function SentScreen() {
  const order = useOrderFromUrl();
  const { events } = useData();
  const { simulateErrors } = usePrefs();
  const go = useGo();
  return (
    <SentPage
      order={order}
      events={events}
      onResend={(o) => sendTicketEmail(o.buyer.email, { simulateError: simulateErrors })}
      onTickets={() => go('tickets')}
    />
  );
}

// Tabla de rutas de la Persona A (se monta dentro del layout en router.jsx)
export const purchaseRoutes = [
  { index: true, element: <EventsScreen />, handle: { title: 'Inicio' } }, // Fase 2: página de inicio con destacados
  { path: 'eventos', element: <EventsScreen />, handle: { title: 'Eventos' } },
  { path: 'eventos/:id', element: <EventDetailScreen />, handle: { title: 'Selecciona tus entradas' } },
  { path: 'carrito', element: <CartScreen />, handle: { title: 'Carrito' } },
  { path: 'checkout', element: <CheckoutScreen />, handle: { title: 'Pago' } },
  { path: 'checkout/confirmacion/:orderId', element: <SuccessScreen />, handle: { title: 'Confirmación' } },
  { path: 'checkout/rechazado/:orderId', element: <FailedScreen />, handle: { title: 'Pago rechazado' } },
  { path: 'boletos', element: <MyTicketsScreen />, handle: { title: 'Mis boletos' } },
  { path: 'boletos/enviado/:orderId', element: <SentScreen />, handle: { title: 'Boleto enviado' } },
  { path: 'boletos/:orderId/:itemIndex', element: <TicketScreen />, handle: { title: 'Tu boleto' } },
];
