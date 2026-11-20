import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

// useState que se guarda en localStorage y se sincroniza entre pestañas
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key !== key || e.newValue === null) return;
      try {
        setValue(JSON.parse(e.newValue));
      } catch {
        /* valor corrupto: se ignora */
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [value, setValue];
}
