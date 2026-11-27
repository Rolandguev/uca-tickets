import { Link } from 'react-router';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { CATEGORIES } from '../data/events';
import { eventStatus } from '../utils/events';
import '../components/CategoryChips.css';
import './HomePage.css';

// Inicio: portada, próximos eventos con boletos, últimos boletos y accesos por categoría
export default function HomePage({ catalog, orders, onOpen, onCategory }) {
  const events = catalog.data ?? [];
  const now = Date.now();
  const withStatus = events
    .map((event) => ({ event, status: eventStatus(event, orders) }))
    .filter(({ event }) => new Date(event.date).getTime() >= now)
    .sort((a, b) => new Date(a.event.date) - new Date(b.event.date));

  const upcoming = withStatus.filter((x) => x.status !== 'agotado').slice(0, 4);
  const lastTickets = withStatus.filter((x) => x.status === 'ultimos').slice(0, 4);
  const usedCategories = CATEGORIES.filter((c) => events.some((e) => e.category === c));

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__inner">
          <p className="hero__kicker">UCA TICKETS</p>
          <h1 id="hero-title" className="hero__title" tabIndex={-1}>Vive la música en vivo.</h1>
          <p className="hero__text">Compra tus boletos en pocos pasos y lleva tus entradas siempre contigo, incluso sin conexión.</p>
          <div className="hero__actions">
            <Link to="/eventos" className="btn btn--light">Ver todos los eventos</Link>
            <Link to="/boletos" className="btn btn--outline-light">Mis boletos</Link>
          </div>
        </div>
      </section>

      <div className="container home">
        {catalog.status === 'loading' && <Loader label="Cargando eventos destacados…" />}
        {catalog.status === 'error' && (
          <ErrorMessage title="No pudimos cargar los eventos" message={catalog.error.message} onRetry={catalog.reload} />
        )}

        {catalog.status === 'success' && (
          <>
            <section className="home__section" aria-labelledby="home-next">
              <div className="home__head">
                <h2 id="home-next">Próximos eventos</h2>
                <Link to="/eventos" className="link">Ver todos</Link>
              </div>
              {upcoming.length === 0 ? (
                <EmptyState title="No hay eventos próximos" message="Vuelve pronto: estamos preparando nuevas fechas." />
              ) : (
                <ul className="home__grid">
                  {upcoming.map(({ event, status }) => (
                    <li key={event.id}><EventCard event={event} status={status} onOpen={onOpen} /></li>
                  ))}
                </ul>
              )}
            </section>

            {lastTickets.length > 0 && (
              <section className="home__section" aria-labelledby="home-last">
                <div className="home__head">
                  <h2 id="home-last">Últimos boletos</h2>
                  <p className="muted small">Quedan pocas entradas en alguna zona.</p>
                </div>
                <ul className="home__grid">
                  {lastTickets.map(({ event, status }) => (
                    <li key={event.id}><EventCard event={event} status={status} onOpen={onOpen} /></li>
                  ))}
                </ul>
              </section>
            )}

            <section className="home__section" aria-labelledby="home-cats">
              <h2 id="home-cats" className="home__h2">Explora por categoría</h2>
              <ul className="home__cats">
                {usedCategories.map((cat) => (
                  <li key={cat}>
                    <button type="button" className="chip" onClick={() => onCategory(cat)}>{cat}</button>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </>
  );
}
