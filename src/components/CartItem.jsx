import Card from './Card';
import Icon from './Icon';
import EventPoster from './EventPoster';
import QuantityStepper from './QuantityStepper';
import { formatMoney } from '../utils/format';
import './CartItem.css';

export default function CartItem({ line, max, onQtyChange, onRemove }) {
  const { event, zone } = line;
  return (
    <Card as="li" className="cart-item">
      <EventPoster event={event} className="cart-item__poster" />
      <div className="cart-item__info">
        <h3>{event.title}</h3>
        <p className="muted small">Zona {zone.name} · {formatMoney(zone.price)} c/u</p>
        <div className="cart-item__controls">
          <QuantityStepper
            value={line.qty}
            min={1}
            max={max}
            label={`Cantidad, ${event.title}, zona ${zone.name}`}
            onChange={(qty) => onQtyChange(line, qty)}
          />
          <button type="button" className="cart-item__remove" onClick={() => onRemove(line)}>
            <Icon name="trash" size={16} />
            <span>Quitar<span className="sr-only"> {event.title}, zona {zone.name}</span></span>
          </button>
        </div>
      </div>
      <p className="cart-item__total" aria-label={`Total de la línea ${formatMoney(line.lineTotal)}`}>
        {formatMoney(line.lineTotal)}
      </p>
    </Card>
  );
}
