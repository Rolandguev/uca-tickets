import { useState } from 'react';
import AccessDenied from '../components/AccessDenied';
import BarChart from '../components/BarChart';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import Input from '../components/Input';
import Loader from '../components/Loader';
import SelectField from '../components/SelectField';
import StatCard from '../components/StatCard';
import { filterOrders, ordersByStatus, salesByDay, salesByEvent } from '../utils/adminStats';
import { formatMoney, monthDay, plural } from '../utils/format';
import { USER_ADMIN_ROLES, hasAccess } from '../utils/roles';
import { ORDER_LABEL } from '../utils/tickets';
import './ReportsPage.css';

const ALL = 'Todos los eventos';

// "2026-11-02" -> "02 NOV"
function dayLabel(isoDay) {
  const { day, month } = monthDay(`${isoDay}T00:00:00`);
  return `${day} ${month}`;
}

// Reportes y analítica por evento y por periodo (solo Administrador)
export default function ReportsPage({ session, catalog, orders, onNavigate }) {
  // Filtros (los hooks van antes de cualquier "return" anticipado)
  const [eventTitle, setEventTitle] = useState(ALL);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // 1) Control de acceso por rol (simulado)
  if (!hasAccess(session, USER_ADMIN_ROLES)) {
    return <AccessDenied session={session} roles={USER_ADMIN_ROLES} onNavigate={onNavigate} />;
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

  // 3) Filtros y datos derivados (se calculan desde las órdenes, no se guardan)
  const selected = catalog.data.find((event) => event.title === eventTitle);
  const rangeError = from && to && from > to ? 'La fecha inicial debe ser anterior a la final.' : undefined;
  const filtered = rangeError ? [] : filterOrders(orders, { eventId: selected?.id ?? '', from, to });
  const hasFilters = eventTitle !== ALL || from || to;

  const byEvent = salesByEvent(filtered, catalog.data);
  const byDay = salesByDay(filtered);
  const byStatus = ordersByStatus(filtered);
  const totalRevenue = byEvent.reduce((sum, row) => sum + row.revenue, 0);
  const totalTickets = byEvent.reduce((sum, row) => sum + row.tickets, 0);
  const top = byEvent[0];

  function clearFilters() {
    setEventTitle(ALL);
    setFrom('');
    setTo('');
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1 tabIndex={-1}>Reportes y analítica</h1>
        <p>Ventas por evento, por día y estado de las órdenes. Puedes filtrar por evento y por periodo.</p>
      </header>

      <form className="reports__filters" aria-label="Filtros del reporte" onSubmit={(e) => e.preventDefault()}>
        <SelectField
          label="Evento"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          options={[ALL, ...catalog.data.map((event) => event.title)]}
        />
        <Input label="Desde" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
        <Input label="Hasta" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} error={rangeError} />
        <div className="reports__clear">
          <Button type="button" variant="secondary" onClick={clearFilters} disabled={!hasFilters}>
            Limpiar filtros
          </Button>
        </div>
      </form>

      <p className="muted small reports__note" role="status">
        {hasFilters
          ? `Mostrando ${plural(filtered.length, 'orden', 'órdenes')} del filtro elegido.`
          : 'Mostrando todas las órdenes.'}{' '}
        Los ingresos no incluyen el cargo por servicio, por eso pueden ser menores que las ventas del panel.
      </p>

      <section className="reports__stats" aria-label="Resumen de ventas">
        <StatCard label="Ingresos por boletos" value={formatMoney(totalRevenue)} hint="De órdenes pagadas" />
        <StatCard label="Boletos vendidos" value={totalTickets} hint="De órdenes pagadas" />
        <StatCard
          label="Evento con más ingresos"
          value={top ? top.label : '—'}
          hint={top ? `${formatMoney(top.revenue)} en ${plural(top.tickets, 'boleto', 'boletos')}` : 'No hay ventas en este filtro'}
        />
      </section>

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
