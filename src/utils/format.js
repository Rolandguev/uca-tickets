// Utilidades de formato (dinero, fechas, texto)

const LOCALE = 'es-SV';

export function formatMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

// "Sáb 28 mar · 7:00 p. m."
export function formatDateTime(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit' });
  return `${capitalize(day.replace('.', ''))} · ${time}`;
}

// "Sábado 28 de marzo • 7:00 p. m."
export function formatLongDate(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
  const time = d.toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit' });
  return `${capitalize(day)} • ${time}`;
}

export function monthDay(iso) {
  const d = new Date(iso);
  return {
    month: d.toLocaleDateString(LOCALE, { month: 'short' }).replace('.', '').toUpperCase(),
    day: String(d.getDate()).padStart(2, '0'),
  };
}

export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function plural(n, singular, pluralForm) {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

// Quita acentos y pasa a minúsculas (para búsquedas)
export function normalize(text = '') {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
