// Operaciones de administración sobre la lista de eventos.
// Son funciones puras: reciben la lista y devuelven una lista nueva (no modifican la original).

import { CATEGORIES } from '../data/events';
import { normalize } from './format';

// Todo evento nuevo empieza con las 3 zonas del catálogo; sus precios y cantidades se ajustan en "Inventario y precios"
const DEFAULT_ZONES = [
  { id: 'ultra-vip', name: 'Ultra VIP', price: 60, available: 100 },
  { id: 'vip', name: 'VIP', price: 40, available: 300 },
  { id: 'general', name: 'General', price: 25, available: 800 },
];

// Colores del afiche (EventPoster) para eventos nuevos
const PALETTES = [
  ['#1e1b4b', '#7c3aed'],
  ['#831843', '#ec4899'],
  ['#064e3b', '#10b981'],
  ['#7c2d12', '#f59e0b'],
];

export function emptyEventForm() {
  return { title: '', artist: '', category: CATEGORIES[0], date: '', venue: '', city: '', description: '' };
}

export function eventToForm(event) {
  return {
    title: event.title,
    artist: event.artist,
    category: event.category,
    date: event.date.slice(0, 16), // el campo datetime-local usa AAAA-MM-DDTHH:mm
    venue: event.venue,
    city: event.city,
    description: event.description,
  };
}

// "Noche de Jazz" -> "noche-de-jazz" (y si ya existe, "noche-de-jazz-2")
function newEventId(title, events) {
  const base = normalize(title).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'evento';
  let id = base;
  let n = 2;
  while (events.some((e) => e.id === id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

function cleanValues(values) {
  return {
    title: values.title.trim(),
    artist: values.artist.trim() || values.title.trim(),
    category: values.category,
    date: values.date,
    venue: values.venue.trim(),
    city: values.city.trim(),
    description: values.description.trim(),
  };
}

export function addEvent(events, values) {
  const event = {
    id: newEventId(values.title, events),
    ...cleanValues(values),
    palette: PALETTES[events.length % PALETTES.length],
    zones: DEFAULT_ZONES.map((zone) => ({ ...zone })),
  };
  return [...events, event];
}

// Cambia los datos del evento sin tocar sus zonas
export function updateEvent(events, id, values) {
  return events.map((e) => (e.id === id ? { ...e, ...cleanValues(values) } : e));
}

// Cambia el precio y la cantidad inicial de una zona
export function updateZone(events, eventId, zoneId, { price, available }) {
  return events.map((e) =>
    e.id !== eventId
      ? e
      : {
          ...e,
          zones: e.zones.map((z) => (z.id === zoneId ? { ...z, price: Number(price), available: Number(available) } : z)),
        },
  );
}

export function removeEvent(events, id) {
  return events.filter((e) => e.id !== id);
}

// Un evento con órdenes no se puede eliminar: se perdería el historial de boletos
export function eventHasOrders(orders, eventId) {
  return orders.some((o) => o.items.some((item) => item.eventId === eventId));
}
