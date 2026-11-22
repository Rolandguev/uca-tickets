import { useState } from 'react';
import AccessDenied from '../components/AccessDenied';
import Badge from '../components/Badge';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import Notice from '../components/Notice';
import { ROLE_TONE, USER_ADMIN_ROLES, hasAccess } from '../utils/roles';

// Gestión de usuarios: listado con roles y activar/desactivar cuentas (solo Administrador)
export default function AdminUsersPage({ session, users, onToggleUser, onNavigate }) {
  const [target, setTarget] = useState(null); // usuario al que se le va a cambiar el estado
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // 1) Control de acceso por rol (simulado)
  if (!hasAccess(session, USER_ADMIN_ROLES)) {
    return <AccessDenied session={session} roles={USER_ADMIN_ROLES} onNavigate={onNavigate} />;
  }

  // 2) Acciones
  async function handleConfirm() {
    if (saving) return; // evita el doble clic
    setSaving(true);
    setError('');
    try {
      await onToggleUser(target.id);
      setNotice(`La cuenta de ${target.name} quedó ${target.active ? 'desactivada' : 'activa'}.`);
      setTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function closeModal() {
    setTarget(null);
    setError('');
  }

  const columns = [
    { key: 'name', label: 'Nombre', render: (u) => <strong>{u.name}</strong> },
    { key: 'email', label: 'Correo' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'role', label: 'Rol', render: (u) => <Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge> },
    {
      key: 'status',
      label: 'Estado',
      render: (u) => <Badge tone={u.active ? 'success' : 'error'}>{u.active ? 'Activa' : 'Desactivada'}</Badge>,
    },
    {
      key: 'actions',
      label: 'Acciones',
      align: 'right',
      render: (u) =>
        u.id === session.id ? (
          <Badge tone="neutral">Tu cuenta</Badge>
        ) : (
          <Button
            variant={u.active ? 'danger' : 'secondary'}
            size="sm"
            aria-label={`${u.active ? 'Desactivar' : 'Activar'} la cuenta de ${u.name}`}
            onClick={() => { setNotice(''); setTarget(u); }}
          >
            {u.active ? 'Desactivar' : 'Activar'}
          </Button>
        ),
    },
  ];

  return (
    <div className="container">
      <header className="page-header">
        <h1 tabIndex={-1}>Usuarios</h1>
        <p>Cuentas registradas, su rol y su estado.</p>
      </header>

      <Notice>{notice}</Notice>

      <DataTable
        caption="Usuarios registrados"
        columns={columns}
        rows={users}
        rowKey={(u) => u.id}
        emptyText="No hay usuarios registrados."
      />

      <Modal
        open={target !== null}
        title={target?.active ? '¿Desactivar esta cuenta?' : '¿Activar esta cuenta?'}
        onClose={closeModal}
        actions={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>Cancelar</Button>
            <Button
              variant={target?.active ? 'danger' : 'primary'}
              onClick={handleConfirm}
              loading={saving}
              loadingText="Guardando…"
            >
              {target?.active ? 'Sí, desactivar' : 'Sí, activar'}
            </Button>
          </>
        }
      >
        {target?.active
          ? `${target.name} no podrá iniciar sesión mientras su cuenta esté desactivada.`
          : `${target?.name} podrá volver a iniciar sesión.`}
        {error && <ErrorMessage title="No pudimos guardar el cambio" message={error} />}
      </Modal>
    </div>
  );
}
