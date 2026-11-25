import { useCallback } from 'react';
import { useNavigate } from 'react-router';

// Mapa de vistas -> URL. Las páginas siguen llamando onNavigate('admin'), onNavigate('event', {id})...
// y aquí se traduce a la ruta real. Así no hubo que reescribir cada página al pasar a React Router.
export function pathFor(view, params = {}) {
  const enc = encodeURIComponent;
  switch (view) {
    case 'home': return '/';
    case 'events': return '/eventos';
    case 'event': return `/eventos/${enc(params.id)}`;
    case 'cart': return '/carrito';
    case 'checkout': return params.method ? `/checkout?metodo=${enc(params.method)}` : '/checkout';
    case 'success': return `/checkout/confirmacion/${enc(params.orderId)}`;
    case 'failed': return `/checkout/rechazado/${enc(params.orderId)}`;
    case 'tickets': return '/boletos';
    case 'ticket': return `/boletos/${enc(params.orderId)}/${params.itemIndex ?? 0}`;
    case 'sent': return `/boletos/enviado/${enc(params.orderId)}`;
    case 'login': return '/login';
    case 'register': return '/registro';
    case 'recover': return '/recuperar';
    case 'profile': return '/perfil';
    case 'admin': return '/admin';
    case 'adminEvents': return '/admin/eventos';
    case 'adminInventory': return '/admin/inventario';
    case 'adminUsers': return '/admin/usuarios';
    case 'reports': return '/admin/reportes';
    default: return '/';
  }
}

// Vista del panel según la URL (para marcar el botón activo de AdminNav)
const ADMIN_PATHS = {
  '/admin': 'admin',
  '/admin/eventos': 'adminEvents',
  '/admin/inventario': 'adminInventory',
  '/admin/usuarios': 'adminUsers',
  '/admin/reportes': 'reports',
};
export const adminViewFromPath = (pathname) => ADMIN_PATHS[pathname.replace(/\/+$/, '')] ?? null;

// Hook: devuelve una función go(view, params) que navega con React Router
export function useGo() {
  const navigate = useNavigate();
  return useCallback((view, params) => navigate(pathFor(view, params)), [navigate]);
}
