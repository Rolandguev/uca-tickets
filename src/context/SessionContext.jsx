import { createContext, useContext, useMemo } from 'react';
import { usePersistentReducer } from '../hooks/usePersistentReducer';

// Sesión simulada: el usuario que inició sesión (sin contraseña) o null.
const SessionContext = createContext(null);

export function sessionReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return action.user;
    case 'LOGOUT':
      return null;
    case 'UPDATE_PROFILE':
      return state ? { ...state, ...action.changes } : state;
    default:
      throw new Error(`Acción desconocida en session: ${action.type}`);
  }
}

export function SessionProvider({ children }) {
  const [session, dispatch] = usePersistentReducer('uca.session', sessionReducer, null);

  const value = useMemo(
    () => ({
      session,
      login: (user) => dispatch({ type: 'LOGIN', user }),
      logout: () => dispatch({ type: 'LOGOUT' }),
      updateProfile: (changes) => dispatch({ type: 'UPDATE_PROFILE', changes }),
    }),
    [session, dispatch],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>');
  return ctx;
}
