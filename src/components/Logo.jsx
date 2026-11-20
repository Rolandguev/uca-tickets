import './Logo.css';

export default function Logo({ onClick }) {
  const content = (
    <>
      <span className="logo__mark" aria-hidden="true">U</span>
      <span className="logo__text">UCA TICKETS</span>
    </>
  );
  if (!onClick) return <div className="logo">{content}</div>;
  return (
    <button type="button" className="logo logo--button" onClick={onClick} aria-label="UCA TICKETS, ir a eventos">
      {content}
    </button>
  );
}
