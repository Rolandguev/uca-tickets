// Datos simulados: órdenes de ejemplo (seed:true = ya vendidas antes de abrir la app)
// Estados: 'pagado' | 'pendiente' | 'rechazado'

function order(id, buyer, status, eventId, zoneId, qty, unitPrice, createdAt) {
  const subtotal = qty * unitPrice;
  const fee = Math.round(subtotal * 0.05 * 100) / 100;
  return {
    id,
    seed: true,
    status,
    createdAt,
    method: status === 'pendiente' ? 'transferencia' : 'tarjeta',
    buyer,
    items: [{ eventId, zoneId, qty, unitPrice }],
    subtotal,
    fee,
    total: subtotal + fee,
  };
}

const MARIA = { name: 'María López', email: 'maria.lopez@correo.com', phone: '+503 7000 0000' };
const CARLOS = { name: 'Carlos Pérez', email: 'carlos.perez@correo.com', phone: '+503 7111 1111' };
const ANA = { name: 'Ana Rivas', email: 'ana.rivas@correo.com', phone: '+503 7222 2222' };
const JOSE = { name: 'José Díaz', email: 'jose.diaz@correo.com', phone: '+503 7333 3333' };

export const SEED_ORDERS = [
  order('UCA-20481', MARIA, 'pagado', 'uca-fest', 'general', 2, 25, '2026-11-02T10:15:00'),
  order('UCA-20482', MARIA, 'pagado', 'noche-de-jazz', 'general', 2, 30, '2026-11-05T16:40:00'),
  order('UCA-20483', MARIA, 'pendiente', 'rock-en-la-uca', 'vip', 2, 60, '2026-11-09T09:05:00'),
  order('UCA-20484', CARLOS, 'pagado', 'noche-de-jazz', 'vip', 1, 45, '2026-11-10T19:30:00'),
  order('UCA-20485', ANA, 'pendiente', 'rock-en-la-uca', 'general', 2, 40, '2026-11-12T12:00:00'),
  order('UCA-20486', JOSE, 'rechazado', 'uca-fest', 'general', 1, 25, '2026-11-13T21:10:00'),
];
