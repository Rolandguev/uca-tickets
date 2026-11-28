# Arquitectura y decisiones

Documento breve de la tercera entrega. El detalle de rutas, API, PWA y despliegue está en el `README.md`.

## Capas

```
index.html → main.jsx
  <AppProviders>                      estado global (Context + useReducer)
    <RouterProvider router>           React Router en modo datos (src/routes)
      RootLayout                      enlace de salto, Navbar, <Outlet />, Footer, PwaNotices
        rutas públicas, de cuenta y de administración
  src/api                             API falsa (fetch, latencia, localStorage, AbortController)
  src/utils                           lógica pura (carrito, boletos, estadísticas, roles, QR)
  service worker (Workbox)            precache, caché de API e imágenes, aviso de actualización
```

Cada capa solo conoce a la de abajo: los componentes no llaman a `fetch` ni a `localStorage`, las pantallas piden datos al Context,
y el Context los pide a `src/api`.

## Proveedores de estado (`src/context`)

```
PrefsProvider      categoría elegida y modo "simular errores"          (useReducer, uca.prefs)
└ SessionProvider  usuario con sesión o null                           (useReducer, uca.session)
  └ DataProvider   eventos (catalog), órdenes y usuarios, vía src/api  (uca.events, uca.orders, uca.users)
    └ CartProvider carrito [{eventId, zoneId, qty}]                    (useReducer, uca.cart)
```

El orden importa: `DataProvider` necesita las preferencias (errores simulados) y la sesión; `CartProvider` necesita los eventos
para calcular líneas y totales. `usePersistentReducer` guarda cada reducer en `localStorage` y lo sincroniza entre pestañas.

## Rutas y control de acceso

- `src/routes/router.jsx` crea el router con `createBrowserRouter`; el `basename` sale de `import.meta.env.BASE_URL`.
- `purchaseRoutes.jsx` (catálogo, compra y boletos) y `accountRoutes.jsx` (cuenta y administración) son tablas de rutas.
  Cada "Screen" lee el Context y los parámetros de la URL y se los pasa a una página.
- `paths.js` traduce nombres de vista (`'event'`, `'admin'`…) a URL, para que las páginas sigan usando `onNavigate('admin')`.
- `RequireRole` es una ruta de layout: sin sesión redirige a `/login`; sin el rol muestra `AccessDenied`; si todo está bien, renderiza `<Outlet />`.
  Se anida: `/admin` pide Administrador u Organizador y, dentro, `/admin/usuarios` y `/admin/reportes` piden Administrador.
- Las pantallas del boleto y de verificación se cargan con `lazy`, porque son las únicas que usan la librería del QR.

## Flujo de datos

1. `DataProvider` pide los eventos con `listEvents` dentro de un `useEffect` con `AbortController`; guarda `{status, data, error}`
   (`loading`, `success`, `error`) y ofrece `reload`. Si el componente se desmonta o se recarga, la petición se cancela.
2. Las páginas muestran `Loader`, `ErrorMessage` (con "Reintentar") o `EmptyState` según ese estado.
3. Para escribir (crear evento, editar zona, activar usuario, registrar orden) el Context llama a la función de `src/api`, que simula la
   latencia, guarda en `localStorage` y devuelve la lista actualizada; el Context la guarda en su estado y la interfaz se actualiza.
4. Los valores derivados (disponibilidad, estado del evento, métricas, reportes, "mis órdenes") se calculan con funciones puras y no se guardan.

## Secuencia de compra

```
EventDetailPage --addItem--> CartContext (ADD_ITEM) --> /carrito
CartPage --continuar--> /checkout
CheckoutPage --onPay(values)--> processPayment() (src/api/orders, 1,5 s)
    'pagado' | 'pendiente' | 'rechazado' | error de red
    buildOrder() --> addOrder(order)        (se ve de inmediato y se guarda en localStorage)
    rechazado  --> /checkout/rechazado/:orderId   (el carrito se conserva)
    otro       --> CLEAR del carrito --> /checkout/confirmacion/:orderId
    error red  --> CheckoutPage muestra ErrorMessage y permite reintentar
Mis boletos --> TicketPage: QR con URL /verificar/<código>?f=<firma> --> VerifyPage comprueba la firma
```

## Sesión, roles y administración

```
LoginPage --onLogin(values)--> users.login() (900 ms) --> SessionContext LOGIN --> /eventos
RegisterPage --> DataContext.registerUser() --> users.register() --> LOGIN (rol Cliente)
Panel: AdminEventsPage / AdminInventoryPage / AdminUsersPage --> DataContext --> src/api --> localStorage
ReportsPage: filterOrders(orders, {evento, desde, hasta}) --> salesByEvent / salesByDay / ordersByStatus
```

## PWA y modo sin conexión

1. `vite-plugin-pwa` genera el manifest y el service worker. En la primera visita se guarda el *app shell* (precache).
2. Navegar a cualquier ruta sin red devuelve `index.html` (`navigateFallback`) y React Router muestra la pantalla.
3. `api/events.json` usa `NetworkFirst`: con red se actualiza; sin red se usa la última copia. Las imágenes usan `CacheFirst`.
4. Los cambios hechos en el panel y las órdenes están en `localStorage`, así que también están disponibles sin conexión.
5. `PwaNotices` muestra "Sin conexión", "Lista para usar sin conexión" y "Hay una nueva versión" (con botón Actualizar).

## Decisiones

| Decisión | Motivo |
|---|---|
| React Router en modo datos | Rutas reales y profundas, layout compartido, 404 y `errorElement` |
| Context + `useReducer` por dominio (sesión, carrito, preferencias) | Evita pasar props por varios niveles y deja las acciones explícitas |
| `DataContext` separado de los reducers | Los datos vienen de una API asíncrona (con carga y error); los reducers son síncronos |
| API falsa local en `src/api` y no DummyJSON | Funciona sin red, los datos ya están en el dominio de la app y las mutaciones se pueden persistir |
| Lógica en funciones puras (`utils/`) | Se prueba sin React y se reutiliza (panel, reportes, boletos) |
| `registerType: 'prompt'` en la PWA | La app avisa de una versión nueva en vez de recargarse sola y perder lo que el usuario hace |
| `404.html` copia de `index.html` | GitHub Pages no tiene servidor: así las rutas profundas cargan al recargar |
| Guardias de ruta simuladas | No hay servidor; sirven para mostrar la interfaz correcta, no para proteger datos |
