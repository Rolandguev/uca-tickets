import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import DetailRows from '../components/DetailRows';
import EmptyState from '../components/EmptyState';
import './ProfilePage.css';

// Qué puede hacer cada rol (solo informativo: la sesión es simulada)
const ROLE_INFO = {
  Cliente: {
    tone: 'neutral',
    can: ['Buscar eventos y comprar boletos', 'Ver y descargar tus boletos'],
  },
  Organizador: {
    tone: 'warning',
    can: ['Todo lo del rol Cliente', 'Gestionar eventos, inventario y precios', 'Consultar los reportes de ventas'],
  },
  Administrador: {
    tone: 'primary',
    can: ['Todo lo del rol Organizador', 'Ver el panel de administración completo', 'Consultar los usuarios'],
  },
};

// Perfil del usuario con sesión simulada y su rol
export default function ProfilePage({ session, onLogout, onNavigate }) {
  if (!session) {
    return (
      <div className="container container--narrow">
        <header className="page-header">
          <h1 tabIndex={-1}>Mi perfil</h1>
        </header>
        <EmptyState
          title="No has iniciado sesión"
          message="Inicia sesión para ver tu perfil y tus boletos."
          action={<Button onClick={() => onNavigate('login')}>Iniciar sesión</Button>}
        />
      </div>
    );
  }

  const info = ROLE_INFO[session.role] ?? ROLE_INFO.Cliente;

  return (
    <div className="container container--narrow">
      <header className="page-header">
        <h1 tabIndex={-1}>Mi perfil</h1>
        <p>Los datos de tu cuenta y lo que puedes hacer con tu rol.</p>
      </header>

      <div className="profile__head">
        <Avatar name={session.name} size={64} />
        <div>
          <p className="profile__name">{session.name}</p>
          <p className="profile__email">{session.email}</p>
        </div>
      </div>

      <DetailRows
        items={[
          { label: 'Nombre', value: session.name },
          { label: 'Correo', value: session.email },
          { label: 'Teléfono', value: session.phone },
          { label: 'Rol', value: <Badge tone={info.tone}>{session.role}</Badge> },
          {
            label: 'Estado',
            value: <Badge tone={session.active ? 'success' : 'error'}>{session.active ? 'Activa' : 'Desactivada'}</Badge>,
          },
        ]}
      />

      <Card title="Qué puedes hacer con tu rol">
        <ul className="profile__can">
          {info.can.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </Card>

      <div className="profile__actions">
        {['Administrador', 'Organizador'].includes(session.role) && (
          <Button onClick={() => onNavigate('admin')}>Panel de administración</Button>
        )}
        <Button variant="secondary" onClick={() => onNavigate('tickets')}>Mis boletos</Button>
        <Button variant="danger" onClick={onLogout}>Cerrar sesión</Button>
      </div>
    </div>
  );
}

