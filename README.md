# UCA TICKETS: Segunda entrega (React + Vite)

Aplicación React de venta de boletos para conciertos. Reproduce el prototipo de Figma de la primera entrega
(tema oscuro violeta/magenta) con datos simulados y persistencia en el navegador. No hay backend, pago real ni envío real de correos.

## Instalación y ejecución

```bash
npm install
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # versión de producción en dist/
npm run preview  # sirve la versión de producción
```

Requisitos: Node 20 o superior. Usa React 19, Vite 8 y la librería `qrcode` (solo genera el QR en el cliente).

## Flujo principal (se recorre de principio a fin)

1. **Eventos**: listado con búsqueda y filtro por categoría.
2. **Selección (paso 1/4)**: detalle del evento, mapa de zonas, precios, disponibilidad y cantidad.
3. **Carrito (paso 2/4)**: editar cantidades, quitar o vaciar (con confirmación) y ver el resumen.
4. **Pago (paso 3/4)**: datos del comprador y pago simulado (tarjeta, o transferencia/efectivo).
5. **Confirmación (paso 4/4)**: pago exitoso o pedido pendiente. Si se rechaza, se muestra la pantalla de error y el carrito se conserva.
6. **Mis boletos → Tu boleto**: boleto con QR, descargar (PNG) y "enviar por correo" (simulado).

Para la demo:
- Tarjeta aprobada: `4242 4242 4242 4242`, vencimiento futuro (ej. `12/28`), CVV `123`.
- Tarjeta rechazada: cualquier número válido que termine en `0000` (ej. `0000 0000 0000 0000`).
- Pie de página → **"Modo demostración: simular errores de red"**: hace fallar la carga de eventos, el pago y el correo para mostrar los estados de error con reintento.
- "Iniciar sesión": las cuentas de demostración están en la sección **Parte B**, al final de este archivo.

## Estructura

```
src/
  components/   componentes reutilizables (cada uno con su .css)
  pages/        vistas completas
  data/         datos simulados (eventos, usuarios, órdenes)
  hooks/        useLocalStorage, useAsync
  utils/        lógica pura: carrito, eventos, boletos, validaciones, formato, API simulada, QR
  styles/       tokens.css (Design System) y base.css
```

## Inventario de componentes

| Componente | Para qué sirve |
|---|---|
| `Logo` | Marca UCA TICKETS (botón para ir a eventos) |
| `Navbar` | Navegación principal, carrito con contador, avatar o "Iniciar sesión" |
| `Footer` | Redes, enlaces legales e interruptor de modo demostración |
| `Button` | Variantes primary / secondary / ghost / danger, tamaño sm y estado de carga |
| `Input` | Campo con `label`, ayuda y error accesibles (`aria-invalid`, `aria-describedby`) |
| `RadioOption` | Opción de radio con aspecto de tarjeta (zonas, método de pago) |
| `Card` | Superficie con borde y título opcional |
| `Badge` | Etiqueta de estado (success / warning / error / neutral / primary) |
| `Avatar` | Iniciales del usuario |
| `Modal` | Diálogo de confirmación basado en `<dialog>` |
| `Loader` | Indicador de carga (`role="status"`) |
| `EmptyState` | Estado vacío con acción |
| `ErrorMessage` | Error comprensible con botón de reintentar (`role="alert"`) |
| `Icon` | Iconos SVG decorativos |
| `ProgressSteps` | Indicador de progreso de 4 pasos (`aria-current="step"`) |
| `QuantityStepper` | Selector de cantidad − / + |
| `SearchBar` | Búsqueda de eventos |
| `CategoryChips` | Filtro por categoría (`aria-pressed`) |
| `EventPoster` | Afiche generado con CSS (con texto alternativo) |
| `EventCard` | Tarjeta de evento del listado |
| `ZoneMap` | Mapa SVG del recinto con zonas clicables |
| `ZoneList` | Detalle de precios y selector accesible de zona |
| `OrderSummary` | Resumen de compra: líneas, cargo por servicio y total |
| `CartItem` | Línea del carrito |
| `QRCode` | QR generado en el cliente |
| `TicketCard` | Boleto con zona, fila, asiento y QR |
| `StatusScreen` | Cabecera de las pantallas de resultado |
| `DetailRows` | Lista etiqueta / valor |

