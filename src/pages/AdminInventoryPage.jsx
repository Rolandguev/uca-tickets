import { useState } from 'react';
import AccessDenied from '../components/AccessDenied';
import Badge from '../components/Badge';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import SelectField from '../components/SelectField';
import ZoneFormModal from '../components/ZoneFormModal';
import { LOW_STOCK } from '../data/events';
import { zoneAvailable } from '../utils/events';
import { formatMoney } from '../utils/format';
import { ADMIN_ROLES, hasAccess } from '../utils/roles';
import './AdminInventoryPage.css';

const ALL = 'Todos los eventos';

function stockTone(n) {
  if (n === 0) return 'error';
  return n <= LOW_STOCK ? 'warning' : 'success';
}

// Inventario y precios por zona de cada evento (solo Administrador y Organizador)
export default function AdminInventoryPage({ session, catalog, orders, onEditZone, onNavigate }) {
  const [filter, setFilter] = useState(ALL);
  const [editing, setEditing] = useState(null); // { event, zone } de la zona que se edita
  const [notice, setNotice] = useState('');

  // 1) Control de acceso por rol (simulado)
  if (!hasAccess(session, ADMIN_ROLES)) {
    return <AccessDenied session={session} roles={ADMIN_ROLES} onNavigate={onNavigate} />;
  }

  // 2) Estados de carga y error del catálogo (operación simulada)
  if (catalog.status === 'loading') {
    return <div className="container"><Loader label="Cargando el inventario…" /></div>;
  }
  if (catalog.status === 'error') {
    return (
      <div className="container">
        <ErrorMessage title="No pudimos cargar el inventario" message={catalog.error.message} onRetry={catalog.reload} />
      </div>
    );
  }

  // 3) Datos: una fila por zona (se calcula desde el catálogo, no se guarda aparte)
  const rows = catalog.data
    .filter((event) => filter === ALL || event.title === filter)
    .flatMap((event) => event.zones.map((zone) => ({ key: `${event.id}-${zone.id}`, event, zone })));

  async function handleSave(values) {
    await onEditZone(editing.event.id, editing.zone.id, values);
    setNotice(`Zona ${editing.zone.name} de "${editing.event.title}" actualizada.`);
    setEditing(null);
  }

  const columns = [
    { key: 'event', label: 'Evento', render: (r) => r.event.title },
    { key: 'zone', label: 'Zona', render: (r) => <strong>{r.zone.name}</strong> },
    { key: 'price', label: 'Precio', align: 'right', render: (r) => formatMoney(r.zone.price) },
    { key: 'initial', label: 'Inventario inicial', align: 'right', render: (r) => r.zone.available },
    {
      key: 'available',
      label: 'Disponibles ahora',
      align: 'right',
      render: (r) => {
        const n = zoneAvailable(r.event, r.zone, orders);
        return <Badge tone={stockTone(n)}>{n}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      align: 'right',
      render: (r) => (
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Editar la zona ${r.zone.name} de ${r.event.title}`}
          onClick={() => { setNotice(''); setEditing({ event: r.event, zone: r.zone }); }}
        >
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div className="container">
      <header className="page-header">
        <h1 tabIndex={-1}>Inventario y precios</h1>
        <p>Ajusta el precio y la cantidad de boletos de cada zona.</p>
      </header>

      <SelectField
        className="admin-inventory__filter"
        label="Filtrar por evento"
        options={[ALL, ...catalog.data.map((event) => event.title)]}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <p className="admin-inventory__notice" role="status">{notice}</p>

      <DataTable
        caption="Inventario y precios por zona"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.key}
        emptyText="No hay zonas para mostrar."
      />

      {editing && (
        <ZoneFormModal
          key={`${editing.event.id}-${editing.zone.id}`}
          title={`Zona ${editing.zone.name}`}
          description={editing.event.title}
          initialValues={{ price: String(editing.zone.price), available: String(editing.zone.available) }}
          onSubmit={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
