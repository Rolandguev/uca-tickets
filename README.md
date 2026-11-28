# UCA TICKETS: Tercera entrega (PWA con React + Vite)

Plataforma web de venta y gestión de boletos para conciertos, hecha con React 19 y Vite 8. Esta entrega la convierte en una
**PWA instalable** que funciona sin conexión, con React Router, estado global con Context y `useReducer`, una **API falsa local**,
panel de administración con CRUD, reportes y boletos con código QR verificable.

- **URL publicada:** https://rolandguev.github.io/uca-tickets/
- **Repositorio:** https://github.com/Rolandguev/uca-tickets

**Alcance:** los 8 módulos del MVP (usuarios y autenticación, eventos, inventario y precios, proceso de compra, pagos,
boletos electrónicos, panel de administración y reportes). No hay backend, base de datos, pago real ni envío real de correos:
la autenticación, los pagos, el correo y todas las mutaciones son **simulados** y se guardan en el navegador (`localStorage`).

## Instalación y ejecución

```bash
npm install
npm run dev      # servidor de desarrollo (http://localhost:5173/uca-tickets/)
npm run build    # versión de producción en dist/
npm run preview  # sirve la versión de producción (permite probar la PWA)
```

Requisitos: Node 20 o superior (probado con Node 22). Dependencias principales: React 19, React Router 8 (modo datos),
`qrcode` (genera el QR en el cliente) y `vite-plugin-pwa` (manifest y service worker con Workbox).

`npm run dev` y `npm run build` ejecutan antes `scripts/export-api.mjs`, que genera `public/api/events.json`
(la semilla de la API falsa) a partir de `src/data/events.js`.

## Mapa de rutas

React Router en modo datos: `createBrowserRouter` y `RouterProvider` (`src/routes/router.jsx`). Todas las rutas cuelgan de un
layout compartido (`RootLayout`: enlace de salto, barra superior, contenido y pie) con página 404 y `errorElement`.
El `basename` sale de la `base` de Vite (`/uca-tickets/`). Las rutas del boleto y de verificación se cargan de forma diferida (`lazy`).

| Ruta | Contenido | Acceso |
|---|---|---|
| `/` | Inicio con próximos eventos y destacados | Público |
| `/eventos` | Listado, búsqueda y filtro por categoría | Público |
| `/eventos/:id` | Detalle del evento, zonas y precios | Público |
| `/carrito` | Carrito y resumen | Público |
| `/checkout` | Pago simulado | Público |
| `/checkout/confirmacion/:orderId` | Confirmación de la orden | Público |
| `/checkout/rechazado/:orderId` | Pago rechazado | Público |
| `/boletos` | Boletos del usuario (sin sesión, las compras hechas como invitado) | Público |
| `/boletos/:orderId/:itemIndex` | Boleto con QR | Público |
| `/boletos/enviado/:orderId` | Confirmación del "correo" simulado | Público |
| `/verificar/:code` | Verificación de un boleto (firma del QR) | Público |
| `/login`, `/registro`, `/recuperar` | Cuenta | Público |
| `/perfil` | Perfil y rol | Autenticado (sin sesión redirige a `/login`) |
| `/admin`, `/admin/eventos`, `/admin/inventario` | Panel, CRUD de eventos, inventario y precios | Administrador u Organizador |
| `/admin/usuarios`, `/admin/reportes` | Usuarios y reportes por evento y periodo | Administrador |
| `*` | Página 404 | Público |

Las rutas protegidas usan el componente `RequireRole` (`src/routes/RequireRole.jsx`): sin sesión redirige a `/login`;
con sesión pero sin el rol muestra "acceso denegado". La protección es simulada y no sustituye a la de un servidor.

## Flujo principal (se recorre de principio a fin)

1. **Eventos**: listado con búsqueda y filtro por categoría.
2. **Selección (paso 1/4)**: detalle del evento, mapa de zonas, precios, disponibilidad y cantidad.
3. **Carrito (paso 2/4)**: editar cantidades, quitar o vaciar (con confirmación) y ver el resumen.
4. **Pago (paso 3/4)**: datos del comprador y pago simulado (tarjeta, o transferencia/efectivo).
5. **Confirmación (paso 4/4)**: pago exitoso o pedido pendiente. Si se rechaza, se muestra la pantalla de error y el carrito se conserva.
6. **Mis boletos → Tu boleto**: boleto con precio, QR verificable, descargar (PNG) y "enviar por correo" (simulado).

