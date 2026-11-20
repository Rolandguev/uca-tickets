import Button from '../components/Button';
import Card from '../components/Card';
import { DEMO_USER } from '../data/users';

const TEXT = {
  login: ['Inicia sesión', 'Login, registro y recuperar contraseña los implementa la Persona B.'],
  profile: ['Mi perfil', 'El perfil con sesión simulada y roles lo implementa la Persona B.'],
};

// Pantalla temporal para las vistas de la Persona B. Permite probar la sesión mientras tanto.
export default function PlaceholderPage({ view, session, onLogin, onLogout, onEvents }) {
  const [title, description] = TEXT[view] ?? ['Próximamente', 'Esta vista está en construcción.'];
  return (
    <div className="container container--narrow">
      <header className="page-header">
        <h1 tabIndex={-1}>{title}</h1>
        <p>{description}</p>
      </header>
      <Card className="stack">
        {session ? (
          <>
            <p>Sesión de prueba activa: <strong>{session.name}</strong> ({session.email}) · {session.role}</p>
            <Button variant="secondary" onClick={onLogout}>Cerrar sesión</Button>
          </>
        ) : (
          <>
            <p className="muted small">Mientras tanto puedes entrar con el usuario de prueba para probar el flujo de compra.</p>
            <Button onClick={() => onLogin(DEMO_USER)}>Entrar como {DEMO_USER.name}</Button>
          </>
        )}
        <Button variant="ghost" onClick={onEvents}>Ir a eventos</Button>
      </Card>
    </div>
  );
}
