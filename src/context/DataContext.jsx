import { createContext, useContext, useMemo } from 'react';
import { EVENTS } from '../data/events';
import { SEED_ORDERS } from '../data/orders';
import { ACCOUNTS } from '../data/accounts';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAsync } from '../hooks/useAsync';
import { fetchEvents } from '../utils/api';
import { saveRequest } from '../utils/adminApi';
import { addEvent, removeEvent, updateEvent, updateZone } from '../utils/eventAdmin';
import { usePrefs } from './PrefsContext';
import { useSession } from './SessionContext';

// PUENTE TEMPORAL (Fase 1): eventos, órdenes y usuarios como estaban en App.jsx.
// En la Fase 2 esto se reemplaza por la capa src/api (Persona B) y los componentes
// leerán los datos desde ahí. Las funciones expuestas se mantienen con los mismos nombres.
const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { simulateErrors } = usePrefs();
  const [eventList, setEventList] = useLocalStorage('uca.events', EVENTS);
  const [orders, setOrders] = useLocalStorage('uca.orders', SEED_ORDERS);
  const [users, setUsers] = useLocalStorage('uca.users', ACCOUNTS);

  const loaded = useAsync(() => fetchEvents(EVENTS, { simulateError: simulateErrors }), [simulateErrors]);
  const opts = { simulateError: simulateErrors };

  // Los eventos viven en eventList (editable desde el panel); "loaded" simula la carga y el error
  const catalog = { ...loaded, data: loaded.status === 'success' ? eventList : null };

  const value = {
    catalog,
    events: catalog.data ?? [],
    orders,
    users,
    addOrder: (order) => setOrders((prev) => [...prev, order]),
    addUser: (user) => setUsers((prev) => [...prev, user]),
    async addEventItem(values) {
      await saveRequest(opts);
      setEventList((list) => addEvent(list, values));
    },
    async editEvent(id, values) {
      await saveRequest(opts);
      setEventList((list) => updateEvent(list, id, values));
    },
    async removeEventItem(id) {
      await saveRequest(opts);
      setEventList((list) => removeEvent(list, id));
    },
    async editZone(eventId, zoneId, values) {
      await saveRequest(opts);
      setEventList((list) => updateZone(list, eventId, zoneId, values));
    },
    async toggleUser(id) {
      await saveRequest(opts);
      setUsers((list) => list.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
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
