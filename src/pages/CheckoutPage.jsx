import { useRef, useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import RadioOption from '../components/RadioOption';
import OrderSummary from '../components/OrderSummary';
import ProgressSteps from '../components/ProgressSteps';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import { formatMoney } from '../utils/format';
import {
  formatCardInput,
  formatExpiryInput,
  validateCardNumber,
  validateCvv,
  validateEmail,
  validateExpiry,
  validateName,
  validatePhone,
} from '../utils/validators';
import './CheckoutPage.css';

function validate(values) {
  const errors = {
    name: validateName(values.name),
    email: validateEmail(values.email),
    phone: validatePhone(values.phone),
  };
  if (values.method === 'tarjeta') {
    errors.cardName = validateName(values.cardName, 'el nombre de la tarjeta');
    errors.cardNumber = validateCardNumber(values.cardNumber);
    errors.expiry = validateExpiry(values.expiry);
    errors.cvv = validateCvv(values.cvv);
  }
  return Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
}

// Paso 3 de 4: datos del comprador y pago simulado (formulario controlado)
export default function CheckoutPage({ catalog, lines, totals, session, initialMethod, stockError, onPay, onBack, onCart }) {
  const [values, setValues] = useState({
    name: session?.name ?? '',
    email: session?.email ?? '',
    phone: session?.phone ?? '',
    method: initialMethod ?? 'tarjeta',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const sending = useRef(false); // evita el doble envío aunque se haga doble clic muy rápido
  const formRef = useRef(null);

  if (catalog.status === 'loading') return <div className="container"><Loader label="Preparando el pago…" /></div>;
  if (catalog.status === 'error') {
    return (
      <div className="container">
        <ErrorMessage title="No pudimos preparar el pago" message={catalog.error.message} onRetry={catalog.reload} />
      </div>
    );
  }
  if (lines.length === 0) {
    return (
      <div className="container container--medium">
        <header className="page-header"><h1 tabIndex={-1}>Pago</h1></header>
        <EmptyState
          icon="cart"
          title="No hay boletos para pagar"
          message="Tu carrito está vacío. Agrega boletos de algún evento para continuar."
          action={<Button onClick={onBack}>Ver eventos</Button>}
        />
      </div>
    );
  }

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors(({ [field]: _removed, ...rest }) => rest);
  }

  const bind = (field, format) => ({
    value: values[field],
    error: errors[field],
    onChange: (e) => update(field, format ? format(e.target.value) : e.target.value),
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending.current) return;

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Lleva el foco al primer campo con error
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    if (stockError) return;

    sending.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      await onPay(values);
    } catch (err) {
      setSubmitError(err.message);
      sending.current = false;
      setSubmitting(false);
    }
  }

  const isCard = values.method === 'tarjeta';

  return (
    <div className="container">
      <ProgressSteps current={3} />
      <header className="page-header">
        <h1 tabIndex={-1}>Pago</h1>
        <p>Revisa tu pedido y completa tus datos para finalizar la compra.</p>
      </header>

      <div className="checkout">
        <div className="checkout__summary">
          <OrderSummary lines={lines} totals={totals} />
          <Button variant="ghost" size="sm" onClick={onCart}>← Editar carrito</Button>
        </div>

        <Card className="checkout__form" title="Datos del comprador y pago">
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="stack">
            <Input label="Nombre completo" autoComplete="name" placeholder="Tu nombre" {...bind('name')} />
            <div className="checkout__two">
              <Input label="Correo electrónico" type="email" autoComplete="email" placeholder="tucorreo@ejemplo.com" {...bind('email')} />
              <Input label="Teléfono" type="tel" autoComplete="tel" placeholder="+503 7000 0000" {...bind('phone')} />
            </div>

            <fieldset className="checkout__methods">
              <legend>Método de pago</legend>
              <RadioOption name="method" value="tarjeta" checked={isCard} onChange={(v) => update('method', v)}>
                Tarjeta de crédito o débito
              </RadioOption>
              <RadioOption name="method" value="transferencia" checked={!isCard} onChange={(v) => update('method', v)}>
                Transferencia o efectivo
                <span className="checkout__method-note">Tu pedido queda pendiente hasta confirmar el pago.</span>
              </RadioOption>
            </fieldset>

            {isCard && (
              <>
                <Input label="Nombre en la tarjeta" autoComplete="cc-name" placeholder="Como aparece en la tarjeta" {...bind('cardName')} />
                <Input
                  label="Número de tarjeta"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  {...bind('cardNumber', formatCardInput)}
                />
                <div className="checkout__two checkout__two--always">
                  <Input label="Vencimiento" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" maxLength={5} {...bind('expiry', formatExpiryInput)} />
                  <Input
                    label="CVV"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    maxLength={4}
                    {...bind('cvv', (v) => v.replace(/\D/g, '').slice(0, 4))}
                  />
                </div>
              </>
            )}

            {stockError && <ErrorMessage title="Revisa tu carrito" message={stockError} onRetry={onCart} retryLabel="Ir al carrito" />}
            {submitError && <ErrorMessage title="No se completó el pago" message={submitError} />}

            <Button type="submit" block loading={submitting} loadingText="Procesando pago…" disabled={Boolean(stockError)}>
              {isCard ? `Pagar ${formatMoney(totals.total)}` : `Reservar pedido (${formatMoney(totals.total)})`}
            </Button>
            <p className="muted small checkout__note">
              Tu pago está protegido. Demo: las tarjetas que terminan en 0000 se rechazan; prueba con 4242 4242 4242 4242.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
