// Cuentas de la Persona B: 
// los usuarios de users.js con contraseña ficticia (solo demostración, sin backend).

import { USERS } from './users';

export const ACCOUNTS = USERS.map((user) => ({ ...user, password: 'Demo1234' }));
