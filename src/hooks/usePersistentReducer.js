import { useEffect, useReducer } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

const SYNC = '@@SYNC';

// useReducer que se guarda en localStorage y se sincroniza entre pestañas.
// - Estado inicial: lo guardado (si existe) o "initialState".
// - Cada cambio se escribe en localStorage.
// - Si otra pestaña cambia la misma clave, se reemplaza el estado con la acción interna @@SYNC.
export function usePersistentReducer(key, reducer, initialState) {
  const [state, dispatch] = useReducer(
    (current, action) => (action.type === SYNC ? action.state : reducer(current, action)),
    undefined,
    () => readStorage(key, initialState),
  );

  useEffect(() => {
    writeStorage(key, state);
  }, [key, state]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key !== key || e.newValue === null) return;
      try {
        dispatch({ type: SYNC, state: JSON.parse(e.newValue) });
      } catch {
        /* valor corrupto: se ignora */
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [state, dispatch];
}
