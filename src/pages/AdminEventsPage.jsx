import { useState } from 'react';
import AccessDenied from '../components/AccessDenied';
import Badge from '../components/Badge';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import ErrorMessage from '../components/ErrorMessage';
import EventFormModal from '../components/EventFormModal';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { emptyEventForm, eventHasOrders, eventToForm } from '../utils/eventAdmin';
import { STATUS_LABEL, STATUS_TONE, eventStatus } from '../utils/events';
import { formatDateTime } from '../utils/format';
import { ADMIN_ROLES, hasAccess } from '../utils/roles';
import './AdminEventsPage.css';

// Gestión de eventos: tabla con crear, editar y eliminar (solo Administrador y Organizador)
export default function AdminEventsPage({ session, catalog, orders, onAdd, onEdit, onRemove, onNavigate }) {
  const [form, setForm] = useState(null); // null = cerrado | { event } = editar | {} = crear
  const [deleting, setDeleting] = useState(null); // evento que se quiere eliminar
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');
  const [notice, setNotice] = useState('');

  // 1) Control de acceso por rol (simulado)
  if (!hasAccess(session, ADMIN_ROLES)) {
    return <AccessDenied session={session} roles={ADMIN_ROLES} onNavigate={onNavigate} />;
  }

  // 2) Estados de carga y error del catálogo (operación simulada)
  if (catalog.status === 'loading') {
    return <div className="container"><Loader label="Cargando los eventos…" /></div>;
  }
  if (catalog.status === 'error') {
    return (
      <div className="container">
        <ErrorMessage title="No pudimos cargar los eventos" message={catalog.error.message} onRetry={catalog.reload} />
      </div>
    );
  }

  // 3) Acciones
  async function handleSave(values) {
    if (form.event) {
      await onEdit(form.event.id, values);
      setNotice(`Cambios guardados en "${values.title.trim()}".`);
    } else {
      await onAdd(values);
      setNotice(`Evento "${values.title.trim()}" creado. Ajusta sus zonas en Inventario y precios.`);
    }
    setForm(null);
  }

  async function handleRemove() {
    if (removing) return; // evita el doble clic
    setRemoving(true);
    setRemoveError('');
    try {
      await onRemove(deleting.id);
      setNotice(`Evento "${deleting.title}" eliminado.`);
      setDeleting(null);
    } catch (err) {
      setRemoveError(err.message);
    } finally {
      setRemoving(false);
    }
  }

  function closeDelete() {
    setDeleting(null);
    setRemoveError('');
  }

  const columns = [
    { key: 'title', label: 'Evento', render: (e) => <strong>{e.title}</strong> },
    { key: 'date', label: 'Fecha', render: (e) => formatDateTime(e.date) },
    { key: 'place', label: 'Lugar', render: (e) => `${e.venue}, ${e.city}` },
    { key: 'category', label: 'Categoría', render: (e) => <Badge tone="primary">{e.category}</Badge> },
    {
      key: 'status',
      label: 'Estado',
      render: (e) => {
        const status = eventStatus(e, orders);
        return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      align: 'right',
      render: (e) => (
        <div className="admin-events__actions">
          <Button variant="secondary" size="sm" aria-label={`Editar ${e.title}`} onClick={() => { setNotice(''); setForm({ event: e }); }}>
            Editar
          </Button>
          <Button variant="danger" size="sm" aria-label={`Eliminar ${e.title}`} onClick={() => { setNotice(''); setDeleting(e); }}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const blocked = deleting ? eventHasOrders(orders, deleting.id) : false;

  return (
    <div className="container">
      <div className="admin-events__head">
        <header className="page-header">
          <h1 tabIndex={-1}>Gestión de eventos</h1>
          <p>Crea, edita o elimina los eventos del catálogo.</p>
        </header>
        <Button onClick={() => { setNotice(''); setForm({}); }}>Nuevo evento</Button>
      </div>

      <p className="admin-events__notice" role="status">{notice}</p>

      <DataTable
        caption="Eventos del catálogo"
        columns={columns}
        rows={catalog.data}
        rowKey={(e) => e.id}
        emptyText="No hay eventos. Crea el primero con «Nuevo evento»."
      />

      {form && (
        <EventFormModal
          key={form.event?.id ?? 'nuevo'}
          title={form.event ? 'Editar evento' : 'Nuevo evento'}
          initialValues={form.event ? eventToForm(form.event) : emptyEventForm()}
          onSubmit={handleSave}
          onClose={() => setForm(null)}
        />
      )}

      <Modal
        open={deleting !== null}
        title={blocked ? 'No se puede eliminar' : '¿Eliminar este evento?'}
        onClose={closeDelete}
        actions={
          blocked ? (
            <Button onClick={closeDelete}>Entendido</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={closeDelete} disabled={removing}>Cancelar</Button>
              <Button variant="danger" onClick={handleRemove} loading={removing} loadingText="Eliminando…">
                Sí, eliminar
              </Button>
            </>
          )
        }
      >
        {blocked
          ? `"${deleting?.title}" ya tiene órdenes de compra. Eliminarlo borraría el historial de boletos.`
          : `Se eliminará "${deleting?.title}" del catálogo. Esta acción no se puede deshacer.`}
        {removeError && <ErrorMessage title="No pudimos eliminarlo" message={removeError} />}
      </Modal>
    </div>
  );
}
