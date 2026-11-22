import { useEffect, useRef, useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { validateEmail } from '../utils/validators';
import './AuthPages.css';

// Recuperar contraseña (simulado): pide el correo y confirma el envío de instrucciones.
export default function RecoverPage({ onRecover, onNavigate }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [sentTo, setSentTo] = useState(''); // correo al que se "enviaron" las instrucciones
  const sending = useRef(false); // evita el doble envío aunque se haga doble clic muy rápido
  const titleRef = useRef(null);
  const formRef = useRef(null);

  // Al cambiar a la confirmación, el foco pasa al título para lectores de pantalla y teclado
  useEffect(() => {
    if (sentTo) titleRef.current?.focus();
  }, [sentTo]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending.current) return;

    const found = validateEmail(email);
    setError(found);
    if (found) {
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }

    sending.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      await onRecover(email);
      setSentTo(email.trim());
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      sending.current = false;
      setSubmitting(false);
    }
  }

  if (sentTo) {
    return (
      <div className="container">
        <div className="auth">
          <header className="page-header">
            <h1 ref={titleRef} tabIndex={-1}>Revisa tu correo</h1>
          </header>
          <Card>
            <div className="stack" role="status">
              <p>
                Si <strong>{sentTo}</strong> tiene una cuenta, te enviamos las instrucciones para crear una nueva contraseña.
              </p>
              <p className="muted small">
                Demo: no se envía ningún correo real. En una versión con servidor, aquí llegaría el enlace de recuperación.
              </p>
              <Button block onClick={() => onNavigate('login')}>Volver a iniciar sesión</Button>
              <Button variant="ghost" size="sm" onClick={() => { setSentTo(''); setEmail(''); }}>
                Usar otro correo
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="auth">
        <header className="page-header">
          <h1 tabIndex={-1}>Recuperar contraseña</h1>
          <p>Escribe el correo de tu cuenta y te enviaremos las instrucciones.</p>
        </header>

        <Card>
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="stack">
            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              error={error}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
                if (submitError) setSubmitError('');
              }}
            />

            {submitError && <ErrorMessage title="No pudimos enviar las instrucciones" message={submitError} />}

            <Button type="submit" block loading={submitting} loadingText="Enviando…">
              Enviar instrucciones
            </Button>
          </form>
        </Card>

        <div className="auth__links">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('login')}>
            ← Volver a iniciar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