Para la demo:
- Tarjeta aprobada: `4242 4242 4242 4242`, vencimiento futuro (ej. `12/28`), CVV `123`.
- Tarjeta rechazada: cualquier número válido que termine en `0000` (ej. `0000 0000 0000 0000`).
- Pie de página → **"Modo demostración: simular errores de red"**: hace fallar la carga de eventos, el pago y el correo para mostrar los estados de error con reintento.

## Credenciales de prueba y roles

La sesión es simulada (sin servidor). Todas las cuentas usan la contraseña `Demo1234`.

| Correo | Rol | Qué puede hacer |
|---|---|---|
| `maria.lopez@correo.com` | Cliente | Comprar, ver sus boletos y su perfil |
| `carlos.perez@correo.com` | Organizador | Lo anterior y el panel: resumen, eventos, inventario y precios |
| `ana.rivas@correo.com` | Administrador | Todo lo anterior y, además, usuarios y reportes |
| `jose.diaz@correo.com` | Cliente (cuenta desactivada) | No puede iniciar sesión |

Las cuentas nuevas que se registran en la app tienen el rol Cliente y entran con la sesión iniciada.

## Estructura

```
src/
  api/          API falsa: client, events, users y orders (latencia, localStorage y AbortController)
  components/   componentes reutilizables (cada uno con su .css)
  context/      Context + useReducer: sesión, carrito, preferencias y datos (AppProviders)
  data/         datos de ejemplo (eventos, usuarios y órdenes)
  hooks/        useLocalStorage, usePersistentReducer, useAsync, useForm, useOnlineStatus, useInstallPrompt
  pages/        vistas completas
  routes/       React Router: router.jsx, layout, guardia RequireRole y tablas de rutas
  styles/       tokens.css (Design System) y base.css
  utils/        lógica pura: carrito, eventos, boletos, validaciones, formato, roles, estadísticas, QR y verificación
public/         iconos y manifest de la PWA, imágenes de eventos y .nojekyll
scripts/        export-api.mjs (genera la semilla de la API falsa)
```

## API falsa y mapeo de datos

No hay backend. Se usa la estrategia de **API falsa local**: el módulo `src/api` lee datos de archivos JSON, simula latencia y
persiste las escrituras en `localStorage`. No se usa DummyJSON, así que no hay mapeo de campos externos: los datos ya están en el
dominio de la aplicación (eventos, zonas, órdenes y usuarios).

| Archivo | Qué ofrece |
|---|---|
| `src/api/client.js` | `delay` y `request` (latencia y error simulado, cancelables con `AbortController`), `fetchSeed` (lee `api/events.json` con `fetch`), `loadTable` / `saveTable` (localStorage) y `KEYS` |
| `src/api/events.js` | `listEvents`, `getEvent`, `createEvent`, `editEvent`, `deleteEvent` y `editZone` (precios e inventario) |
| `src/api/users.js` | `listUsers`, `login`, `register`, `recover` y `toggleUser` |
| `src/api/orders.js` | `listOrders`, `createOrder`, `processPayment` y `sendTicketEmail` |

- **Separación:** los componentes no llaman a `fetch` ni a `localStorage`; las pantallas reciben los datos y las acciones desde `DataContext`, que usa `src/api`.
- **Estados:** carga (`Loader`), error con botón de reintentar (`ErrorMessage`) y vacío (`EmptyState`). El interruptor "Modo demostración: simular errores de red" del pie de página hace fallar la API para mostrarlos.
- **Cancelación:** la carga de eventos usa un `AbortController`; si el usuario sale de la pantalla o recarga, la petición en curso se cancela y no se actualiza el estado.
- **Semillas de datos:** `scripts/export-api.mjs` genera `public/api/events.json` desde `src/data/events.js` antes de `dev` y `build` (el archivo no se sube al repositorio). Las órdenes y los usuarios parten de `src/data/orders.js` y `src/data/accounts.js`.
- **Persistencia (`localStorage`):** `uca.events`, `uca.orders`, `uca.users`, `uca.session`, `uca.cart` y `uca.prefs`. Para volver a los datos de ejemplo, borra esas claves del almacenamiento local.

