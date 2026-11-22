// Validaciones de contraseña (cuentas). Devuelven un mensaje de error o ''.
// strict = true (registro): mínimo 8 caracteres con letras y números.
// strict = false (inicio de sesión): solo se exige que no esté vacía.
export function validatePassword(value, strict = true) {
  if (!value) return 'Escribe tu contraseña.';
  if (!strict) return '';
  if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  return /[A-Za-z]/.test(value) && /\d/.test(value) ? '' : 'Incluye al menos una letra y un número.';
}

export function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Repite tu contraseña.';
  return password === confirm ? '' : 'Las contraseñas no coinciden.';
}
