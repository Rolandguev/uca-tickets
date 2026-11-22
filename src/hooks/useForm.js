import { useRef, useState } from 'react';

// Estado común de un formulario controlado con validación y envío sin doble clic.
//   validate(values): devuelve un objeto { campo: mensaje } (vacío si todo está bien)
//   onSubmit(values): función asíncrona; si lanza un error, se muestra en submitError
export function useForm(initialValues, validate, onSubmit) {
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

  // Props listas para un <Input>: valor, error y onChange
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
      await onSubmit(values);
    } catch (err) {
      setSubmitError(err.message);
      sending.current = false;
      setSubmitting(false);
    }
  }

  return { values, bind, formRef, submitting, submitError, handleSubmit };
}
