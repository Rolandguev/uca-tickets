// Base de la API falsa: latencia simulada, cancelación con AbortController
// y "base de datos" en localStorage. No hay backend: todo ocurre en el navegador.
import { readStorage, writeStorage } from '../utils/storage';

// Espera "ms" milisegundos. Si la petición se cancela (signal.abort()), se rechaza
// al instante con un AbortError y se limpia el temporizador.
export function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Petición cancelada', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(new DOMException('Petición cancelada', 'AbortError'));
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

// ¿El error es solo una cancelación? (no es un fallo real).
export const isAbort = (error) => error?.name === 'AbortError';

// Simula una petición: espera la latencia y, si el modo "simular errores" está activo, falla.
export async function request({ ms = 700, signal, simulateError = false, errorMessage } = {}) {
  await delay(ms, signal);
  if (simulateError) {
    throw new Error(errorMessage ?? 'No pudimos comunicarnos con el servidor. Inténtalo de nuevo.');
  }
}

// Semillas de la API en public/api/<nombre>.json (las genera scripts/export-api.mjs antes de dev/build).
// Se piden con fetch: así el service worker las guarda en caché (NetworkFirst) y funcionan sin conexión.
// Si el archivo no responde y no está en caché, se usa el respaldo (los datos de src/data).
export async function fetchSeed(name, fallback, signal) {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}api/${name}.json`, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    if (isAbort(error)) throw error;
    return fallback;
  }
}

// "Tablas" guardadas en localStorage. Si no hay nada guardado se usa la semilla (seed).
export function loadTable(key, seed) {
  return readStorage(key, seed);
}

export function saveTable(key, rows) {
  writeStorage(key, rows);
}

// Claves de localStorage (las mismas que ya usaba la app, así no se pierden datos guardados)
export const KEYS = {
  events: 'uca.events',
  orders: 'uca.orders',
  users: 'uca.users',
};
