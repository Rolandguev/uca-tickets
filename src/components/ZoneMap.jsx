import { ZONE_COLORS } from '../data/events';
import './ZoneMap.css';

// Mapa del recinto: escenario y tres zonas en anillos. Es un apoyo visual con clic;
// la selección accesible (teclado y lector de pantalla) está en <ZoneList>.
const CX = 200;
const CY = 60;
const RINGS = [[52, 92], [96, 138], [142, 192]];
const TEXT = ['#ffffff', '#ffffff', '#0b0b14'];

function point(r, deg) {
  const rad = (deg * Math.PI) / 180;
  return [CX + r * Math.sin(rad), CY + r * Math.cos(rad)];
}

function sector(r0, r1, a0 = -60, a1 = 60) {
  const [ox0, oy0] = point(r1, a0);
  const [ox1, oy1] = point(r1, a1);
  const [ix1, iy1] = point(r0, a1);
  const [ix0, iy0] = point(r0, a0);
  return `M${ox0} ${oy0} A${r1} ${r1} 0 0 0 ${ox1} ${oy1} L${ix1} ${iy1} A${r0} ${r0} 0 0 1 ${ix0} ${iy0} Z`;
}

export default function ZoneMap({ event, selectedId, getAvailable, onSelect }) {
  return (
    <svg className="zone-map" viewBox="0 0 400 262" aria-hidden="true" focusable="false">
      <rect x="132" y="6" width="136" height="40" rx="6" className="zone-map__stage" />
      <text x="200" y="31" textAnchor="middle" className="zone-map__stage-text">ESCENARIO</text>

      {event.zones.slice(0, 3).map((zone, i) => {
        const [r0, r1] = RINGS[i];
        const soldOut = getAvailable(zone) === 0;
        const selected = zone.id === selectedId;
        const [tx, ty] = point((r0 + r1) / 2, 0);
        return (
          <g
            key={zone.id}
            className={`zone-map__zone${selected ? ' is-selected' : ''}${soldOut ? ' is-soldout' : ''}`}
            onClick={() => !soldOut && onSelect(zone.id)}
          >
            <path d={sector(r0, r1)} fill={ZONE_COLORS[i]} />
            <text x={tx} y={ty - 2} textAnchor="middle" fill={TEXT[i]} className="zone-map__name">{zone.name}</text>
            <text x={tx} y={ty + 14} textAnchor="middle" fill={TEXT[i]} className="zone-map__price">${zone.price}</text>
          </g>
        );
      })}
    </svg>
  );
}
