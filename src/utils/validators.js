// Validaciones de formularios. Cada función devuelve un mensaje de error o ''.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateName(value, label = 'tu nombre') {
  return value.trim().length >= 3 ? '' : `Escribe ${label} completo.`;
}

export function validateEmail(value) {
  if (!value.trim()) return 'Escribe tu correo electrónico.';
  return EMAIL_RE.test(value.trim()) ? '' : 'Revisa el formato, por ejemplo nombre@correo.com.';
}

export function validatePhone(value) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'Escribe tu teléfono.';
  return digits.length >= 8 ? '' : 'El teléfono debe tener al menos 8 dígitos.';
}

// Algoritmo de Luhn para tarjetas
function luhn(digits) {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function validateCardNumber(value) {
  const digits = value.replace(/\s/g, '');
  if (!digits) return 'Escribe el número de tu tarjeta.';
  if (!/^\d{16}$/.test(digits)) return 'El número debe tener 16 dígitos.';
  return luhn(digits) ? '' : 'El número de tarjeta no es válido.';
}

export function validateExpiry(value, now = new Date()) {
  if (!value) return 'Escribe el vencimiento.';
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return 'Usa el formato MM/AA.';
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return 'El mes debe estar entre 01 y 12.';
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth >= now ? '' : 'La tarjeta está vencida.';
}

export function validateCvv(value) {
  if (!value) return 'Escribe el CVV.';
  return /^\d{3,4}$/.test(value) ? '' : 'El CVV tiene 3 o 4 dígitos.';
}

/* ---- Formateo mientras se escribe ---- */
export function formatCardInput(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

export function formatExpiryInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}
