import { Link, NavLink, useLocation } from 'react-router';
import Logo from './Logo';
import Avatar from './Avatar';
import Icon from './Icon';
import { cx } from '../utils/cx';
import { useSession } from '../context/SessionContext';
import { useCartSummary } from '../context/CartContext';
import './Navbar.css';

// Cada enlace se marca activo en todas las rutas de su sección
const LINKS = [
  { to: '/eventos', label: 'Eventos', match: ['/', '/eventos', '/carrito', '/checkout'] },
  { to: '/boletos', label: 'Mis boletos', match: ['/boletos'] },
  { to: '/perfil', label: 'Mi perfil', match: ['/perfil', '/admin'] },
];

const isIn = (pathname, base) => (base === '/' ? pathname === '/' : pathname === base || pathname.startsWith(`${base}/`));

export default function Navbar() {
  const { pathname } = useLocation();
  const { session } = useSession();
  const { totals } = useCartSummary();
  const cartCount = totals.count;

  return (
    <header className="navbar">
      <div className="navbar__bar">
        <div className="navbar__logo">
          <Logo to="/" />
        </div>

        <nav className="navbar__nav" aria-label="Principal">
          <ul>
            {LINKS.map((link) => {
              const current = link.match.some((base) => isIn(pathname, base));
              return (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={cx('navbar__link', current && 'is-active')}
                    aria-current={current ? 'page' : undefined}
                  >
                    {link.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="navbar__actions">
          <Link
            to="/carrito"
            className="navbar__cart"
            aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? 'boleto' : 'boletos'}`}
          >
            <Icon name="cart" />
            {cartCount > 0 && <span className="navbar__count" aria-hidden="true">{cartCount}</span>}
          </Link>

          {session ? (
            <Link to="/perfil" className="navbar__avatar" aria-label={`Mi perfil, ${session.name}`}>
              <Avatar name={session.name} />
            </Link>
          ) : (
            <Link to="/login" className="btn btn--secondary btn--sm">Iniciar sesión</Link>
          )}
        </div>
      </div>
    </header>
  );
}
