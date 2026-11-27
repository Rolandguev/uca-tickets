import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation, useMatches } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PwaNotices from '../components/PwaNotices';

// Layout compartido por todas las rutas: enlace de salto, barra superior, contenido y pie.
export default function RootLayout() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const mainRef = useRef(null);
  const lastPath = useRef(pathname);

  // Título de la pestaña desde handle.title de la ruta más profunda que lo tenga
  const title = [...matches].reverse().find((m) => m.handle?.title)?.handle.title;
  useEffect(() => {
    document.title = title ? `UCA TICKETS | ${title}` : 'UCA TICKETS';
  }, [title]);

  // Al cambiar de ruta, el foco va al h1 de la nueva vista (lectores de pantalla y teclado)
  useEffect(() => {
    if (lastPath.current === pathname) return; // primera carga
    lastPath.current = pathname;
    const heading = mainRef.current?.querySelector('h1');
    (heading ?? mainRef.current)?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <a href="#main" className="skip-link">Saltar al contenido</a>
      <Navbar />
      <PwaNotices />
      <main id="main" ref={mainRef} className="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
