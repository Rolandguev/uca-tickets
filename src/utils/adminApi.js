// "API" simulada del panel de administración: promesas con retardo (misma idea que api.js).

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Guardar, editar o eliminar. Con "simular errores" activado falla para mostrar el estado de error.
export async function saveRequest({ simulateError = false } = {}) {
  await wait(800);
  if (simulateError) throw new Error('No pudimos guardar los cambios. Revisa tu conexión e inténtalo de nuevo.');
  return true;
}

