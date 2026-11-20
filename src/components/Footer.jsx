import './Footer.css';

const SOCIAL = ['WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'Spotify'];

export default function Footer({ simulateErrors, onToggleSimulate }) {
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

        <label className="footer__demo">
          <input type="checkbox" checked={simulateErrors} onChange={(e) => onToggleSimulate(e.target.checked)} />
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
