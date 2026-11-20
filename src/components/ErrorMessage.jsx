import Button from './Button';
import './ErrorMessage.css';

// Mensaje de error comprensible con opción de reintentar (role="alert")
export default function ErrorMessage({ title = 'Algo salió mal', message, onRetry, retryLabel = 'Reintentar' }) {
  return (
    <div className="error-box" role="alert">
      <h2 className="error-box__title">{title}</h2>
      {message && <p className="error-box__message">{message}</p>}
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>{retryLabel}</Button>}
    </div>
  );
}
