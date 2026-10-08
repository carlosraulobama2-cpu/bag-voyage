const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const { pedidoSchema } = require('../schemas');
const db = require('../db');

/**
 * POST /api/pedidos — crear un pedido real desde food-delivery.tsx /
 * restaurant-menu.tsx. El total se recalcula acá con los precios que
 * manda el cliente (cantidad × precio de cada ítem): no se confía en que
 * el cliente mande el total ya sumado, porque eso abriría la puerta a
 * pagar lo que uno quiera.
 */
router.post(
  '/',
  verifyToken,
  validate(pedidoSchema),
  asyncHandler(async (req, res) => {
    const { restauranteId, items, direccionEntrega } = req.body;

    const restaurante = await db.query("SELECT id FROM restaurantes WHERE id = $1 AND estado = 'APROBADO'", [restauranteId]);
    if (restaurante.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Comercio no disponible' });
    }

    const total = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

    const { rows } = await db.query(
      `INSERT INTO pedidos (restaurante_id, cliente_id, items, total, direccion_entrega)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [restauranteId, req.user.uid, JSON.stringify(items), total, direccionEntrega || null],
    );

    res.status(201).json({ success: true, message: 'Pedido realizado', pedido: rows[0] });
  }),
);

/** GET /api/pedidos/mios — mis pedidos como cliente, para el historial. */
router.get(
  '/mios',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { rows } = await db.query(
      `SELECT p.*, r.nombre AS restaurante_nombre, r.logo_url AS restaurante_logo
       FROM pedidos p JOIN restaurantes r ON r.id = p.restaurante_id
       WHERE p.cliente_id = $1 ORDER BY p.created_at DESC`,
      [req.user.uid],
    );
    res.json({ success: true, data: rows });
  }),
);

module.exports = router;
