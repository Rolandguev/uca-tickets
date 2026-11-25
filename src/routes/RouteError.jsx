import { Link, isRouteErrorResponse, useRouteError } from 'react-router';
import Logo from '../components/Logo';
import ErrorMessage from '../components/ErrorMessage';

// Se muestra si una ruta lanza un error inesperado (en lugar de una pantalla en blanco)
export default function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error?.message ?? 'Ocurrió un error inesperado.';
  return (
    <main className="container container--narrow stack" id="main">
      <Logo />
      <ErrorMessage title="Algo salió mal" message={message} onRetry={() => window.location.reload()} retryLabel="Recargar" />
      <Link className="btn btn--secondary" to="/eventos">Volver a eventos</Link>
    </main>
  );
}
