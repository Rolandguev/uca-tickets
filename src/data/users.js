// Datos simulados: usuarios con roles (cliente, organizador, administrador)

export const USERS = [
  { id: 'u1', name: 'María López', email: 'maria.lopez@correo.com', phone: '+503 7000 0000', role: 'Cliente', active: true },
  { id: 'u2', name: 'Carlos Pérez', email: 'carlos.perez@correo.com', phone: '+503 7111 1111', role: 'Organizador', active: true },
  { id: 'u3', name: 'Ana Rivas', email: 'ana.rivas@correo.com', phone: '+503 7222 2222', role: 'Administrador', active: true },
  { id: 'u4', name: 'José Díaz', email: 'jose.diaz@correo.com', phone: '+503 7333 3333', role: 'Cliente', active: false },
];

// Usuario que se usa como "sesión de prueba" mientras no exista login real
export const DEMO_USER = USERS[0];
