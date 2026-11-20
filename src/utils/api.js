// "API" simulada: promesas con retardo para mostrar estados de carga y error.
// Aquí iría el fetch real cuando exista un backend (tercera entrega).

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchEvents(events, { simulateError = false } = {}) {
  await wait(700);
  if (simulateError) throw new Error('No pudimos cargar los eventos. Revisa tu conexión e inténtalo otra vez.');
  return events;
}

// Pago simulado. Reglas de la demo:
//  - tarjeta que termina en 0000  -> rechazada por el banco
//  - transferencia / efectivo      -> queda pendiente
//  - "simular errores" activado    -> falla la red (se lanza un error)
export async function processPayment({ method, cardNumber }, { simulateError = false } = {}) {
  await wait(1500);
  if (simulateError) throw new Error('No pudimos comunicarnos con el servicio de pagos. Inténtalo de nuevo.');
  if (method === 'transferencia') return 'pendiente';
  return cardNumber.replace(/\s/g, '').endsWith('0000') ? 'rechazado' : 'pagado';
}

export async function sendTicketEmail(_email, { simulateError = false } = {}) {
  await wait(1000);
  if (simulateError) throw new Error('No pudimos enviar el correo. Inténtalo de nuevo.');
  return true;
}
