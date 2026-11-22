import AccessDenied from '../components/AccessDenied';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import { dashboardStats, recentOrders } from '../utils/adminStats';
import { formatDateTime, formatMoney, plural } from '../utils/format';
import { ADMIN_ROLES, hasAccess } from '../utils/roles';
import { ORDER_LABEL, ORDER_TONE } from '../utils/tickets';
import Button from '../components/Button';
import './AdminPage.css';

const ORDER_COLUMNS = [
  { key: 'id', label: 'Orden' },
  { key: 'buyer', label: 'Comprador', render: (o) => o.buyer.name },
  { key: 'tickets', label: 'Boletos', render: (o) => o.items.reduce((n, item) => n + item.qty, 0) },
  { key: 'total', label: 'Total', align: 'right', render: (o) => formatMoney(o.total) },
  { key: 'status', label: 'Estado', render: (o) => <Badge tone={ORDER_TONE[o.status]}>{ORDER_LABEL[o.status]}</Badge> },
  { key: 'date', label: 'Fecha', render: (o) => formatDateTime(o.createdAt) },
];

// Dashboard de administración: métricas y órdenes recientes (solo Administrador y Organizador)
export default function AdminPage({ session, catalog, orders, users, onNavigate }) {
  // 1) Control de acceso por rol (simulado)
  if (!hasAccess(session, ADMIN_ROLES)) {
    return <AccessDenied session={session} roles={ADMIN_ROLES} onNavigate={onNavigate} />;
  }

  // 2) Estados de carga y error del catálogo (operación simulada)
  if (catalog.status === 'loading') {
    return <div className="container"><Loader label="Cargando el panel…" /></div>;
  }
  if (catalog.status === 'error') {
    return (
      <div className="container">
        <ErrorMessage title="No pudimos cargar el panel" message={catalog.error.message} onRetry={catalog.reload} />
      </div>
    );
  }

  // 3) Contenido
  const stats = dashboardStats(orders, catalog.data, users);

  return (
    <div className="container">
      <header className="page-header">
        <h1 tabIndex={-1}>Panel de administración</h1>
        <p>Resumen de ventas, eventos y usuarios.</p>
        <Button variant="secondary" size="sm" onClick={() => onNavigate('reports')}>Ver reportes</Button>
      </header>
      <section className="admin__stats" aria-label="Resumen">
        <StatCard label="Ventas pagadas" value={formatMoney(stats.revenue)} hint="Órdenes con pago confirmado" />
        <StatCard label="Boletos vendidos" value={stats.ticketsSold} hint="De órdenes pagadas" />
        <StatCard label="Órdenes pendientes" value={stats.pendingOrders} hint="Esperando confirmación de pago" />
        <StatCard
          label="Eventos"
          value={stats.totalEvents}
          hint={plural(stats.soldOutEvents, 'agotado', 'agotados')}
        />
        <StatCard
          label="Usuarios activos"
          value={stats.activeUsers}
          hint={`De ${plural(stats.totalUsers, 'registrado', 'registrados')}`}
        />
      </section>

      <section className="admin__section" aria-labelledby="recent-orders">
        <h2 id="recent-orders">Órdenes recientes</h2>
        <DataTable
          caption="Órdenes recientes"
          columns={ORDER_COLUMNS}
          rows={recentOrders(orders, 6)}
          rowKey={(o) => o.id}
          emptyText="Todavía no hay órdenes."
        />
      </section>
    </div>
  );
}
