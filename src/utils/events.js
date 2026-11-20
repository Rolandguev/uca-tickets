// Valores derivados del catálogo: disponibilidad real, estado del evento, precios.
// El inventario no se guarda duplicado: se calcula a partir de las órdenes.

import { LOW_STOCK } from '../data/events';

// Boletos vendidos en esta app (las órdenes "seed" ya están descontadas del inventario inicial)
function soldIn(orders, eventId, zoneId) {
  return orders
    .filter((o) => !o.seed && o.status !== 'rechazado')
    .flatMap((o) => o.items)
    .filter((it) => it.eventId === eventId && it.zoneId === zoneId)
    .reduce((sum, it) => sum + it.qty, 0);
}

export function zoneAvailable(event, zone, orders) {
  return Math.max(0, zone.available - soldIn(orders, event.id, zone.id));
}

// 'agotado' | 'ultimos' | 'disponible'
export function eventStatus(event, orders) {
  const stock = event.zones.map((z) => zoneAvailable(event, z, orders));
  if (stock.every((n) => n === 0)) return 'agotado';
  if (stock.some((n) => n > 0 && n <= LOW_STOCK)) return 'ultimos';
  return 'disponible';
}

export function minPrice(event) {
  return Math.min(...event.zones.map((z) => z.price));
}

export function findEvent(events, id) {
  return events.find((e) => e.id === id);
}

export function findZone(event, zoneId) {
  return event?.zones.find((z) => z.id === zoneId);
}

export const STATUS_LABEL = {
  agotado: 'Agotado',
  ultimos: 'Últimos boletos',
  disponible: 'Disponible',
};

export const STATUS_TONE = {
  agotado: 'error',
  ultimos: 'warning',
  disponible: 'success',
};
