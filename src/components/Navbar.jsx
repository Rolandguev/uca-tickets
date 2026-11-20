import Logo from './Logo';
import Avatar from './Avatar';
import Button from './Button';
import Icon from './Icon';
import { cx } from '../utils/cx';
import './Navbar.css';

const LINKS = [
  { id: 'events', label: 'Eventos', views: ['events', 'event', 'cart', 'checkout', 'success', 'failed'] },
  { id: 'tickets', label: 'Mis boletos', views: ['tickets', 'ticket', 'sent'] },
  { id: 'profile', label: 'Mi perfil', views: ['profile'] },
];

export default function Navbar({ view, session, cartCount, onNavigate }) {
  return (
    <header className="navbar">
      <div className="navbar__bar">
        <div className="navbar__logo">
          <Logo onClick={() => onNavigate('events')} />
        </div>

        <nav className="navbar__nav" aria-label="Principal">
          <ul>
            {LINKS.map((link) => {
              const current = link.views.includes(view);
              return (
                <li key={link.id}>
                  <button
                    type="button"
                    className={cx('navbar__link', current && 'is-active')}
                    aria-current={current ? 'page' : undefined}
                    onClick={() => onNavigate(link.id)}
                  >
                    {link.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="navbar__actions">
          <button
            type="button"
            className="navbar__cart"
            onClick={() => onNavigate('cart')}
            aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? 'boleto' : 'boletos'}`}
          >
            <Icon name="cart" />
            {cartCount > 0 && <span className="navbar__count" aria-hidden="true">{cartCount}</span>}
          </button>

          {session ? (
            <button
              type="button"
              className="navbar__avatar"
              onClick={() => onNavigate('profile')}
              aria-label={`Mi perfil, ${session.name}`}
            >
              <Avatar name={session.name} />
            </button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => onNavigate('login')}>
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
