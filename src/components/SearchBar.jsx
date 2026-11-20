import Icon from './Icon';
import './SearchBar.css';

export default function SearchBar({ value, onChange, placeholder = 'Buscar concierto, artista o lugar…' }) {
  return (
    <div className="search" role="search">
      <label htmlFor="search-input" className="sr-only">Buscar eventos</label>
      <span className="search__icon"><Icon name="search" size={18} /></span>
      <input
        id="search-input"
        type="search"
        className="search__input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
