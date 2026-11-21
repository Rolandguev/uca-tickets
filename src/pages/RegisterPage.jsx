import { useRef, useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { validateEmail, validateName, validatePhone } from '../utils/validators';
import { validateConfirmPassword, validatePassword } from '../utils/authValidators';
import './AuthPages.css';

function validate(values) {
  const errors = {
    name: validateName(values.name),
    email: validateEmail(values.email),
    phone: validatePhone(values.phone),
    password: validatePassword(values.password),
    confirm: validateConfirmPassword(values.password, values.confirm),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
}

// Registro simulado (formulario controlado). La cuenta nueva siempre es de rol Cliente.
export default function RegisterPage({ session, onRegister, onEvents, onNavigate }) {
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const sending = useRef(false); // evita el doble envío aunque se haga doble clic muy rápido
  const formRef = useRef(null);

  if (session) {
    return (
      <div className="container">
        <div className="auth">
          <header className="page-header">
            <h1 tabIndex={-1}>Ya tienes una cuenta activa</h1>
            <p>Estás conectado como {session.name}. Cierra sesión desde tu perfil si quieres crear otra cuenta.</p>
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

  function focusFirstError() {
    requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending.current) return;

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError();
      return;
    }

    sending.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      await onRegister(values);
    } catch (err) {
      if (err.field) {
        // Error de un campo concreto (por ejemplo, correo repetido): se muestra junto al campo
        setErrors({ [err.field]: err.message });
        focusFirstError();
      } else {
        setSubmitError(err.message);
      }
      sending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="auth">
        <header className="page-header">
          <h1 tabIndex={-1}>Crear cuenta</h1>
          <p>Regístrate para guardar tus boletos y comprar más rápido.</p>
        </header>

        <Card>
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="stack">
            <Input label="Nombre completo" autoComplete="name" placeholder="Tu nombre" {...bind('name')} />
            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              {...bind('email')}
            />
            <Input
              label="Teléfono"
              type="tel"
              autoComplete="tel"
              placeholder="+503 7000 0000"
              {...bind('phone')}
            />
            <Input
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              hint="Usa al menos 8 caracteres, con letras y números."
              {...bind('password')}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              {...bind('confirm')}
            />

            {submitError && <ErrorMessage title="No pudimos crear tu cuenta" message={submitError} />}

            <Button type="submit" block loading={submitting} loadingText="Creando cuenta…">
              Crear cuenta
            </Button>
          </form>
        </Card>

        <div className="auth__links">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('login')}>
            ¿Ya tienes cuenta? Inicia sesión
          </Button>
        </div>
      </div>
    </div>
  );
}

