import Badge from '../components/Badge';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import { dashboardStats, recentOrders } from '../utils/adminStats';
import { formatDateTime, formatMoney, plural } from '../utils/format';
import { ORDER_LABEL, ORDER_TONE } from '../utils/tickets';
import './AdminPage.css';

const ALLOWED_ROLES = ['Administrador', 'Organizador'];

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
  if (!session) {
    return (
      <div className="container container--narrow">
        <EmptyState
          title="Inicia sesión para entrar al panel"
          message="El panel de administración es solo para cuentas con rol de Administrador u Organizador."
          action={<Button onClick={() => onNavigate('login')}>Iniciar sesión</Button>}
        />
      </div>
    );
  }
  if (!ALLOWED_ROLES.includes(session.role)) {
    return (
      <div className="container container--narrow">
        <EmptyState
          title="No tienes acceso a esta sección"
          message={`Tu cuenta tiene el rol ${session.role}. El panel es solo para Administrador y Organizador.`}
          action={<Button onClick={() => onNavigate('events')}>Ver eventos</Button>}
        />
      </div>
    );
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