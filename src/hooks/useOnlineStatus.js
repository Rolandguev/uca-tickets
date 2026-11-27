import { useEffect, useState } from 'react';

// true si el navegador tiene conexión; se actualiza con los eventos online/offline
export function useOnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(navigator.onLine); // revisa otra vez al montar (la página pudo abrirse justo al cambiar la red)
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}
