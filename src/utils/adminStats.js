// Cuentas del panel de administración. Todo se calcula a partir de órdenes, eventos y usuarios:
// no se guarda ninguna cifra duplicada.

import { eventStatus } from './events';

const isPaid = (order) => order.status === 'pagado';
const countTickets = (order) => order.items.reduce((n, item) => n + item.qty, 0);

export function dashboardStats(orders, events, users) {
  const paid = orders.filter(isPaid);
  return {
    revenue: paid.reduce((sum, o) => sum + o.total, 0),
    ticketsSold: paid.reduce((sum, o) => sum + countTickets(o), 0),
    pendingOrders: orders.filter((o) => o.status === 'pendiente').length,
    totalEvents: events.length,
    soldOutEvents: events.filter((e) => eventStatus(e, orders) === 'agotado').length,
    activeUsers: users.filter((u) => u.active).length,
    totalUsers: users.length,
  };
}

// Las órdenes más recientes primero
export function recentOrders(orders, limit = 5) {
  return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
}
