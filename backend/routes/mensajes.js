const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const db = require('../db');

/** Sólo pasajero o conductor del viaje pueden ver/leer su chat — 404 y no 403, mismo criterio que restaurantes.js. */
async function exigirParticipante(rideId, usuarioId) {
  const { rows } = await db.query('SELECT passenger_id, driver_id FROM rides WHERE id = $1', [rideId]);
  const ride = rows[0];
  if (!ride || (ride.passenger_id !== usuarioId && ride.driver_id !== usuarioId)) return null;
  return ride;
}

/** GET /api/mensajes/:rideId — historial del chat del viaje (el envío en vivo va por socket, ver send_message en index.js). */
router.get(
  '/:rideId',
  verifyToken,
  asyncHandler(async (req, res) => {
    const ride = await exigirParticipante(req.params.rideId, req.user.uid);
    if (!ride) return res.status(404).json({ success: false, message: 'Viaje no encontrado' });

    const { rows } = await db.query(
      `SELECT id, remitente_id, texto, audio_url, leido, created_at FROM mensajes WHERE ride_id = $1 ORDER BY created_at ASC`,
      [req.params.rideId],
    );
    res.json({ success: true, data: rows });
  }),
);

/** PATCH /api/mensajes/:rideId/leido — marca como leídos los mensajes del otro participante. */
router.patch(
  '/:rideId/leido',
  verifyToken,
  asyncHandler(async (req, res) => {
    const ride = await exigirParticipante(req.params.rideId, req.user.uid);
    if (!ride) return res.status(404).json({ success: false, message: 'Viaje no encontrado' });

    await db.query(`UPDATE mensajes SET leido = true WHERE ride_id = $1 AND remitente_id != $2`, [req.params.rideId, req.user.uid]);
    res.json({ success: true });
  }),
);

module.exports = router;
