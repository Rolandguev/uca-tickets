import { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import FailedPage from './pages/FailedPage';
import MyTicketsPage from './pages/MyTicketsPage';
import TicketPage from './pages/TicketPage';
import SentPage from './pages/SentPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecoverPage from './pages/RecoverPage';
import ProfilePage from './pages/ProfilePage';
import { EVENTS } from './data/events';
import { SEED_ORDERS } from './data/orders';
import { ACCOUNTS } from './data/accounts';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAsync } from './hooks/useAsync';
import { fetchEvents, processPayment, sendTicketEmail } from './utils/api';
import { loginRequest, recoverRequest, registerRequest } from './utils/authApi';
import { addToCart, cartLines, removeFromCart, setQty, totals as cartTotals } from './utils/cart';
import { zoneAvailable } from './utils/events';
import { buildOrder, nextOrderId } from './utils/tickets';

const TITLES = {
  events: 'Eventos',
  event: 'Selecciona tus entradas',
  cart: 'Carrito',
  checkout: 'Pago',
  success: 'Confirmación',
  failed: 'Pago rechazado',
  tickets: 'Mis boletos',
  ticket: 'Tu boleto',
  sent: 'Boleto enviado',
  login: 'Inicia sesión',
  register: 'Crear cuenta',
  recover: 'Recuperar contraseña',
  profile: 'Mi perfil',
};

