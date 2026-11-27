import { usePrefs } from '../context/PrefsContext';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import Button from './Button';
import './Footer.css';

const SOCIAL = ['WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'Spotify'];

export default function Footer() {
  const { simulateErrors, setSimulateErrors } = usePrefs();
  const { canInstall, install } = useInstallPrompt();
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <p className="footer__heading">Vamos a conectarnos</p>
          <ul className="footer__social">
            {SOCIAL.map((name) => (
              <li key={name}>
                {/* Enlaces de ejemplo: no hay redes reales en esta entrega */}
                <a href="#" onClick={(e) => e.preventDefault()}>{name}</a>
              </li>
            ))}
          </ul>
        </div>

        {canInstall && (
          <Button size="sm" variant="secondary" className="footer__install" onClick={install}>
            Instalar app
          </Button>
        )}

        <label className="footer__demo">
          <input type="checkbox" checked={simulateErrors} onChange={(e) => setSimulateErrors(e.target.checked)} />
          <span>Modo demostración: simular errores de red</span>
        </label>

        <p className="footer__legal small muted">
          <a href="#" onClick={(e) => e.preventDefault()}>Términos y Condiciones</a>
          {' | '}
          <a href="#" onClick={(e) => e.preventDefault()}>Política de Privacidad</a>
          {' · © UCA TICKETS'}
        </p>
      </div>
    </footer>
  );
}
