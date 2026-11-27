// API falsa de eventos: lectura y escritura sobre localStorage, con latencia y cancelación.
// Cada función acepta { signal, simulateError } como último argumento.
import { EVENTS } from '../data/events';
import { addEvent, removeEvent, updateEvent, updateZone } from '../utils/eventAdmin';
import { KEYS, fetchSeed, loadTable, request, saveTable } from './client';

const SAVE_ERROR = 'No pudimos guardar los cambios. Revisa tu conexión e inténtalo de nuevo.';

// Si ya hay eventos guardados (cambios del panel) se usan esos; si no, la semilla de public/api/events.json.
// A los guardados antes de existir las imágenes se les completa "image" desde la semilla.
async function table(signal) {
  const saved = loadTable(KEYS.events, null);
  if (!saved) return fetchSeed('events', EVENTS, signal);
  const images = Object.fromEntries(EVENTS.map((e) => [e.id, e.image]));
  return saved.map((e) => (e.image || !images[e.id] ? e : { ...e, image: images[e.id] }));
}

// Lectura
export async function listEvents(opts = {}) {
  await request({
    ms: 700,
    errorMessage: 'No pudimos cargar los eventos. Revisa tu conexión e inténtalo otra vez.',
    ...opts,
  });
  return table(opts.signal);
}

export async function getEvent(id, opts = {}) {
  await request({ ms: 500, ...opts });
  const event = (await table(opts.signal)).find((e) => e.id === id);
  if (!event) throw new Error('El evento no existe.');
  return event;
}

// Escritura: cada una devuelve la lista completa ya actualizada
async function mutate(change, opts) {
  await request({ ms: 800, errorMessage: SAVE_ERROR, ...opts });
  const next = change(await table(opts?.signal));
  saveTable(KEYS.events, next);
  return next;
}

export const createEvent = (values, opts) => mutate((list) => addEvent(list, values), opts);

export const editEvent = (id, values, opts) => mutate((list) => updateEvent(list, id, values), opts);

export const deleteEvent = (id, opts) => mutate((list) => removeEvent(list, id), opts);

// Zonas: precio y disponibilidad (inventario)
export const editZone = (eventId, zoneId, values, opts) =>
  mutate((list) => updateZone(list, eventId, zoneId, values), opts);
