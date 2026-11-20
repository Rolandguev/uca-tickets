import RadioOption from './RadioOption';
import { ZONE_COLORS, LOW_STOCK } from '../data/events';
import { formatMoney } from '../utils/format';
import './ZoneList.css';

// Detalle de precios y selector de zona (grupo de radios, accesible por teclado)
export default function ZoneList({ event, selectedId, getAvailable, onSelect }) {
  return (
    <fieldset className="zone-list">
      <legend className="zone-list__legend">Detalle de precios</legend>
      {event.zones.map((zone, i) => {
        const available = getAvailable(zone);
        const soldOut = available === 0;
        const low = available > 0 && available <= LOW_STOCK;
        return (
          <RadioOption
            key={zone.id}
            name={`zone-${event.id}`}
            value={zone.id}
            checked={zone.id === selectedId}
            disabled={soldOut}
            onChange={onSelect}
          >
            <span className="zone-row">
              <span className="zone-row__swatch" style={{ background: ZONE_COLORS[i] }} aria-hidden="true" />
              <span className="zone-row__name">{zone.name}</span>
              <span className="zone-row__price">{formatMoney(zone.price)}</span>
              <span className={`zone-row__stock${soldOut || low ? ' is-low' : ''}`}>
                {soldOut ? 'Agotado' : low ? `Últimos: ${available}` : `Disponibles: ${available}`}
              </span>
            </span>
          </RadioOption>
        );
      })}
    </fieldset>
  );
}
