// API falsa de usuarios y sesión. Los usuarios viven en localStorage.
// Las contraseñas de demostración son datos de prueba, no reales (ver README).
import { ACCOUNTS } from '../data/accounts';
import { KEYS, loadTable, request, saveTable } from './client';

const table = () => loadTable(KEYS.users, ACCOUNTS);

const withoutPassword = ({ password: _password, ...user }) => user;

// Lista de usuarios (sin contraseñas)
export async function listUsers(opts = {}) {
  await request({
    ms: 600,
    errorMessage: 'No pudimos cargar los usuarios. Inténtalo de nuevo.',
    ...opts,
  });
  return table().map(withoutPassword);
}

// Inicio de sesión: devuelve el usuario sin contraseña o lanza un error claro
export async function login({ email, password }, opts = {}) {
  await request({ ms: 900, ...opts });
  const user = table().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) {
    throw new Error('Correo o contraseña incorrectos. Revisa tus datos e inténtalo otra vez.');
  }
  if (!user.active) throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
  return withoutPassword(user);
}

// Registro: crea un usuario con rol Cliente. Si el correo ya existe, el error apunta al campo "email".
export async function register({ name, email, phone, password }, opts = {}) {
  await request({ ms: 1000, ...opts });
  const users = table();
  if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    const error = new Error('Ya existe una cuenta con este correo. Inicia sesión o usa otro correo.');
    error.field = 'email';
    throw error;
  }
  const user = {
    id: `u${users.length + 1}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    role: 'Cliente',
    password,
    active: true,
  };
  saveTable(KEYS.users, [...users, user]);
  return withoutPassword(user);
}

// Recuperar contraseña: no envía correo real y responde igual exista o no la cuenta
export async function recover(_email, opts = {}) {
  await request({
    ms: 1000,
    errorMessage: 'No pudimos enviar las instrucciones. Inténtalo de nuevo.',
    ...opts,
  });
  return true;
}

// Activar o desactivar una cuenta (panel de administración). Devuelve la lista actualizada.
export async function toggleUser(id, opts = {}) {
  await request({
    ms: 800,
    errorMessage: 'No pudimos guardar los cambios. Revisa tu conexión e inténtalo de nuevo.',
    ...opts,
  });
  const next = table().map((u) => (u.id === id ? { ...u, active: !u.active } : u));
  saveTable(KEYS.users, next);
  return next.map(withoutPassword);
}
