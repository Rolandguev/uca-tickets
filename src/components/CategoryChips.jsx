import { cx } from '../utils/cx';
import './CategoryChips.css';

// Filtro por categoría: botones con aria-pressed
export default function CategoryChips({ categories, selected, onSelect }) {
  const all = ['Todos', ...categories];
  return (
    <div className="chips" role="group" aria-label="Filtrar por categoría">
      {all.map((cat) => (
        <button
          key={cat}
          type="button"
          className={cx('chip', selected === cat && 'is-active')}
          aria-pressed={selected === cat}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
