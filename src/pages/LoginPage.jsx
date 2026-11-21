import { useRef, useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { validateEmail } from '../utils/validators';
import { validatePassword } from '../utils/authValidators';
import './AuthPages.css';

function validate(values) {
  const errors = {
    email: validateEmail(values.email),
    password: validatePassword(values.password, false),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
}

// Inicio de sesión simulado (formulario controlado)
export default function LoginPage({ session, onLogin, onEvents, onNavigate }) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const sending = useRef(false); // evita el doble envío aunque se haga doble clic muy rápido
  const formRef = useRef(null);

  // Si ya hay sesión no tiene sentido mostrar el formulario
  if (session) {
    return (
      <div className="container">
        <div className="auth">
          <header className="page-header">
            <h1 tabIndex={-1}>Ya iniciaste sesión</h1>
            <p>Estás conectado como {session.name} ({session.role}).</p>
          </header>
          <Button block onClick={onEvents}>Ver eventos</Button>
        </div>
      </div>
    );
  }

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors(({ [field]: _removed, ...rest }) => rest);
    if (submitError) setSubmitError('');
  }

  const bind = (field) => ({
    value: values[field],
    error: errors[field],
    onChange: (e) => update(field, e.target.value),
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending.current) return;

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {

      // Lleva el foco al primer campo con error
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }

    sending.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      await onLogin(values);
    } catch (err) {
      setSubmitError(err.message);
      sending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="auth">
        <header className="page-header">
          <h1 tabIndex={-1}>Inicia sesión</h1>
          <p>Entra a tu cuenta para ver tus boletos y comprar más rápido.</p>
        </header>

        <Card>
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="stack">
            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              {...bind('email')}
            />
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              {...bind('password')}
            />

            {submitError && <ErrorMessage title="No pudimos iniciar sesión" message={submitError} />}

            <Button type="submit" block loading={submitting} loadingText="Entrando…">
              Iniciar sesión
            </Button>
          </form>
        </Card>

        <div className="auth__links">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('register')}>
            ¿No tienes cuenta? Crear cuenta
          </Button>
        </div>

        <p className="muted small auth__demo">
          Demo: <strong>maria.lopez@correo.com</strong> (cliente) o <strong>ana.rivas@correo.com</strong>{' '}
          (administradora), contraseña <strong>Demo1234</strong>.
        </p>
      </div>
    </div>
  );
  }
  
