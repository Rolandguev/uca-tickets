import Icon from './Icon';
import './EmptyState.css';

export default function EmptyState({ icon = 'search', title, message, action }) {
  return (
    <div className="empty">
      <span className="empty__icon"><Icon name={icon} size={28} /></span>
      <h2 className="empty__title">{title}</h2>
      {message && <p className="empty__message">{message}</p>}
      {action}
    </div>
  );
}
