import Icon from './Icon';
import './StatusScreen.css';

// Cabecera de las pantallas de resultado (éxito, error, correo enviado)
// tone: 'success' | 'error' | 'primary' | 'warning'
export default function StatusScreen({ tone, icon, title, message, children }) {
  return (
    <div className="status-screen">
      <span className={`status-screen__icon status-screen__icon--${tone}`}>
        <Icon name={icon} size={36} strokeWidth={2.5} />
      </span>
      <h1 className="status-screen__title" tabIndex={-1}>{title}</h1>
      {message && <p className="status-screen__message">{message}</p>}
      {children}
    </div>
  );
}
