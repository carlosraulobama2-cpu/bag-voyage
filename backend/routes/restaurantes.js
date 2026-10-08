const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const { restauranteSchema, platoSchema } = require('../schemas');
const db = require('../db');

/** Sólo el dueño del comercio puede tocar sus pedidos/menú/datos — 404 y no 403: no hace falta confirmarle a quien prueba IDs al azar que el recurso existe. */
async function exigirDueno(restauranteId, usuarioId) {
  const { rows } = await db.query('SELECT * FROM restaurantes WHERE id = $1', [restauranteId]);
  const restaurante = rows[0];
  if (!restaurante || restaurante.usuario_id !== usuarioId) return null;
  return restaurante;
}

/**
 * POST /api/restaurantes — "un restaurante o un comercio puede
 * registrarse". Antes esto no existía en absoluto: restaurant-dashboard.tsx
 * mostraba siempre "Pizza Roma" a mano, sin que ningún comercio real
 * pudiera darse de alta. Un usuario puede tener como máximo un comercio
 * (si ya tiene uno, se actualiza en vez de crear un segundo).
 */
router.post(
  '/',
  verifyToken,
  validate(restauranteSchema),
  asyncHandler(async (req, res) => {
    const { nombre, categoria, descripcion, direccion, lat, lng, logoUrl, coverUrl, telefono } = req.body;
    const usuarioId = req.user.uid;

    const existente = await db.query('SELECT id FROM restaurantes WHERE usuario_id = $1', [usuarioId]);
    let resultado;
    if (existente.rows.length > 0) {
      resultado = await db.query(
        `UPDATE restaurantes
         SET nombre = $1, categoria = $2, descripcion = $3, direccion = $4, lat = $5, lng = $6,
             logo_url = $7, cover_url = $8, telefono = $9, estado = 'PENDIENTE'
         WHERE usuario_id = $10
         RETURNING *`,
        [nombre, categoria, descripcion || null, direccion, lat ?? null, lng ?? null, logoUrl || null, coverUrl || null, telefono || null, usuarioId],
      );
    } else {
      resultado = await db.query(
        `INSERT INTO restaurantes (usuario_id, nombre, categoria, descripcion, direccion, lat, lng, logo_url, cover_url, telefono)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [usuarioId, nombre, categoria, descripcion || null, direccion, lat ?? null, lng ?? null, logoUrl || null, coverUrl || null, telefono || null],
      );
    }

    res.status(201).json({ success: true, message: 'Comercio enviado a revisión.', restaurante: resultado.rows[0] });
  }),
);

/** GET /api/restaurantes — listado público de comercios APROBADOS, para el buscador de comida. */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await db.query(
      `SELECT id, nombre, categoria, descripcion, direccion, logo_url, cover_url, rating, tiempo_entrega_min, costo_envio
       FROM restaurantes WHERE estado = 'APROBADO' ORDER BY rating DESC, created_at DESC`,
    );
    res.json({ success: true, data: rows });
  }),
);

/** GET /api/restaurantes/me — el comercio del usuario logueado (cualquier estado), para su propio panel. */
router.get(
  '/me',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { rows } = await db.query('SELECT * FROM restaurantes WHERE usuario_id = $1', [req.user.uid]);
    res.json({ success: true, restaurante: rows[0] || null });
  }),
);

/** GET /api/restaurantes/:id — ficha pública + menú, para abrir restaurant-menu.tsx con datos reales. */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM restaurantes WHERE id = $1 AND estado = 'APROBADO'", [req.params.id]);
    const restaurante = rows[0];
    if (!restaurante) return res.status(404).json({ success: false, message: 'Comercio no encontrado' });

    const platos = await db.query(
      'SELECT * FROM platos WHERE restaurante_id = $1 AND disponible = true ORDER BY created_at',
      [req.params.id],
    );
    res.json({ success: true, restaurante, platos: platos.rows });
  }),
);

/** POST /api/restaurantes/:id/platos — agregar un plato al menú (sólo el dueño). */
router.post(
  '/:id/platos',
  verifyToken,
  validate(platoSchema),
  asyncHandler(async (req, res) => {
    const restaurante = await exigirDueno(req.params.id, req.user.uid);
    if (!restaurante) return res.status(404).json({ success: false, message: 'Comercio no encontrado' });

    const { nombre, descripcion, precio, imagenUrl, disponible } = req.body;
    const { rows } = await db.query(
      `INSERT INTO platos (restaurante_id, nombre, descripcion, precio, imagen_url, disponible)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.params.id, nombre, descripcion || null, precio, imagenUrl || null, disponible ?? true],
    );
    res.status(201).json({ success: true, plato: rows[0] });
  }),
);

/** GET /api/restaurantes/:id/pedidos — pedidos del comercio (sólo el dueño) — reemplaza el INITIAL_ORDERS inventado de restaurant-dashboard.tsx. */
router.get(
  '/:id/pedidos',
  verifyToken,
  asyncHandler(async (req, res) => {
    const restaurante = await exigirDueno(req.params.id, req.user.uid);
    if (!restaurante) return res.status(404).json({ success: false, message: 'Comercio no encontrado' });

    const { rows } = await db.query(
      `SELECT p.*, u.nombre AS cliente_nombre, u.phone AS cliente_telefono
       FROM pedidos p JOIN usuarios u ON u.id = p.cliente_id
       WHERE p.restaurante_id = $1 AND p.estado != 'ENTREGADO' AND p.estado != 'CANCELADO'
       ORDER BY p.created_at DESC`,
      [req.params.id],
    );
    res.json({ success: true, data: rows });
  }),
);

/** PATCH /api/restaurantes/:id/pedidos/:pedidoId — cambiar estado de un pedido (sólo el dueño). */
router.patch(
  '/:id/pedidos/:pedidoId',
  verifyToken,
  asyncHandler(async (req, res) => {
    const restaurante = await exigirDueno(req.params.id, req.user.uid);
    if (!restaurante) return res.status(404).json({ success: false, message: 'Comercio no encontrado' });

    const ESTADOS_VALIDOS = ['PENDIENTE', 'COCINANDO', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];
    const { estado } = req.body;
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ success: false, message: `Estado inválido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` });
    }

    const { rows } = await db.query(
      `UPDATE pedidos SET estado = $1, updated_at = NOW() WHERE id = $2 AND restaurante_id = $3 RETURNING *`,
      [estado, req.params.pedidoId, req.params.id],
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    res.json({ success: true, pedido: rows[0] });
  }),
);

module.exports = router;
