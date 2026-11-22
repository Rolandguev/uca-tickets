import { useRef, useState } from 'react';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import Input from './Input';
import Modal from './Modal';
import SelectField from './SelectField';
import { CATEGORIES } from '../data/events';
import { validateEventDate, validateRequired, validateTitle } from '../utils/eventValidators';

function validate(values) {
  const errors = {
    title: validateTitle(values.title),
    date: validateEventDate(values.date),
    venue: validateRequired(values.venue, 'Escribe el lugar del evento.'),
    city: validateRequired(values.city, 'Escribe la ciudad.'),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
}

// Formulario de evento en una ventana modal (sirve para crear y para editar).
//   initialValues: valores de partida     onSubmit(values): función asíncrona que guarda
//   onClose: se llama al cancelar, al presionar Esc o al terminar
// Se monta solo mientras está abierto, así el formulario siempre empieza limpio.
export default function EventFormModal({ title, initialValues, onSubmit, onClose }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const sending = useRef(false); // evita el doble envío aunque se haga doble clic muy rápido
  const formRef = useRef(null);

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
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }

    sending.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(err.message);
      sending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button type="submit" form="event-form" loading={submitting} loadingText="Guardando…">Guardar</Button>
        </>
      }
    >
      <form id="event-form" ref={formRef} onSubmit={handleSubmit} noValidate className="stack">
        <Input label="Nombre del evento" placeholder="Ej. Noche de Jazz UCA" {...bind('title')} />
        <Input label="Artista o grupo (opcional)" placeholder="Si lo dejas vacío se usa el nombre" {...bind('artist')} />
        <SelectField label="Categoría" options={CATEGORIES} {...bind('category')} />
        <Input label="Fecha y hora" type="datetime-local" {...bind('date')} />
        <Input label="Lugar" placeholder="Ej. Auditorio UCA" {...bind('venue')} />
        <Input label="Ciudad" placeholder="Ej. San Salvador" {...bind('city')} />
        <Input label="Descripción corta" placeholder="De qué trata el evento" {...bind('description')} />
        {submitError && <ErrorMessage title="No pudimos guardar el evento" message={submitError} />}
      </form>
    </Modal>
  );
}
