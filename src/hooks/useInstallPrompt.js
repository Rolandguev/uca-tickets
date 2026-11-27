import { useEffect, useState } from 'react';

// Guarda el evento "beforeinstallprompt" (Chrome / Edge) para mostrar un botón propio de instalar.
// canInstall es false si el navegador no lo ofrece o si la app ya está instalada.
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);

  useEffect(() => {
    function onPrompt(e) {
      e.preventDefault(); // evita la mini barra automática; se usa nuestro botón
      setPromptEvent(e);
    }
    const onInstalled = () => setPromptEvent(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null); // el evento solo se puede usar una vez
  }

  return { canInstall: Boolean(promptEvent), install };
}
