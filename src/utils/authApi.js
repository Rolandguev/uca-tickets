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

