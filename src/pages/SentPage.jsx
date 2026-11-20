import { useState } from 'react';
import Button from '../components/Button';
import DetailRows from '../components/DetailRows';
import EmptyState from '../components/EmptyState';
import StatusScreen from '../components/StatusScreen';
import { orderEventsText } from './SuccessPage';
import './ResultPages.css';

export default function SentPage({ order, events, onResend, onTickets }) {
  const [state, setState] = useState({ status: 'idle', message: '' });

  if (!order) {
    return (
      <div className="container container--narrow">
        <EmptyState title="No encontramos este pedido" action={<Button onClick={onTickets}>Volver a mis boletos</Button>} />
      </div>
    );
  }

  async function resend() {
    setState({ status: 'loading', message: '' });
    try {
      await onResend(order);
      setState({ status: 'ok', message: `Listo, reenviamos el correo a ${order.buyer.email}.` });
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  return (
    <div className="container container--narrow result">
      <StatusScreen
        tone="primary"
        icon="mail"
        title="Boleto enviado"
        message="Enviamos tu boleto con el código QR a tu correo. Si no lo ves, revisa la carpeta de spam."
      />
      <DetailRows
        items={[
          { label: 'Correo', value: order.buyer.email },
          { label: 'Asunto', value: `Tu boleto para ${orderEventsText(order, events)}` },
          { label: 'Adjunto', value: `boletos-${order.id}.png` },
        ]}
      />
      <div className="result__actions">
        <Button block onClick={onTickets}>Volver a mis boletos</Button>
        <Button block variant="secondary" onClick={resend} loading={state.status === 'loading'} loadingText="Reenviando…">
          Reenviar correo
        </Button>
        <p
          className={`small result__status ${state.status === 'error' ? 'is-error' : ''}`}
          role={state.status === 'error' ? 'alert' : 'status'}
        >
          {state.message}
        </p>
      </div>
    </div>
  );
}
