// API falsa de eventos: lectura y escritura sobre localStorage, con latencia y cancelación.
// Cada función acepta { signal, simulateError } como último argumento.
import { EVENTS } from '../data/events';
import { addEvent, removeEvent, updateEvent, updateZone } from '../utils/eventAdmin';
import { KEYS, loadTable, request, saveTable } from './client';

const SAVE_ERROR = 'No pudimos guardar los cambios. Revisa tu conexión e inténtalo de nuevo.';

const table = () => loadTable(KEYS.events, EVENTS);

// Lectura
export async function listEvents(opts = {}) {
  await request({
    ms: 700,
    errorMessage: 'No pudimos cargar los eventos. Revisa tu conexión e inténtalo otra vez.',
    ...opts,
  });
  return table();
}

export async function getEvent(id, opts = {}) {
  await request({ ms: 500, ...opts });
  const event = table().find((e) => e.id === id);
  if (!event) throw new Error('El evento no existe.');
  return event;
}

// Escritura: cada una devuelve la lista completa ya actualizada
async function mutate(change, opts) {
  await request({ ms: 800, errorMessage: SAVE_ERROR, ...opts });
  const next = change(table());
  saveTable(KEYS.events, next);
  return next;
}

export const createEvent = (values, opts) => mutate((list) => addEvent(list, values), opts);

export const editEvent = (id, values, opts) => mutate((list) => updateEvent(list, id, values), opts);

export const deleteEvent = (id, opts) => mutate((list) => removeEvent(list, id), opts);

// Zonas: precio y disponibilidad (inventario)
export const editZone = (eventId, zoneId, values, opts) =>
  mutate((list) => updateZone(list, eventId, zoneId, values), opts);
