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


/* ---------- Reportes (solo órdenes pagadas, sin contar el cargo por servicio) ---------- */

const ticketRevenue = (item) => item.qty * item.unitPrice;

// Boletos e ingresos por evento, de mayor a menor ingreso (solo eventos con ventas)
export function salesByEvent(orders, events) {
  const items = orders.filter(isPaid).flatMap((o) => o.items);
  return events
    .map((event) => {
      const own = items.filter((item) => item.eventId === event.id);
      return {
        id: event.id,
        label: event.title,
        tickets: own.reduce((n, item) => n + item.qty, 0),
        revenue: own.reduce((sum, item) => sum + ticketRevenue(item), 0),
      };
    })
    .filter((row) => row.tickets > 0)
    .sort((a, b) => b.revenue - a.revenue);
}

// Ingresos por día (formato AAAA-MM-DD), en orden cronológico
export function salesByDay(orders) {
  const byDay = new Map();
  orders.filter(isPaid).forEach((order) => {
    const day = order.createdAt.slice(0, 10);
    const revenue = order.items.reduce((sum, item) => sum + ticketRevenue(item), 0);
    byDay.set(day, (byDay.get(day) ?? 0) + revenue);
  });
  return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, revenue]) => ({ day, revenue }));
}

// Cantidad de órdenes por estado
export function ordersByStatus(orders) {
  return ['pagado', 'pendiente', 'rechazado'].map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }));
}

// Filtra las órdenes por evento y por periodo (fechas AAAA-MM-DD, ambas incluidas).
// Con un evento elegido, cada orden conserva solo los boletos de ese evento.
export function filterOrders(orders, { eventId = '', from = '', to = '' } = {}) {
  return orders
    .filter((order) => {
      const day = order.createdAt.slice(0, 10);
      return (!from || day >= from) && (!to || day <= to);
    })
    .map((order) => (eventId ? { ...order, items: order.items.filter((item) => item.eventId === eventId) } : order))
    .filter((order) => order.items.length > 0);
}