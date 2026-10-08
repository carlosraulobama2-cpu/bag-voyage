/**
 * Bag Voyage — Validación genérica de `req.body` con zod
 *
 * Una sola función para todas las rutas: valida contra el esquema, y si
 * falla responde 400 con el primer mensaje legible en vez de dejar que la
 * ruta siga con datos a medio llenar y reviente más abajo contra Postgres
 * (eso es lo que daba los 500 "misteriosos" de antes — ver routes/auth.js
 * y routes/publicaciones.js, que atrapaban el error de la base y
 * mostraban "Falta crear la tabla", un síntoma, no la causa).
 *
 * `req.body` se reemplaza por el resultado ya parseado/coercionado (zod
 * convierte "15" a 15 en campos `z.coerce.number()`, por ejemplo) — así
 * las rutas no tienen que repetir esa conversión.
 */
function validate(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      const primerError = resultado.error.issues[0];
      return res.status(400).json({
        success: false,
        message: primerError?.message || 'Datos inválidos',
        field: primerError?.path?.join('.') || undefined,
      });
    }
    req.body = resultado.data;
    next();
  };
}

module.exports = { validate };
