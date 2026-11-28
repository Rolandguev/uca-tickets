import { USER_ADMIN_ROLES } from '../utils/roles';
import './AdminNav.css';

// Secciones del panel. "roles" limita quién ve el botón (sin "roles": lo ven todos los que entran al panel)
const LINKS = [
  { view: 'admin', label: 'Resumen' },
  { view: 'adminEvents', label: 'Eventos' },
  { view: 'adminInventory', label: 'Inventario y precios' },
  { view: 'adminUsers', label: 'Usuarios', roles: USER_ADMIN_ROLES },
  { view: 'reports', label: 'Reportes', roles: USER_ADMIN_ROLES },
];

// Vistas que pertenecen al panel (App las usa para saber cuándo mostrar la barra)
export const ADMIN_VIEWS = LINKS.map((link) => link.view);

// Barra de navegación del panel de administración
export default function AdminNav({ view, role, onNavigate }) {
  const links = LINKS.filter((link) => !link.roles || link.roles.includes(role));

  return (
    <nav className="container admin-nav" aria-label="Administración">
      <ul>
        {links.map((link) => (
          <li key={link.view}>
            <button
              type="button"
              className="admin-nav__link"
              aria-current={link.view === view ? 'page' : undefined}
              onClick={() => onNavigate(link.view)}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
