// "API" simulada de cuentas (misma idea que api.js)

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Inicio de sesión simulado. Devuelve el usuario SIN la contraseña.
// Falla con un mensaje claro si las credenciales no coinciden, la cuenta está desactivada
// o (modo demostración) si "simular errores" está activado.
export async function loginRequest(users, { email, password }, { simulateError = false } = {}) {
  await wait(900);
  if (simulateError) throw new Error('No pudimos comunicarnos con el servidor. Inténtalo de nuevo.');
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) {
    throw new Error('Correo o contraseña incorrectos. Revisa tus datos e inténtalo otra vez.');
  }
  if (!user.active) throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

// Registro simulado. Crea un usuario con rol Cliente y lo devuelve (sin guardarlo todavía).
// Si el correo ya existe falla con un error asociado al campo "email".
export async function registerRequest(users, { name, email, phone, password }, { simulateError = false } = {}) {
  await wait(1000);
  if (simulateError) throw new Error('No pudimos comunicarnos con el servidor. Inténtalo de nuevo.');
  if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    const error = new Error('Ya existe una cuenta con este correo. Inicia sesión o usa otro correo.');
    error.field = 'email';
    throw error;
  }
  return {
    id: `u${users.length + 1}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    role: 'Cliente',
    password,
    active: true,
  };
}

// Recuperación de contraseña simulada. No se envía ningún correo real.
// Siempre responde igual exista o no la cuenta, para no revelar qué correos están registrados.
export async function recoverRequest(_users, { email: _email }, { simulateError = false } = {}) {
  await wait(1000);
  if (simulateError) throw new Error('No pudimos enviar las instrucciones. Inténtalo de nuevo.');
  return true;
}
