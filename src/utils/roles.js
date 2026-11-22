// Roles que pueden entrar a las secciones de administración (control de acceso simulado)
export const ADMIN_ROLES = ['Administrador', 'Organizador'];

export const hasAccess = (session, roles) => Boolean(session) && roles.includes(session.role);