Vistas: `EventsPage`, `EventDetailPage`, `CartPage`, `CheckoutPage`, `SuccessPage`, `FailedPage`,
`MyTicketsPage`, `TicketPage` y `SentPage`. Las pantallas de cuentas, administración y reportes están en la sección **Parte B**.

## Mapa de estado y persistencia

| Estado | Dónde vive | localStorage | Quién lo cambia |
|---|---|---|---|
| `route` (vista actual + parámetros) | `App` | no | `navigate()` |
| `cart` `[{eventId, zoneId, qty}]` | `App` | `uca.cart` | detalle, carrito; se vacía al registrar la compra |
| `session` (usuario o `null`) | `App` | `uca.session` | login / logout (Persona B) |
| `orders` (órdenes) | `App` | `uca.orders` | pago (`handlePay`) |
| `prefs` `{category, simulateErrors}` | `App` | `uca.prefs` | filtro de categoría y modo demo |
| `catalog` (carga de eventos) | `App` vía `useAsync` | no | se recarga con "Reintentar" |
| Formularios, zona elegida, cantidad, modales | cada página | no | eventos locales |

Valores **derivados** (no se guardan duplicados): líneas y totales del carrito, contador del carrito,
disponibilidad de cada zona (inventario inicial menos lo vendido en `orders`), estado del evento
(disponible / últimos / agotado), "mis órdenes" según la sesión y los boletos individuales de cada orden.

## Datos simulados (`src/data/`)

- `events.js`: 8 eventos con categoría, fecha, lugar, paleta del afiche y 3 zonas (Ultra VIP, VIP, General) con precio y disponibilidad. Uno está agotado y uno tiene "últimos boletos".
- `users.js`: 4 usuarios con roles Cliente, Organizador y Administrador.
- `orders.js`: 6 órdenes de ejemplo (pagadas, pendientes y rechazada) para "Mis boletos" y los reportes.
- Cargo por servicio: 5 %. Máximo 8 boletos por zona en una compra.

## Accesibilidad y responsive

- Breakpoints: móvil (375 px), tablet (≥ 768 px) y escritorio (≥ 1024 px, probado a 1440 px), sin desbordes horizontales.
- HTML semántico (`header`, `nav`, `main`, `footer`, `fieldset`/`legend`, `dl`), enlace "Saltar al contenido".
- Al cambiar de vista el foco va al título `h1`; foco visible en todos los controles.
- Errores con `aria-invalid` + `aria-describedby` y foco en el primer campo inválido.
- Prevención de doble compra: botón deshabilitado y bloqueo con `useRef` mientras se procesa el pago.

## Limitaciones y decisiones

- Navegación por estado (sin React Router): el botón "atrás" del navegador no cambia de vista. Router llega en la tercera entrega.
- El QR es real (se puede escanear) pero solo contiene el código del boleto; no hay validación en la entrada.
- Fila y asiento se asignan de forma simulada a partir del código del boleto.
- Sin sesión, "Mis boletos" muestra las compras hechas como invitado en este navegador; con sesión, las del correo del usuario.
- Los afiches se generan con CSS para no depender de imágenes externas con derechos de autor.

## Capturas

En `docs/capturas/` hay capturas de cada pantalla en `movil-*`, `tablet-*` y `escritorio-*`.



## Parte B: cuentas, administración y reportes

### Cuentas de demostración

La sesión es simulada (sin servidor). Todas usan la contraseña `Demo1234`.

| Correo | Rol | Qué puede hacer |
|---|---|---|
| `maria.lopez@correo.com` | Cliente | Comprar y ver sus boletos |
| `carlos.perez@correo.com` | Organizador | Panel: resumen, eventos, inventario y precios, reportes |
| `ana.rivas@correo.com` | Administrador | Todo lo anterior y, además, gestionar usuarios |
| `jose.diaz@correo.com` | Cliente (cuenta desactivada) | No puede iniciar sesión |

### Pantallas

