// Lógica pura del carrito (sin React): fácil de probar y de reutilizar.
// Un item del carrito es { eventId, zoneId, qty }.

import { FEE_RATE, MAX_PER_ZONE } from '../data/events';
import { findEvent, findZone } from './events';

const round2 = (n) => Math.round(n * 100) / 100;

export function addToCart(cart, item, maxAllowed = MAX_PER_ZONE) {
  const limit = Math.min(MAX_PER_ZONE, maxAllowed);
  const existing = cart.find((c) => c.eventId === item.eventId && c.zoneId === item.zoneId);
  if (existing) {
    return cart.map((c) => (c === existing ? { ...c, qty: Math.min(limit, c.qty + item.qty) } : c));
  }
  return [...cart, { ...item, qty: Math.min(limit, item.qty) }];
}

export function setQty(cart, eventId, zoneId, qty) {
  return cart.map((c) => (c.eventId === eventId && c.zoneId === zoneId ? { ...c, qty } : c));
}

export function removeFromCart(cart, eventId, zoneId) {
  return cart.filter((c) => !(c.eventId === eventId && c.zoneId === zoneId));
}

// Une el carrito con los datos del catálogo; descarta items cuyo evento ya no existe
export function cartLines(cart, events) {
  return cart
    .map((c) => {
      const event = findEvent(events, c.eventId);
      const zone = findZone(event, c.zoneId);
      if (!event || !zone) return null;
      return { ...c, event, zone, unitPrice: zone.price, lineTotal: round2(zone.price * c.qty) };
    })
    .filter(Boolean);
}

export function totals(lines) {
  const subtotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0));
  const fee = round2(subtotal * FEE_RATE);
  return { subtotal, fee, total: round2(subtotal + fee), count: lines.reduce((s, l) => s + l.qty, 0) };
}
