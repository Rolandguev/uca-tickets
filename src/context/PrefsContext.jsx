import { createContext, useContext, useMemo } from 'react';
import { usePersistentReducer } from '../hooks/usePersistentReducer';

// Preferencias del usuario: categoría elegida en el listado y modo demostración de errores.
const PrefsContext = createContext(null);

const INITIAL = { category: 'Todos', simulateErrors: false };

export function prefsReducer(state, action) {
  switch (action.type) {
    case 'SET_CATEGORY':
      return { ...state, category: action.category };
    case 'SET_SIMULATE_ERRORS':
      return { ...state, simulateErrors: action.value };
    default:
      throw new Error(`Acción desconocida en prefs: ${action.type}`);
  }
}

export function PrefsProvider({ children }) {
  const [prefs, dispatch] = usePersistentReducer('uca.prefs', prefsReducer, INITIAL);

  const value = useMemo(
    () => ({
      ...prefs,
      setCategory: (category) => dispatch({ type: 'SET_CATEGORY', category }),
      setSimulateErrors: (value) => dispatch({ type: 'SET_SIMULATE_ERRORS', value }),
    }),
    [prefs, dispatch],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs debe usarse dentro de <PrefsProvider>');
  return ctx;
}
