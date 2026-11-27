// RUTAS DE LA PERSONA B: cuenta (login, registro, perfil) y panel de administración.
// Mismo patrón que purchaseRoutes: cada "Screen" toma el estado global y se lo pasa a su página.
import { Outlet, useLocation } from 'react-router';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import RecoverPage from '../pages/RecoverPage';
import ProfilePage from '../pages/ProfilePage';
import AdminPage from '../pages/AdminPage';
import ReportsPage from '../pages/ReportsPage';
import AdminEventsPage from '../pages/AdminEventsPage';
import AdminInventoryPage from '../pages/AdminInventoryPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminNav from '../components/AdminNav';
import { useData } from '../context/DataContext';
import { useSession } from '../context/SessionContext';
import { usePrefs } from '../context/PrefsContext';
import * as usersApi from '../api/users';
import { ADMIN_ROLES, hasAccess } from '../utils/roles';
import { adminViewFromPath, useGo } from './paths';

function LoginScreen() {
  const { session, login } = useSession();
  const { simulateErrors } = usePrefs();
  const go = useGo();
  async function handleLogin(values) {
    const user = await usersApi.login(values, { simulateError: simulateErrors });
    login(user);
    go('events');
  }
  return <LoginPage session={session} onLogin={handleLogin} onEvents={() => go('events')} onNavigate={go} />;
}

function RegisterScreen() {
  const { registerUser } = useData();
  const { session, login } = useSession();
  const go = useGo();
  async function handleRegister(values) {
    const newUser = await registerUser(values);
    login(newUser); // la cuenta nueva entra con sesión iniciada
    go('events');
  }
  return <RegisterPage session={session} onRegister={handleRegister} onEvents={() => go('events')} onNavigate={go} />;
}

function RecoverScreen() {
  const { simulateErrors } = usePrefs();
  const go = useGo();
  return <RecoverPage onRecover={(email) => usersApi.recover(email, { simulateError: simulateErrors })} onNavigate={go} />;
}

function ProfileScreen() {
  const { session, logout } = useSession();
  const go = useGo();
  return (
    <ProfilePage
      session={session}
      onLogout={() => {
        logout();
        go('events');
      }}
      onNavigate={go}
    />
  );
}

// Layout del panel: barra de secciones (si el rol tiene acceso) + la sección actual
function AdminLayout() {
  const { session } = useSession();
  const { pathname } = useLocation();
  const go = useGo();
  return (
    <>
      {hasAccess(session, ADMIN_ROLES) && <AdminNav view={adminViewFromPath(pathname)} role={session.role} onNavigate={go} />}
      <Outlet />
    </>
  );
}

function AdminScreen() {
  const { catalog, orders, users } = useData();
  const { session } = useSession();
  const go = useGo();
  return <AdminPage session={session} catalog={catalog} orders={orders} users={users} onNavigate={go} />;
}

function AdminEventsScreen() {
  const { catalog, orders, addEventItem, editEvent, removeEventItem } = useData();
  const { session } = useSession();
  const go = useGo();
  return (
    <AdminEventsPage
      session={session}
      catalog={catalog}
      orders={orders}
      onAdd={addEventItem}
      onEdit={editEvent}
      onRemove={removeEventItem}
      onNavigate={go}
    />
  );
}

function AdminInventoryScreen() {
  const { catalog, orders, editZone } = useData();
  const { session } = useSession();
  const go = useGo();
  return <AdminInventoryPage session={session} catalog={catalog} orders={orders} onEditZone={editZone} onNavigate={go} />;
}

function AdminUsersScreen() {
  const { users, toggleUser } = useData();
  const { session } = useSession();
  const go = useGo();
  return <AdminUsersPage session={session} users={users} onToggleUser={toggleUser} onNavigate={go} />;
}

function ReportsScreen() {
  const { catalog, orders } = useData();
  const { session } = useSession();
  const go = useGo();
  return <ReportsPage session={session} catalog={catalog} orders={orders} onNavigate={go} />;
}

// Tabla de rutas de la Persona B (Fase 2: agregar aquí el guardia de rutas por rol)
export const accountRoutes = [
  { path: 'login', element: <LoginScreen />, handle: { title: 'Inicia sesión' } },
  { path: 'registro', element: <RegisterScreen />, handle: { title: 'Crear cuenta' } },
  { path: 'recuperar', element: <RecoverScreen />, handle: { title: 'Recuperar contraseña' } },
  { path: 'perfil', element: <ProfileScreen />, handle: { title: 'Mi perfil' } },
  {
    path: 'admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminScreen />, handle: { title: 'Panel de administración' } },
      { path: 'eventos', element: <AdminEventsScreen />, handle: { title: 'Gestión de eventos' } },
      { path: 'inventario', element: <AdminInventoryScreen />, handle: { title: 'Inventario y precios' } },
      { path: 'usuarios', element: <AdminUsersScreen />, handle: { title: 'Usuarios' } },
      { path: 'reportes', element: <ReportsScreen />, handle: { title: 'Reportes' } },
    ],
  },
];