## Estado global (Context y `useReducer`)

Los proveedores están en `src/context/AppProviders.jsx`, en este orden: `PrefsProvider` → `SessionProvider` → `DataProvider` → `CartProvider`.
El hook `usePersistentReducer` guarda el estado de cada reducer en `localStorage`. Las pantallas consumen el estado con
`useSession`, `useCart`, `usePrefs` y `useData`, sin pasar props por varios niveles.

| Estado | Dónde vive | localStorage | Acciones / quién lo cambia |
|---|---|---|---|
| `session` (usuario o `null`) | `SessionContext` (`useReducer`) | `uca.session` | `LOGIN`, `LOGOUT`, `UPDATE_PROFILE` |
| `cart` `[{eventId, zoneId, qty}]` | `CartContext` (`useReducer`) | `uca.cart` | `ADD_ITEM`, `SET_QTY`, `REMOVE_ITEM`, `CLEAR` |
| `prefs` `{category, simulateErrors}` | `PrefsContext` (`useReducer`) | `uca.prefs` | `SET_CATEGORY`, `SET_SIMULATE_ERRORS` |
| `catalog` (carga de eventos) | `DataContext` | no | se recarga con "Reintentar" |
| `events`, `orders`, `users` | `DataContext` (vía `src/api`) | `uca.events`, `uca.orders`, `uca.users` | pago, registro, panel de administración |
| Formularios, zona elegida, cantidad, modales, filtros | cada página | no | eventos locales |

Valores **derivados** (no se guardan duplicados): líneas y totales del carrito, contador del carrito, disponibilidad de cada zona
(inventario inicial menos lo vendido en `orders`), estado del evento (disponible / últimos / agotado), "mis órdenes" según la sesión,
los boletos de cada orden, las métricas del panel y los reportes.

## PWA y estrategias de caché

Configurada en `vite.config.js` con `vite-plugin-pwa` (Workbox, service worker generado, `registerType: 'prompt'`).

- **Manifest:** nombre, descripción, `start_url` y `scope` (`/uca-tickets/`), `display: standalone`, colores `#0b0b14` e iconos de 192×192, 512×512 y una variante **maskable** (en `public/icons/`).
- **Instalación:** Chrome y Edge muestran el icono de instalar en la barra de direcciones.

| Recurso | Estrategia | Detalle |
|---|---|---|
| App shell (HTML, JS, CSS, iconos) | Precache | Se guarda al instalar el service worker |
| Navegación a cualquier ruta | `navigateFallback` | Abre `index.html`, así `/eventos/:id` y `/admin` cargan sin red |
| API falsa (`api/*.json`) | `NetworkFirst` | Espera la red 3 s; sin conexión usa lo último guardado (caché `uca-api`, 20 entradas, 7 días) |
| Imágenes de eventos | `CacheFirst` | Caché `uca-imagenes` (60 entradas, 30 días) |
| Google Fonts | `StaleWhileRevalidate` (CSS) y `CacheFirst` (archivos) | Cachés `google-fonts-css` y `google-fonts` |

**Avisos** (componente `PwaNotices`): barra "Sin conexión" mientras no hay red, "Listo: la app ya funciona sin conexión" la primera
vez, y "Hay una nueva versión" con botones Actualizar y Después. Busca actualizaciones cada hora.

**Cómo verificarla:** en Chrome, `F12` → *Application* → *Manifest* y *Service Workers*; luego *Network* → marcar *Offline* y recargar.
En desarrollo (`npm run dev`) el service worker no está activo; para probarlo en local usa `npm run build` y `npm run preview`.

## Despliegue en GitHub Pages

- `base: '/uca-tickets/'` en `vite.config.js` (nombre del repositorio) y el `basename` de React Router sale de esa misma base.
- `public/.nojekyll` evita que Pages procese los archivos con Jekyll.
- El workflow `.github/workflows/deploy.yml` se ejecuta en cada push a `main`: `npm ci`, `npm run build`, copia `dist/index.html` a
  `dist/404.html` (así las rutas profundas funcionan al recargar) y publica `dist/` con las acciones oficiales de Pages.
