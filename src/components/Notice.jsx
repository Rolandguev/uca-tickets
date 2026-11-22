import './Notice.css';

// Mensaje de confirmación que se anuncia a lectores de pantalla (role="status").
// Si no hay texto no ocupa espacio.
export default function Notice({ children }) {
  return <p className="notice" role="status">{children}</p>;
}
