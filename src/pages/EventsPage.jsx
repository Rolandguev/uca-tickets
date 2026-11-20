import { useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryChips from '../components/CategoryChips';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { CATEGORIES } from '../data/events';
import { eventStatus } from '../utils/events';
import { normalize } from '../utils/format';
import './EventsPage.css';

// Listado de eventos con búsqueda y filtro por categoría
export default function EventsPage({ catalog, orders, category, onCategory, onOpen }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalize(query);
    return (catalog.data ?? []).filter((e) => {
      const byCategory = category === 'Todos' || e.category === category;
      const haystack = normalize(`${e.title} ${e.artist} ${e.venue} ${e.city}`);
      return byCategory && (!q || haystack.includes(q));
    });
  }, [catalog.data, query, category]);

  function clearFilters() {
    setQuery('');
    onCategory('Todos');
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1 tabIndex={-1}>Eventos</h1>
        <p>Encuentra tu próximo concierto y compra tus boletos en pocos pasos.</p>
      </header>

      <div className="events-filters">
        <SearchBar value={query} onChange={setQuery} />
        <CategoryChips categories={CATEGORIES} selected={category} onSelect={onCategory} />
      </div>

      {catalog.status === 'loading' && <Loader label="Cargando eventos…" />}

      {catalog.status === 'error' && (
        <ErrorMessage title="No pudimos cargar los eventos" message={catalog.error.message} onRetry={catalog.reload} />
      )}

      {catalog.status === 'success' && (
        <>
          <p className="events-count muted small" aria-live="polite">
            {filtered.length === 1 ? '1 evento' : `${filtered.length} eventos`}
          </p>
          {filtered.length === 0 ? (
            <EmptyState
              title="No encontramos eventos"
              message="Prueba con otra búsqueda o quita los filtros para ver todos los eventos."
              action={<Button variant="secondary" onClick={clearFilters}>Limpiar filtros</Button>}
            />
          ) : (
            <ul className="events-grid">
              {filtered.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} status={eventStatus(event, orders)} onOpen={onOpen} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
