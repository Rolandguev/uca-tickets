// Órdenes y boletos: ids, boletos individuales y agrupación para "Mis boletos".

import { totals } from './cart';

export function nextOrderId(orders) {
  const max = orders.reduce((m, o) => Math.max(m, Number(o.id.split('-')[1]) || 0), 20480);
  return `UCA-${max + 1}`;
}

export function buildOrder({ id, lines, buyer, method, status, guest }) {
  const t = totals(lines);
  return {
    id,
    status,
    method,
    guest,
    createdAt: new Date().toISOString(),
    buyer,
    items: lines.map((l) => ({ eventId: l.eventId, zoneId: l.zoneId, qty: l.qty, unitPrice: l.unitPrice })),
    subtotal: t.subtotal,
    fee: t.fee,
    total: t.total,
  };
}

// Pequeño hash determinista para asignar fila y asiento (simulado)
function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

// Boletos individuales de un item de la orden
export function ticketsOf(order, itemIndex) {
  const item = order.items[itemIndex];
  return Array.from({ length: item.qty }, (_, i) => {
    const code = `${order.id}-${String(itemIndex * 10 + i + 1).padStart(4, '0')}`;
    const h = hash(code);
    return { code, row: 'ABCDEFGH'[h % 8], seat: 1 + ((h >> 3) % 30) };
  });
}

// Lista plana de grupos (orden + item) que el usuario ve en "Mis boletos"
export function ticketGroups(orders, events) {
  return orders
    .filter((o) => o.status !== 'rechazado')
    .flatMap((order) =>
      order.items.map((item, itemIndex) => ({
        key: `${order.id}-${itemIndex}`,
        order,
        item,
        itemIndex,
        event: events.find((e) => e.id === item.eventId),
      })),
    )
    .filter((g) => g.event)
    .sort((a, b) => new Date(a.event.date) - new Date(b.event.date));
}

export const ORDER_LABEL = { pagado: 'Pagado', pendiente: 'Pendiente', rechazado: 'Rechazado' };
export const ORDER_TONE = { pagado: 'success', pendiente: 'warning', rechazado: 'error' };
export const TICKET_LABEL = { pagado: 'Válido', pendiente: 'Pendiente' };
