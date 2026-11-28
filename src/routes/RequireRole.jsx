import { Navigate, Outlet, useLocation } from 'react-router';
import AccessDenied from '../components/AccessDenied';
import { useSession } from '../context/SessionContext';
import { hasAccess } from '../utils/roles';
import { useGo } from './paths';

// Guardia de rutas. Se usa como "layout" de un grupo de rutas:
//  - sin sesión            -> redirige a /login
//  - con sesión sin el rol -> pantalla de acceso denegado
//  - con el rol correcto   -> muestra la ruta hija (<Outlet />)
// Si no se pasa "roles", basta con haber iniciado sesión.
export default function RequireRole({ roles }) {
  const { session } = useSession();
  const { pathname, search } = useLocation();
  const go = useGo();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: pathname + search }} />;
  }
  if (roles && !hasAccess(session, roles)) {
    return <AccessDenied session={session} roles={roles} onNavigate={go} />;
  }
  return <Outlet />;
}
