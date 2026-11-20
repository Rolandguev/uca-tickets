// Iconos SVG simples (decorativos: aria-hidden). El texto accesible lo pone quien los usa.
const PATHS = {
  cart: 'M3 4h2l2.4 10.2a2 2 0 0 0 2 1.5h7.3a2 2 0 0 0 1.9-1.4L20 8H6.2M9 20a1 1 0 1 0 0 .01M17 20a1 1 0 1 0 0 .01',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6L6 18',
  mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3',
  pin: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8v4l3 2',
};

export default function Icon({ name, size = 20, strokeWidth = 2 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