- **Activarlo una vez:** *Settings → Pages → Source → GitHub Actions* (lo hace el dueño del repositorio).
- **Verificación:** abrir https://rolandguev.github.io/uca-tickets/, recargar `/eventos/<id>` y `/admin`, instalar la app y probar el modo sin conexión.

## Inventario de componentes

| Componente | Para qué sirve |
|---|---|
| `Logo` | Marca UCA TICKETS (enlace a inicio) |
| `Navbar` | Navegación principal con `NavLink`, carrito con contador, avatar o "Iniciar sesión" |
| `Footer` | Redes, enlaces legales e interruptor de modo demostración |
| `Button` | Variantes primary / secondary / ghost / danger, tamaño sm y estado de carga |
| `Input` | Campo con `label`, ayuda y error accesibles (`aria-invalid`, `aria-describedby`) |
| `SelectField` | Lista desplegable con etiqueta y error accesibles (usa los estilos de `Input`) |
| `RadioOption` | Opción de radio con aspecto de tarjeta (zonas, método de pago) |
| `Card` | Superficie con borde y título opcional |
| `Badge` | Etiqueta de estado (success / warning / error / neutral / primary) |
| `Avatar` | Iniciales del usuario |
| `Modal` | Diálogo basado en `<dialog>` |
| `Loader` | Indicador de carga (`role="status"`) |
| `EmptyState` | Estado vacío con acción |
| `ErrorMessage` | Error comprensible con botón de reintentar (`role="alert"`) |
| `Notice` | Mensaje de confirmación anunciado a lectores de pantalla (`role="status"`) |
| `Icon` | Iconos SVG decorativos |
| `ProgressSteps` | Indicador de progreso de 4 pasos (`aria-current="step"`) |
| `QuantityStepper` | Selector de cantidad − / + |
| `SearchBar` | Búsqueda de eventos |
| `CategoryChips` | Filtro por categoría (`aria-pressed`) |
| `EventPoster` | Afiche del evento con texto alternativo |
| `EventCard` | Tarjeta de evento del listado |
| `ZoneMap` | Mapa SVG del recinto con zonas clicables |
| `ZoneList` | Detalle de precios y selector accesible de zona |
| `OrderSummary` | Resumen de compra: líneas, cargo por servicio y total |
| `CartItem` | Línea del carrito |
| `QRCode` | QR generado en el cliente |
| `TicketCard` | Boleto con zona, fila, asiento, precio y QR |
| `StatusScreen` | Cabecera de las pantallas de resultado |
| `DetailRows` | Lista etiqueta / valor |
| `PwaNotices` | Avisos de la PWA: sin conexión, lista para offline y nueva versión |
| `StatCard` | Tarjeta de una métrica (etiqueta, valor y nota) |
| `DataTable` | Tabla reutilizable; en móvil cada fila se muestra como tarjeta, sin desborde horizontal |
| `BarChart` | Gráfico de barras hecho con HTML y CSS, sin librerías; cada barra lleva su valor escrito |
| `AccessDenied` | Pantalla cuando no hay sesión o el rol no tiene acceso |
| `AdminNav` | Barra de navegación del panel; muestra "Usuarios" y "Reportes" solo al Administrador |
| `EventFormModal` | Formulario modal para crear y editar eventos |
| `ZoneFormModal` | Formulario modal para editar precio e inventario de una zona |

## Pantallas

- **Compra:** `HomePage`, `EventsPage`, `EventDetailPage`, `CartPage`, `CheckoutPage`, `SuccessPage`, `FailedPage`, `MyTicketsPage`, `TicketPage`, `SentPage` y `VerifyPage`.
- **Cuenta:** `LoginPage`, `RegisterPage` y `RecoverPage`; `ProfilePage` con los datos de la cuenta, el rol y lo que permite cada rol.
- **Panel (Administrador u Organizador):** `AdminPage` (tarjetas de ventas pagadas, boletos vendidos, órdenes pendientes, eventos y usuarios activos, más órdenes recientes), `AdminEventsPage` (crear, editar y eliminar eventos con confirmación) y `AdminInventoryPage` (precio e inventario de cada zona, con filtro por evento).
- **Solo Administrador:** `AdminUsersPage` (usuarios con su rol; activar y desactivar cuentas) y `ReportsPage` (tarjetas y tres gráficos de barras: ingresos por evento, por día y órdenes por estado, con filtro por evento y por periodo).

