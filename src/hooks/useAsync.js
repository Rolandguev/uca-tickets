import { useCallback, useEffect, useState } from 'react';

// Ejecuta una función asíncrona al montar (y cuando cambian las dependencias)
// y expone { status: 'loading' | 'success' | 'error', data, error, reload }.
// El flag "active" evita actualizar el estado si el componente ya se desmontó.
export function useAsync(fn, deps) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    fn()
      .then((data) => {
        if (active) setState({ status: 'success', data, error: null });
      })
      .catch((error) => {
        if (active) setState({ status: 'error', data: null, error });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}
