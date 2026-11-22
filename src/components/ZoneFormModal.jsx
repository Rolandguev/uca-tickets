import Button from './Button';
import ErrorMessage from './ErrorMessage';
import Input from './Input';
import Modal from './Modal';
import { useForm } from '../hooks/useForm';
import { validatePrice, validateStock } from '../utils/eventValidators';

function validate(values) {
  const errors = {
    price: validatePrice(values.price),
    available: validateStock(values.available),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
}

// Edita el precio y el inventario inicial de una zona (ventana modal).
// Se monta solo mientras está abierta, así el formulario siempre empieza limpio.
export default function ZoneFormModal({ title, description, initialValues, onSubmit, onClose }) {
  const { bind, formRef, submitting, submitError, handleSubmit } = useForm(initialValues, validate, onSubmit);

  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button type="submit" form="zone-form" loading={submitting} loadingText="Guardando…">Guardar</Button>
        </>
      }
    >
      <form id="zone-form" ref={formRef} onSubmit={handleSubmit} noValidate className="stack">
        {description && <p>{description}</p>}
        <Input label="Precio (USD)" type="number" inputMode="decimal" min="0" step="0.01" {...bind('price')} />
        <Input
          label="Boletos disponibles al inicio"
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          {...bind('available')}
        />
        {submitError && <ErrorMessage title="No pudimos guardar los cambios" message={submitError} />}
      </form>
    </Modal>
  );
}