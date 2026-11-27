// Pantallas de boletos (Persona A). Este módulo se carga de forma diferida desde purchaseRoutes.
import { useParams, useSearchParams } from 'react-router';
import TicketPage from '../pages/TicketPage';
import SentPage from '../pages/SentPage';
import VerifyPage from '../pages/VerifyPage';
import { useData } from '../context/DataContext';
import { usePrefs } from '../context/PrefsContext';
import { sendTicketEmail } from '../api/orders';
import { useGo } from './paths';
import { useOrderFromUrl } from './useOrderFromUrl';

export function TicketScreen() {
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

export function SentScreen() {
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

export function VerifyScreen() {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const { catalog, orders } = useData();
  return <VerifyPage catalog={catalog} orders={orders} code={code} signature={searchParams.get('f')} />;
}
