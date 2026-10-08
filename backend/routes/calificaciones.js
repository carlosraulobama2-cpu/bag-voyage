const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const { calificacionSchema } = require('../schemas');
const db = require('../db');

/**
 * POST /api/calificaciones — lo que rating.tsx pedía por pantalla
 * (estrellas + comentario) sin guardar nada en ningún lado
 * (`handleSubmit` sólo mostraba un Alert). Al calificar un viaje, además
 * se recalcula el promedio del vehículo/conductor calificado — así
 * `vehiculos.rating`, que ride-map.tsx va a mostrar junto al conductor
 * emparejado, refleja calificaciones reales, no el 5.0 fijo con el que
 * arranca todo vehículo nuevo.
 */
router.post(
  '/',
  verifyToken,
  validate(calificacionSchema),
  asyncHandler(async (req, res) => {
    const { rideId, pedidoId, estrellas, comentario } = req.body;

    let ride = null;
    if (rideId) {
      const { rows } = await db.query('SELECT * FROM rides WHERE id = $1 AND passenger_id = $2', [rideId, req.user.uid]);
      ride = rows[0];
      if (!ride) return res.status(404).json({ success: false, message: 'Viaje no encontrado' });
    }
    if (pedidoId) {
      const { rows } = await db.query('SELECT id FROM pedidos WHERE id = $1 AND cliente_id = $2', [pedidoId, req.user.uid]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    const { rows } = await db.query(
      `INSERT INTO calificaciones (ride_id, pedido_id, calificador_id, estrellas, comentario)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [rideId || null, pedidoId || null, req.user.uid, estrellas, comentario || null],
    );

    if (ride?.driver_vehiculo_id) {
      await db.query(
        `UPDATE vehiculos SET rating = (
           SELECT ROUND(AVG(c.estrellas)::numeric, 1) FROM calificaciones c
           JOIN rides r ON r.id = c.ride_id
           WHERE r.driver_vehiculo_id = $1
         ), total_viajes = total_viajes + 1
         WHERE id = $1`,
        [ride.driver_vehiculo_id],
      );
    }

    res.status(201).json({ success: true, calificacion: rows[0] });
  }),
);

module.exports = router;
