/**
 * Bag Voyage — Manejo de errores centralizado
 *
 * Antes cada ruta tenía su propio try/catch con un mensaje distinto
 * ("Falta crear la tabla...", "Error interno", "Error de base de datos")
 * y algunas rutas nuevas se habrían escrito sin ninguno. `asyncHandler`
 * envuelve cualquier handler async para que una excepción (incluida una
 * de Postgres) llegue siempre acá, con una forma de respuesta consistente
 * y sin tirar abajo el proceso — Express 5 YA reenvía rechazos de
 * promesas al `next(err)` automáticamente, pero este wrapper deja
 * explícito dónde termina cualquier error no previsto, y loggea con
 * suficiente contexto para depurar sin exponerle el detalle interno a
 * quien hizo la petición.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/** Errores conocidos de Postgres que sí merecen un mensaje específico, no un 500 genérico. */
function mensajeParaErrorDePostgres(err) {
  // unique_violation — ej. email ya registrado, pero por una carrera entre
  // el SELECT previo y el INSERT en vez del chequeo normal.
  if (err.code === '23505') return 'Ese valor ya está en uso.';
  // foreign_key_violation — ej. restauranteId que no existe.
  if (err.code === '23503') return 'Referencia inválida: el recurso relacionado no existe.';
  // check_violation — ej. estrellas fuera de 1-5.
  if (err.code === '23514') return 'Datos fuera del rango permitido.';
  return null;
}

// eslint-disable-next-line no-unused-vars -- Express reconoce el manejador de errores por su aridad (4 parámetros)
function errorHandler(err, req, res, next) {
  const mensajeConocido = mensajeParaErrorDePostgres(err);
  const status = err.status || (mensajeConocido ? 400 : 500);

  req.log?.error?.({ err }, 'Error no manejado') ??
    console.error(`[${new Date().toISOString()}] Error en ${req.method} ${req.originalUrl}:`, err);

  res.status(status).json({
    success: false,
    message: mensajeConocido || err.publicMessage || 'Error interno del servidor',
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

module.exports = { asyncHandler, errorHandler, notFoundHandler };
