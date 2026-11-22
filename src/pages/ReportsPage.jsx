import AccessDenied from '../components/AccessDenied';
import BarChart from '../components/BarChart';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import { ordersByStatus, salesByDay, salesByEvent } from '../utils/adminStats';
import { formatMoney, monthDay, plural } from '../utils/format';
import { ADMIN_ROLES, hasAccess } from '../utils/roles';
import { ORDER_LABEL } from '../utils/tickets';
import './ReportsPage.css';

// "2026-11-02" -> "02 NOV"
function dayLabel(isoDay) {
  const { day, month } = monthDay(`${isoDay}T00:00:00`);
  return `${day} ${month}`;
}

// Reportes y analítica: tarjetas y gráficos de ventas (solo Administrador y Organizador)
export default function ReportsPage({ session, catalog, orders, onNavigate }) {
  // 1) Control de acceso por rol (simulado)
  if (!hasAccess(session, ADMIN_ROLES)) {
    return <AccessDenied session={session} roles={ADMIN_ROLES} onNavigate={onNavigate} />;
  }

  // 2) Estados de carga y error del catálogo (operación simulada)
  if (catalog.status === 'loading') {
    return <div className="container"><Loader label="Preparando los reportes…" /></div>;
  }
  if (catalog.status === 'error') {
    return (
      <div className="container">
        <ErrorMessage title="No pudimos cargar los reportes" message={catalog.error.message} onRetry={catalog.reload} />
      </div>
    );
  }

  // 3) Datos derivados (se calculan desde las órdenes, no se guardan)
  const byEvent = salesByEvent(orders, catalog.data);
  const byDay = salesByDay(orders);
  const byStatus = ordersByStatus(orders);
  const totalRevenue = byEvent.reduce((sum, row) => sum + row.revenue, 0);
  const totalTickets = byEvent.reduce((sum, row) => sum + row.tickets, 0);
  const top = byEvent[0];

  return (
    <div className="container">
      <header className="page-header">
        <h1 tabIndex={-1}>Reportes y analítica</h1>
        <p>Ventas por evento, por día y estado de las órdenes.</p>
      </header>

      <section className="reports__stats" aria-label="Resumen de ventas">
        <StatCard label="Ingresos por boletos" value={formatMoney(totalRevenue)} hint="De órdenes pagadas" />
        <StatCard label="Boletos vendidos" value={totalTickets} hint="De órdenes pagadas" />
        <StatCard
          label="Evento con más ingresos"
          value={top ? top.label : '—'}
          hint={top ? `${formatMoney(top.revenue)} en ${plural(top.tickets, 'boleto', 'boletos')}` : 'Todavía no hay ventas'}
        />
      </section>

      <p className="muted small reports__note">
        Los ingresos de estos reportes no incluyen el cargo por servicio, por eso pueden ser menores que las ventas del panel.
      </p>

      <div className="reports__charts">
        <BarChart
          title="Ingresos por evento"
          data={byEvent.map((row) => ({ key: row.id, label: row.label, value: row.revenue }))}
          format={formatMoney}
        />
        <BarChart
          title="Ingresos por día"
          data={byDay.map((row) => ({ key: row.day, label: dayLabel(row.day), value: row.revenue }))}
          format={formatMoney}
        />
        <BarChart
          title="Órdenes por estado"
          data={byStatus.map((row) => ({ key: row.status, label: ORDER_LABEL[row.status], value: row.count }))}
          format={(n) => plural(n, 'orden', 'órdenes')}
        />
      </div>
    </div>
  );
}
