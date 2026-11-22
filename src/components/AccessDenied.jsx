import Button from './Button';
import EmptyState from './EmptyState';

// Pantalla para cuando no hay sesión o el rol no tiene acceso (control de acceso simulado)
export default function AccessDenied({ session, roles, onNavigate }) {
  const allowed = `Esta sección es solo para estos roles: ${roles.join(', ')}.`;
  return (
    <div className="container container--narrow">
      {session ? (
        <EmptyState
          title="No tienes acceso a esta sección"
          message={`Tu cuenta tiene el rol ${session.role}. ${allowed}`}
          action={<Button onClick={() => onNavigate('events')}>Ver eventos</Button>}
        />
      ) : (
        <EmptyState
          title="Inicia sesión para continuar"
          message={allowed}
          action={<Button onClick={() => onNavigate('login')}>Iniciar sesión</Button>}
        />
      )}
    </div>
  );
}