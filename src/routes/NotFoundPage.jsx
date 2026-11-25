import { Link } from 'react-router';
import EmptyState from '../components/EmptyState';

export default function NotFoundPage() {
  return (
    <div className="container container--narrow">
      <header className="page-header">
        <h1 tabIndex={-1}>Página no encontrada</h1>
        <p>Error 404</p>
      </header>
      <EmptyState
        title="Esta página no existe"
        message="Puede que el enlace esté mal escrito o que la página se haya movido."
        action={<Link className="btn btn--primary" to="/eventos">Ver eventos</Link>}
      />
    </div>
  );
}
