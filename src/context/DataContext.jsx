import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as eventsApi from '../api/events';
import * as ordersApi from '../api/orders';
import * as usersApi from '../api/users';
import { KEYS, isAbort, loadTable } from '../api/client';
import { SEED_ORDERS } from '../data/orders';
import { ACCOUNTS } from '../data/accounts';
import { usePrefs } from './PrefsContext';
import { useSession } from './SessionContext';

// Estado de datos de la app. Todo el acceso a datos pasa por la capa src/api:
// aquí solo se guarda el resultado en React y se exponen funciones a las pantallas.
const DataContext = createContext(null);

const withoutPassword = ({ password: _password, ...user }) => user;

export function DataProvider({ children }) {
  const { simulateErrors } = usePrefs();
  const opts = { simulateError: simulateErrors };

  // Catálogo: carga asíncrona con estados loading / success / error y cancelación
  const [catalog, setCatalog] = useState({ status: 'loading', data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCatalog({ status: 'loading', data: null, error: null });
    eventsApi
      .listEvents({ signal: controller.signal, simulateError: simulateErrors })
      .then((data) => setCatalog({ status: 'success', data, error: null }))
      .catch((error) => {
        if (!isAbort(error)) setCatalog({ status: 'error', data: null, error });
      });
    return () => controller.abort(); // al salir o recargar, la petición en curso se cancela
  }, [simulateErrors, attempt]);

  // Órdenes y usuarios se leen de una vez desde localStorage (las pantallas los necesitan al instante)
  const [orders, setOrders] = useState(() => loadTable(KEYS.orders, SEED_ORDERS));
  const [users, setUsers] = useState(() => loadTable(KEYS.users, ACCOUNTS).map(withoutPassword));

  const setEvents = (list) => setCatalog((c) => ({ ...c, data: list }));

  const value = {
    catalog: { ...catalog, reload: () => setAttempt((n) => n + 1) },
    events: catalog.data ?? [],
    orders,
    users,

    // La orden aparece de inmediato y se guarda en segundo plano
    addOrder(order) {
      setOrders((prev) => [...prev, order]);
      ordersApi.createOrder(order);
    },

    async registerUser(values) {
      const user = await usersApi.register(values, opts);
      setUsers((prev) => [...prev, user]);
      return user;
    },
    async toggleUser(id) {
      setUsers(await usersApi.toggleUser(id, opts));
    },

    async addEventItem(values) {
      setEvents(await eventsApi.createEvent(values, opts));
    },
    async editEvent(id, values) {
      setEvents(await eventsApi.editEvent(id, values, opts));
    },
    async removeEventItem(id) {
      setEvents(await eventsApi.deleteEvent(id, opts));
    },
    async editZone(eventId, zoneId, values) {
      setEvents(await eventsApi.editZone(eventId, zoneId, values, opts));
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>');
  return ctx;
}

// Órdenes del usuario actual: por correo si hay sesión; si no, las compras como invitado
export function useMyOrders() {
  const { orders } = useData();
  const { session } = useSession();
  return useMemo(
    () =>
      orders.filter((o) => (session ? o.buyer.email.toLowerCase() === session.email.toLowerCase() : o.guest)),
    [orders, session],
  );
}
