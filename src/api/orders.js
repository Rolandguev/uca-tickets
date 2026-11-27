// API falsa de órdenes, pagos y correo de boletos. Las órdenes viven en localStorage.
import { SEED_ORDERS } from '../data/orders';
import { KEYS, loadTable, request, saveTable } from './client';

const table = () => loadTable(KEYS.orders, SEED_ORDERS);

export async function listOrders(opts = {}) {
  await request({
    ms: 600,
    errorMessage: 'No pudimos cargar las órdenes. Inténtalo de nuevo.',
    ...opts,
  });
  return table();
}

// Guarda una orden nueva y devuelve la lista completa
export async function createOrder(order, opts = {}) {
  await request({
    ms: 500,
    errorMessage: 'No pudimos guardar tu orden. Inténtalo de nuevo.',
    ...opts,
  });
  const next = [...table(), order];
  saveTable(KEYS.orders, next);
  return next;
}

// Pago simulado. Reglas de la demostración:
//  - tarjeta que termina en 0000  -> rechazada por el banco
//  - transferencia                -> queda pendiente
//  - "simular errores" activado   -> falla la red
export async function processPayment({ method, cardNumber }, opts = {}) {
  await request({
    ms: 1500,
    errorMessage: 'No pudimos comunicarnos con el servicio de pagos. Inténtalo de nuevo.',
    ...opts,
  });
  if (method === 'transferencia') return 'pendiente';
  return cardNumber.replace(/\s/g, '').endsWith('0000') ? 'rechazado' : 'pagado';
}

// Envío del correo con los boletos: no se envía nada real, solo se simula la confirmación
export async function sendTicketEmail(_email, opts = {}) {
  await request({
    ms: 1000,
    errorMessage: 'No pudimos enviar el correo. Inténtalo de nuevo.',
    ...opts,
  });
  return true;
}