import { Link } from 'react-router';
import './Logo.css';

// Sin "to": solo la marca. Con "to": enlace (en la barra lleva al inicio).
export default function Logo({ to }) {
  const content = (
    <>
      <span className="logo__mark" aria-hidden="true">U</span>
      <span className="logo__text">UCA TICKETS</span>
    </>
  );
  if (!to) return <div className="logo">{content}</div>;
  return (
    <Link to={to} className="logo logo--button" aria-label="UCA TICKETS, ir al inicio">
      {content}
    </Link>
  );
}
