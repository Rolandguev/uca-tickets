// Roles que pueden entrar a las secciones de administración (control de acceso simulado)
export const ADMIN_ROLES = ['Administrador', 'Organizador'];

export const hasAccess = (session, roles) => Boolean(session) && roles.includes(session.role);

// Solo el Administrador gestiona usuarios
export const USER_ADMIN_ROLES = ['Administrador'];

// Color del Badge de cada rol
export const ROLE_TONE = { Cliente: 'neutral', Organizador: 'warning', Administrador: 'primary' };