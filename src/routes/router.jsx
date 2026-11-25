import { createBrowserRouter } from 'react-router';
import RootLayout from './RootLayout';
import RouteError from './RouteError';
import NotFoundPage from './NotFoundPage';
import { purchaseRoutes } from './purchaseRoutes';
import { accountRoutes } from './accountRoutes';

// React Router en modo datos. basename sale de "base" en vite.config.js
// (en GitHub Pages será "/uca-tickets/"; en local, "/").
export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <RouteError />,
      children: [
        ...purchaseRoutes,
        ...accountRoutes,
        { path: '*', element: <NotFoundPage />, handle: { title: 'Página no encontrada' } },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
