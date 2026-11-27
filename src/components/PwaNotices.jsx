import { useRegisterSW } from 'virtual:pwa-register/react';
import Button from './Button';
import Icon from './Icon';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import './PwaNotices.css';

// Registra el service worker y muestra los avisos de la PWA:
// - barra "Sin conexión" mientras no hay red
// - "Lista para usar sin conexión" la primera vez que todo queda en caché
// - "Hay una nueva versión" cuando se publicó una actualización (botón Actualizar)
export default function PwaNotices() {
  const online = useOnlineStatus();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Busca actualizaciones cada hora mientras la app está abierta
      if (registration) setInterval(() => registration.update(), 60 * 60 * 1000);
    },
  });

  return (
    <>
      {!online && (
        <div className="offline-bar" role="status">
          <Icon name="clock" size={16} />
          <span>Sin conexión. Estás viendo los eventos y boletos guardados en este dispositivo.</span>
        </div>
      )}

      <div className="pwa-toasts" aria-live="polite">
        {needRefresh && (
          <div className="pwa-toast" role="alertdialog" aria-labelledby="pwa-update-text">
            <p id="pwa-update-text">Hay una nueva versión de UCA TICKETS.</p>
            <div className="pwa-toast__actions">
              <Button size="sm" variant="secondary" onClick={() => setNeedRefresh(false)}>Después</Button>
              <Button size="sm" onClick={() => updateServiceWorker(true)}>Actualizar</Button>
            </div>
          </div>
        )}
        {offlineReady && !needRefresh && (
          <div className="pwa-toast">
            <p>Listo: la app ya funciona sin conexión.</p>
            <div className="pwa-toast__actions">
              <Button size="sm" variant="secondary" onClick={() => setOfflineReady(false)}>Entendido</Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