- `LoginPage`, `RegisterPage` (la cuenta nueva es Cliente y entra con sesión iniciada) y `RecoverPage`.
- `ProfilePage`: datos de la cuenta, rol y lo que permite cada rol.
- `AdminPage` (resumen): tarjetas de ventas pagadas, boletos vendidos, órdenes pendientes, eventos y usuarios activos, más la tabla de órdenes recientes.
- `AdminEventsPage`: tabla de eventos con crear, editar y eliminar (con confirmación).
- `AdminInventoryPage`: precio e inventario de cada zona, con filtro por evento.
- `AdminUsersPage`: listado de usuarios con su rol y activar/desactivar cuentas.
- `ReportsPage`: tarjetas (ingresos por boletos, boletos vendidos y evento con más ingresos) y tres gráficos de barras estáticos: ingresos por evento, ingresos por día y órdenes por estado.

### Inventario de componentes (Parte B)

| Componente | Para qué sirve |
|---|---|
| `StatCard` | Tarjeta de una métrica (etiqueta, valor y nota) |
| `DataTable` | Tabla reutilizable; en móvil cada fila se muestra como tarjeta, sin desborde horizontal |
| `BarChart` | Gráfico de barras hecho con HTML y CSS, sin librerías; cada barra lleva su valor escrito |
| `AccessDenied` | Pantalla cuando no hay sesión o el rol no tiene acceso |
| `AdminNav` | Barra de navegación del panel; muestra "Usuarios" solo al Administrador |
| `Notice` | Mensaje de confirmación anunciado a lectores de pantalla (`role="status"`) |
| `SelectField` | Lista desplegable con etiqueta y error accesibles (usa los estilos de `Input`) |
| `EventFormModal` | Formulario modal para crear y editar eventos |
| `ZoneFormModal` | Formulario modal para editar precio e inventario de una zona |

Hook: `useForm` (valores, errores, validación y envío sin doble clic de un formulario).
Utilidades: `roles.js` (roles y `hasAccess`), `authApi.js` (login, registro y recuperación simulados),
`authValidators.js`, `adminApi.js` (guardado simulado), `adminStats.js` (métricas y reportes),
`eventAdmin.js` (crear, editar y eliminar eventos y zonas) y `eventValidators.js`.
Datos: `accounts.js` (los usuarios de `users.js` con contraseña ficticia).

### Estado y persistencia (Parte B)

| Estado | Dónde vive | localStorage | Quién lo cambia |
|---|---|---|---|
| `session` | `App` | `uca.session` | login, registro y cerrar sesión |
| `users` | `App` | `uca.users` | registro y activar/desactivar en `AdminUsersPage` |
| `eventList` (eventos y zonas) | `App` | `uca.events` | `AdminEventsPage` y `AdminInventoryPage` |
| Formularios, modales, filtro de inventario, mensajes | cada página | no | eventos locales |

Valores **derivados** (no se guardan): métricas del panel, ventas por evento y por día, órdenes por estado,
disponibilidad de cada zona y estado de cada evento.
Cada guardado del panel simula una espera (`adminApi.js`) para mostrar el estado de carga; con
"simular errores de red" activado falla y muestra el error dentro de la ventana.

### Control de acceso por rol

`hasAccess(session, roles)` decide si se muestra una pantalla del panel o `AccessDenied`. Es solo visual:
al ser una sesión simulada no protege datos reales.

### Decisiones y limitaciones (Parte B)

- Las contraseñas se guardan en texto plano en `localStorage` únicamente porque es una demostración sin servidor. En un sistema real se guardarían con hash en el servidor.
- "Recuperar contraseña" no envía ningún correo y responde igual exista o no la cuenta, para no revelar qué correos están registrados.
- Un evento con órdenes de compra no se puede eliminar, para no perder el historial de boletos.
- Los ingresos de los reportes cuentan solo el precio de los boletos pagados, sin el cargo por servicio; por eso son menores que las "ventas pagadas" del panel.
- Un administrador no puede desactivar su propia cuenta.
- Los eventos nuevos nacen con las 3 zonas estándar; sus precios y cantidades se ajustan en "Inventario y precios".
- Los cambios se guardan en el navegador. Para volver a los datos de ejemplo, borra `uca.events` y `uca.users` del almacenamiento local.

### Capturas (Parte B)

En `docs/capturas/` están, con numeración del 11 al 19, las pantallas de esta parte en `movil-*`, `tablet-*` y `escritorio-*`:
`11-login`, `12-registro-errores`, `13-recuperar-enviado`, `14-perfil`, `15-panel`, `16-eventos`,
`16b-evento-formulario`, `17-inventario`, `18-usuarios` y `19-reportes`.