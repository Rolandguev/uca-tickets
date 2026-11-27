// Datos simulados: catálogo de eventos (8 eventos, 3 zonas por evento)
// "image" es relativa a la carpeta public/ (se sirve con el "base" de Vite).
// "available" es el inventario inicial; lo vendido en esta sesión se descuenta aparte.

export const FEE_RATE = 0.05; // cargo por servicio (5 %)
export const LOW_STOCK = 20; // desde aquí se muestra "Últimos boletos"
export const MAX_PER_ZONE = 8; // máximo de boletos por zona en una compra

export const CATEGORIES = [
  'Rock en Español',
  'Bachata',
  'Pop / Indie',
  'Tributo / Pop',
  'Festival',
  'Jazz',
  'Rock',
  'Clásica',
];

// Colores de zona (se usan por posición: 0 = la más cercana al escenario)
export const ZONE_COLORS = ['#3b82f6', '#a855f7', '#f59e0b'];

export const EVENTS = [
  {
    id: 'soda-stereo',
    title: 'Soda Stereo: Gracias Totales',
    artist: 'Homenaje a Soda Stereo',
    category: 'Rock en Español',
    date: '2027-03-27T19:00:00',
    venue: 'Hotel Real Intercontinental',
    city: 'San Salvador',
    description:
      'Una noche para cantar los clásicos del rock en español con una banda tributo de primer nivel y producción completa de luces y sonido.',
    palette: ['#111827', '#4b5563'],
    image: 'img/eventos/soda-stereo.svg',
    zones: [
      { id: 'ultra-vip', name: 'Ultra VIP', price: 75, available: 120 },
      { id: 'vip', name: 'VIP', price: 50, available: 250 },
      { id: 'general', name: 'General', price: 25, available: 15 },
    ],
  },
  {
    id: 'prince-royce',
    title: 'Prince Royce: Llamada Perdida Tour',
    artist: 'Prince Royce',
    category: 'Bachata',
    date: '2027-08-15T20:00:00',
    venue: 'Estadio Cuscatlán',
    city: 'San Salvador',
    description:
      'La gira que llena estadios con bachata, baile y los éxitos que han sonado por toda Latinoamérica.',
    palette: ['#7f1d1d', '#f97316'],
    image: 'img/eventos/prince-royce.svg',
    zones: [
      { id: 'ultra-vip', name: 'Ultra VIP', price: 90, available: 300 },
      { id: 'vip', name: 'VIP', price: 55, available: 800 },
      { id: 'general', name: 'General', price: 30, available: 2400 },
    ],
  },
  {
    id: 'natalia-lafourcade',
    title: 'Natalia Lafourcade: Cancionera Tour',
    artist: 'Natalia Lafourcade',
    category: 'Pop / Indie',
    date: '2027-09-22T19:30:00',
    venue: 'Salamanca Eventos',
    city: 'San Salvador',
    description:
      'Un concierto íntimo y cálido con canciones que mezclan raíces latinoamericanas, pop e indie.',
    palette: ['#1e3a8a', '#dc2626'],
    image: 'img/eventos/natalia-lafourcade.svg',
    zones: [
      { id: 'ultra-vip', name: 'Ultra VIP', price: 95, available: 90 },
      { id: 'vip', name: 'VIP', price: 60, available: 400 },
      { id: 'general', name: 'General', price: 40, available: 900 },
    ],
  },
  {
    id: 'this-is-michael',
    title: 'This is Michael: Lenny Jay',
    artist: 'Lenny Jay',
    category: 'Tributo / Pop',
    date: '2027-11-27T20:00:00',
    venue: 'Salamanca Eventos',
    city: 'San Salvador',
    description:
      'Espectáculo tributo al Rey del Pop con coreografías, vestuario y un repertorio de principio a fin.',
    palette: ['#0f766e', '#7c3aed'],
    image: 'img/eventos/this-is-michael.svg',
    zones: [
      { id: 'ultra-vip', name: 'Ultra VIP', price: 70, available: 80 },
      { id: 'vip', name: 'VIP', price: 50, available: 300 },
      { id: 'general', name: 'General', price: 35, available: 700 },
    ],
  },
  {
    id: 'uca-fest',
    title: 'UCA Fest 2026',
    artist: 'Varios artistas',
    category: 'Festival',
    date: '2026-12-12T19:00:00',
    venue: 'Campus UCA',
    city: 'Antiguo Cuscatlán',
    description:
      'El festival de fin de año de la UCA: bandas universitarias, artistas invitados y comida en el campus.',
    palette: ['#5b21b6', '#be185d'],
    image: 'img/eventos/uca-fest.svg',
    zones: [
      { id: 'ultra-vip', name: 'Ultra VIP', price: 60, available: 60 },
      { id: 'vip', name: 'VIP', price: 40, available: 150 },
      { id: 'general', name: 'General', price: 25, available: 1200 },
    ],
  },
  {
    id: 'noche-de-jazz',
    title: 'Noche de Jazz UCA',
    artist: 'Cuarteto Cuscatlán',
    category: 'Jazz',
    date: '2026-12-18T19:00:00',
    venue: 'Auditorio UCA',
    city: 'Antiguo Cuscatlán',
    description:
      'Standards de jazz y arreglos de música salvadoreña en una noche tranquila dentro del auditorio.',
    palette: ['#1e293b', '#0e7490'],
    image: 'img/eventos/noche-de-jazz.svg',
    zones: [
      { id: 'ultra-vip', name: 'Ultra VIP', price: 60, available: 40 },
      { id: 'vip', name: 'VIP', price: 45, available: 100 },
      { id: 'general', name: 'General', price: 30, available: 220 },
    ],
  },
  {
    id: 'rock-en-la-uca',
    title: 'Rock en la UCA',
    artist: 'Bandas locales',
    category: 'Rock',
    date: '2027-01-23T18:00:00',
    venue: 'Anfiteatro UCA',
    city: 'Antiguo Cuscatlán',
    description:
      'Seis bandas locales en un mismo escenario, con sets cortos y mucho volumen.',
    palette: ['#27272a', '#b91c1c'],
    image: 'img/eventos/rock-en-la-uca.svg',
    zones: [
      { id: 'ultra-vip', name: 'Ultra VIP', price: 80, available: 50 },
      { id: 'vip', name: 'VIP', price: 60, available: 120 },
      { id: 'general', name: 'General', price: 40, available: 500 },
    ],
  },
  {
    id: 'concierto-de-gala',
    title: 'Concierto de Gala',
    artist: 'Orquesta Sinfónica Nacional',
    category: 'Clásica',
    date: '2027-02-20T19:00:00',
    venue: 'Teatro Nacional',
    city: 'San Salvador',
    description:
      'Programa de gala con obras clásicas y una pieza estrenada para la ocasión. Entradas agotadas.',
    palette: ['#3b0764', '#a16207'],
    image: 'img/eventos/concierto-de-gala.svg',
    zones: [
      { id: 'ultra-vip', name: 'Ultra VIP', price: 100, available: 0 },
      { id: 'vip', name: 'VIP', price: 80, available: 0 },
      { id: 'general', name: 'General', price: 60, available: 0 },
    ],
  },
];