export default function App() {
  /* ---------- Estado global (elevado aquí y compartido por props) ---------- */
  const [route, setRoute] = useState({ view: 'events', params: {} });
  const [cart, setCart] = useLocalStorage('uca.cart', []);
  const [session, setSession] = useLocalStorage('uca.session', null);
  const [users, setUsers] = useLocalStorage('uca.users', ACCOUNTS);
  const [orders, setOrders] = useLocalStorage('uca.orders', SEED_ORDERS);
  const [prefs, setPrefs] = useLocalStorage('uca.prefs', { category: 'Todos', simulateErrors: false });

  const simulateError = prefs.simulateErrors;
  const catalog = useAsync(() => fetchEvents(EVENTS, { simulateError }), [simulateError]);
  const events = catalog.data ?? [];

  /* ---------- Valores derivados (no se guardan duplicados) ---------- */
  const lines = useMemo(() => cartLines(cart, events), [cart, events]);
  const summary = useMemo(() => cartTotals(lines), [lines]);
  const cartCount = cart.reduce((n, c) => n + c.qty, 0);

  const myOrders = useMemo(
    () =>
      orders.filter((o) =>
        session ? o.buyer.email.toLowerCase() === session.email.toLowerCase() : o.guest,
      ),
    [orders, session],
  );

  const stockError = useMemo(() => {
    const short = lines.find((l) => l.qty > zoneAvailable(l.event, l.zone, orders));
    return short ? `Ya no hay suficientes boletos en ${short.event.title}, zona ${short.zone.name}. Ajusta la cantidad.` : '';
  }, [lines, orders]);

  /* ---------- Navegación por estado (sin React Router) ---------- */
  const mainRef = useRef(null);
  const lastRoute = useRef(route);

  function navigate(view, params = {}) {
    setRoute({ view, params });
  }

  useEffect(() => {
    document.title = `UCA TICKETS | ${TITLES[route.view] ?? 'Eventos'}`;
    if (lastRoute.current === route) return; // primera carga (y doble efecto de StrictMode)
    lastRoute.current = route;
    window.scrollTo({ top: 0 });
    // Lleva el foco al título de la nueva vista para lectores de pantalla y teclado
    const heading = mainRef.current?.querySelector('h1');
    (heading ?? mainRef.current)?.focus({ preventScroll: true });
  }, [route]);

  /* ---------- Acciones ---------- */
  function handleAdd(item, maxAllowed) {
    setCart((c) => addToCart(c, item, maxAllowed));
    navigate('cart');
  }

  async function handlePay(values) {
    const status = await processPayment(values, { simulateError });
    const order = buildOrder({
      id: nextOrderId(orders),
      lines,
      buyer: { name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim() },
      method: values.method,
      status,
      guest: !session,
    });
    setOrders((prev) => [...prev, order]);
    if (status === 'rechazado') {
      navigate('failed', { orderId: order.id });
    } else {
      setCart([]); // solo se vacía si la compra se registró
      navigate('success', { orderId: order.id });
    }
  }

  async function handleSend(order) {
    await sendTicketEmail(order.buyer.email, { simulateError });
    navigate('sent', { orderId: order.id });
  }

  async function handleLogin(values) {
  const user = await loginRequest(users, values, { simulateError });
  setSession(user);
  navigate('events');
}

async function handleRegister(values) {
  const newUser = await registerRequest(users, values, { simulateError });
  setUsers((prev) => [...prev, newUser]);
  const { password: _password, ...safeUser } = newUser;
  setSession(safeUser); // la cuenta nueva entra con sesión iniciada
  navigate('events');
}

const handleRecover = (email) => recoverRequest(users, { email }, { simulateError });

  const findOrder = (id) => orders.find((o) => o.id === id);

  /* ---------- Vistas ---------- */
  function renderView() {
    const { view, params } = route;
    switch (view) {
      case 'event':
        return (
          <EventDetailPage
            key={params.id}
            catalog={catalog}
            eventId={params.id}
            orders={orders}
            onAdd={handleAdd}
            onBack={() => navigate('events')}
          />
        );
      case 'cart':
        return (
          <CartPage
            catalog={catalog}
            lines={lines}
            totals={summary}
            orders={orders}
            onQty={(l, qty) => setCart((c) => setQty(c, l.eventId, l.zoneId, qty))}
            onRemove={(l) => setCart((c) => removeFromCart(c, l.eventId, l.zoneId))}
            onClear={() => setCart([])}
            onCheckout={() => navigate('checkout')}
            onBack={() => navigate('events')}
          />
        );
      case 'checkout':
        return (
          <CheckoutPage
            key={params.method ?? 'checkout'}
            catalog={catalog}
            lines={lines}
            totals={summary}
            session={session}
            initialMethod={params.method}
            stockError={stockError}
            onPay={handlePay}
            onBack={() => navigate('events')}
            onCart={() => navigate('cart')}
          />
        );
      case 'success':
        return (
          <SuccessPage
            order={findOrder(params.orderId)}
            events={events}
            onTickets={() => navigate('tickets')}
            onEvents={() => navigate('events')}
          />
        );
      case 'failed':
        return (
          <FailedPage
            order={findOrder(params.orderId)}
            onRetry={() => navigate('checkout')}
            onChangeMethod={() => navigate('checkout', { method: 'transferencia' })}
            onEvents={() => navigate('events')}
          />
        );
      case 'tickets':
        return (
          <MyTicketsPage
            catalog={catalog}
            orders={myOrders}
            onOpen={(orderId, itemIndex) => navigate('ticket', { orderId, itemIndex })}
            onEvents={() => navigate('events')}
          />
        );
      case 'ticket':
        return (
          <TicketPage
            key={`${params.orderId}-${params.itemIndex}`}
            catalog={catalog}
            order={findOrder(params.orderId)}
            itemIndex={params.itemIndex}
            onSend={handleSend}
            onBack={() => navigate('tickets')}
          />
        );
      case 'sent':
        return (
          <SentPage
            order={findOrder(params.orderId)}
            events={events}
            onResend={(order) => sendTicketEmail(order.buyer.email, { simulateError })}
            onTickets={() => navigate('tickets')}
          />
        );
      case 'login':
        return (
          <LoginPage session={session} onLogin={handleLogin} onEvents={() => navigate('events')} onNavigate={navigate} />
        );
      case 'register':
        return (
          <RegisterPage session={session} onRegister={handleRegister} onEvents={() => navigate('events')} onNavigate={navigate} />
        );
         case 'recover':
        return <RecoverPage onRecover={handleRecover} onNavigate={navigate} />;
      case 'profile':
        return (
          <ProfilePage
            session={session}
            onLogout={() => {
              setSession(null);
              navigate('events');
            }}
            onNavigate={navigate}
          />
        );
      default:
        return (
          <EventsPage
            catalog={catalog}
            orders={orders}
            category={prefs.category}
            onCategory={(category) => setPrefs((p) => ({ ...p, category }))}
            onOpen={(id) => navigate('event', { id })}
          />
        );
    }
  }

  return (
    <>
      <a href="#main" className="skip-link">Saltar al contenido</a>
      <Navbar view={route.view} session={session} cartCount={cartCount} onNavigate={navigate} />
      <main id="main" ref={mainRef} className="main" tabIndex={-1}>
        {renderView()}
      </main>
      <Footer
        simulateErrors={prefs.simulateErrors}
        onToggleSimulate={(on) => setPrefs((p) => ({ ...p, simulateErrors: on }))}
      />
    </>
  );
}

