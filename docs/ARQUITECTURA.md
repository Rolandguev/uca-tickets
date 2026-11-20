# Arquitectura de componentes y flujo de estado

## Árbol principal

```
App  (estado global: route, cart, session, orders, prefs, catalog)
├── Navbar  ← view, session, cartCount, onNavigate
├── main
│   └── [vista según route.view]
│       ├── EventsPage       ← catalog, orders, category, onCategory, onOpen
│       │   └── SearchBar, CategoryChips, EventCard(EventPoster, Badge, Button), Loader, ErrorMessage, EmptyState
│       ├── EventDetailPage  ← catalog, eventId, orders, onAdd, onBack
│       │   └── ProgressSteps(1), EventPoster, ZoneMap, ZoneList(RadioOption), QuantityStepper
│       ├── CartPage         ← lines, totals, orders, onQty, onRemove, onClear, onCheckout
│       │   └── ProgressSteps(2), CartItem(QuantityStepper), OrderSummary, Modal
│       ├── CheckoutPage     ← lines, totals, session, stockError, onPay
│       │   └── ProgressSteps(3), OrderSummary, Input, RadioOption, ErrorMessage, Button(loading)
│       ├── SuccessPage / FailedPage ← order
│       │   └── ProgressSteps(4|3), StatusScreen, DetailRows, Badge
│       ├── MyTicketsPage    ← orders (filtradas por sesión)
│       ├── TicketPage       ← order, itemIndex, onSend
│       │   └── TicketCard(QRCode, Badge)
│       ├── SentPage         ← order, onResend
│       └── PlaceholderPage  (vistas de la Persona B)
└── Footer  ← simulateErrors, onToggleSimulate
```

## Flujo de datos

- El estado vive en `App` y baja por props; las páginas avisan con callbacks (`onAdd`, `onPay`, `onQty`…).
- La lógica de negocio está en funciones puras en `utils/` (`addToCart`, `cartLines`, `totals`, `zoneAvailable`, `buildOrder`, `ticketsOf`), separada de React.
- `useLocalStorage` guarda automáticamente `cart`, `session`, `orders` y `prefs` con un `useEffect`, y sincroniza entre pestañas con el evento `storage` (con limpieza del listener).
- `useAsync` ejecuta las promesas simuladas de `utils/api.js` y expone `loading | success | error` y `reload`. Un flag `active` en la limpieza evita actualizar componentes desmontados.

## Secuencia de compra

```
EventDetailPage --onAdd--> App.setCart(addToCart) --> navigate('cart')
CartPage --onCheckout--> navigate('checkout')
CheckoutPage --onPay(values)--> App.handlePay
    processPayment() (1,5 s) --> 'pagado' | 'pendiente' | 'rechazado' | error de red
    buildOrder() --> setOrders([...orders, order])
    rechazado  --> navigate('failed')   (el carrito se conserva)
    otro       --> setCart([]) --> navigate('success')
    error red  --> CheckoutPage muestra ErrorMessage y permite reintentar
```

## Contrato con la Persona B

- `session`: `{ id, name, email, phone, role, active }` o `null`. Para iniciar sesión basta `setSession(user)`; para cerrarla, `setSession(null)`.
- `orders`: lista de órdenes `{ id, status, method, buyer, items[{eventId, zoneId, qty, unitPrice}], subtotal, fee, total, createdAt }`. Sirve para el dashboard y los reportes.
- `EVENTS` y `USERS` en `src/data/` alimentan la gestión de eventos, el inventario y los usuarios del panel admin.
- Las vistas `login` y `profile` ya existen en el `switch` de `App`: solo hay que cambiar `PlaceholderPage` por las pantallas reales.
