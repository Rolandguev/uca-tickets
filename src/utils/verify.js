// Verificación de boletos (simulada, sin servidor).
// Cada boleto lleva una firma corta calculada con sus datos (orden, evento, zona, fila y asiento).
// El QR codifica la URL /verificar/<código>?f=<firma>: si alguien cambia el código o los datos,
// la firma deja de coincidir y el boleto aparece como no válido.
import { ticketsOf } from './tickets';

const SECRET = 'uca-tickets-demo'; // valor de demostración: en un sistema real la firma se hace en el servidor

// FNV-1a de 32 bits -> 8 caracteres hexadecimales
function fnv1a(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0').toUpperCase();
}

export function ticketSignature(order, item, ticket) {
  return fnv1a([SECRET, order.id, item.eventId, item.zoneId, ticket.code, ticket.row, ticket.seat].join('|'));
}

// URL completa que va dentro del QR (incluye el "base" de GitHub Pages)
export function verifyUrl(ticket, signature) {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
  return `${base}verificar/${encodeURIComponent(ticket.code)}?f=${signature}`;
}

// Busca el boleto por su código y comprueba la firma.
// Resultado: { result: 'valido' | 'pendiente' | 'firma' | 'rechazado' | 'no-existe', order, item, ticket }
export function verifyTicket(orders, code, signature) {
  const orderId = code.slice(0, code.lastIndexOf('-'));
  const order = orders.find((o) => o.id === orderId);
  if (!order) return { result: 'no-existe' };

  for (const [itemIndex, item] of order.items.entries()) {
    const ticket = ticketsOf(order, itemIndex).find((t) => t.code === code);
    if (!ticket) continue;
    const found = { order, item, ticket };
    if (ticketSignature(order, item, ticket) !== signature) return { result: 'firma', ...found };
    if (order.status === 'rechazado') return { result: 'rechazado', ...found };
    if (order.status === 'pendiente') return { result: 'pendiente', ...found };
    return { result: 'valido', ...found };
  }
  return { result: 'no-existe' };
}