Utilidades de la parte de cuentas y administración: `roles.js` (roles y `hasAccess`), `authValidators.js`, `adminStats.js` (métricas, reportes y `filterOrders`),
`eventAdmin.js` (crear, editar y eliminar eventos y zonas) y `eventValidators.js`. Hook `useForm` (valores, errores, validación y envío sin doble clic).

## Datos simulados (`src/data/`)

- `events.js`: 8 eventos con categoría, fecha, lugar, paleta del afiche y 3 zonas (Ultra VIP, VIP, General) con precio y disponibilidad. Uno está agotado y uno tiene "últimos boletos".
- `users.js` y `accounts.js`: 4 usuarios con roles Cliente, Organizador y Administrador (`accounts.js` les agrega la contraseña de demostración).
- `orders.js`: 6 órdenes de ejemplo (pagadas, pendientes y rechazada) para "Mis boletos" y los reportes.
- Cargo por servicio: 5 %. Máximo 8 boletos por zona en una compra.

## Accesibilidad y responsive

- Breakpoints: móvil (375 px), tablet (≥ 768 px) y escritorio (≥ 1024 px, probado a 1440 px), sin desbordes horizontales. En el panel, las tablas pasan a tarjetas en móvil.
- HTML semántico (`header`, `nav`, `main`, `footer`, `fieldset`/`legend`, `dl`), enlace "Saltar al contenido".
- Al cambiar de ruta el foco va al título `h1` y el título de la pestaña cambia; foco visible en todos los controles.
- Errores con `aria-invalid` + `aria-describedby` y foco en el primer campo inválido; mensajes de estado con `role="status"` y `role="alert"`.
- Afiches con texto alternativo y QR con alternativa textual (código del boleto).
- Prevención de doble envío: botón deshabilitado y bloqueo con `useRef` mientras se procesa el pago o se guarda un formulario.

## Limitaciones y decisiones

- Todo es simulado: sesión, pagos, correo y escrituras. Los datos viven en el `localStorage` de cada navegador y no se comparten entre dispositivos.
- Las contraseñas de demostración se guardan en texto plano en `localStorage` únicamente porque no hay servidor. En un sistema real se guardarían con hash en el servidor.
- Las rutas protegidas lo están solo en el cliente: sirven para mostrar la interfaz correcta, no para proteger datos reales.
- "Recuperar contraseña" no envía ningún correo y responde igual exista o no la cuenta, para no revelar qué correos están registrados.
- El QR del boleto codifica una URL de verificación (`/verificar/<código>?f=<firma>`). La firma se calcula en el cliente con un valor de demostración, por lo que no es seguridad real.
- Sin sesión, "Mis boletos" muestra las compras hechas como invitado en este navegador; con sesión, las del correo del usuario.
- Un evento con órdenes de compra no se puede eliminar, para no perder el historial de boletos. Un administrador no puede desactivar su propia cuenta.
- Los ingresos de los reportes cuentan solo el precio de los boletos pagados, sin el cargo por servicio; por eso son menores que las "ventas pagadas" del panel.
- Los eventos nuevos nacen con las 3 zonas estándar; sus precios y cantidades se ajustan en "Inventario y precios".
- El service worker solo está activo en la versión de producción (`npm run build` / `npm run preview` o la URL publicada).

## Capturas

En `docs/capturas/` están las pantallas en tres tamaños: `movil-*` (375 px), `tablet-*` (768 px) y `escritorio-*` (1440 px).

Parte de cuentas y administración: panel de administración (`15-panel`) y reportes con filtros por evento y periodo (`19-reportes`).
También están el inicio de sesión, el registro, el perfil, los eventos, el inventario y los usuarios (`11` a `18`).
