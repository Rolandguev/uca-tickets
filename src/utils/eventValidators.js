// Validaciones del formulario de eventos y de inventario/precios.
// Cada función devuelve un mensaje de error o ''.

const clean = (value) => String(value ?? '').trim();

export function validateTitle(value) {
  const text = clean(value);
  if (!text) return 'Escribe el nombre del evento.';
  return text.length >= 3 ? '' : 'El nombre debe tener al menos 3 caracteres.';
}

export function validateRequired(value, message) {
  return clean(value) ? '' : message;
}

export function validateEventDate(value) {
  if (!clean(value)) return 'Elige la fecha y la hora del evento.';
  return Number.isNaN(new Date(value).getTime()) ? 'La fecha no es válida.' : '';
}

export function validatePrice(value) {
  const text = clean(value);
  if (!text) return 'Escribe el precio.';
  const n = Number(text);
  if (Number.isNaN(n)) return 'El precio debe ser un número.';
  if (n <= 0) return 'El precio debe ser mayor que 0.';
  return n > 1000 ? 'El precio no puede superar $1000.' : '';
}

export function validateStock(value) {
  const text = clean(value);
  if (!text) return 'Escribe la cantidad de boletos.';
  const n = Number(text);
  if (!Number.isInteger(n)) return 'La cantidad debe ser un número entero.';
  if (n < 0) return 'La cantidad no puede ser negativa.';
  return n > 100000 ? 'La cantidad es demasiado grande.' : '';
}
