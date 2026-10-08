const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const { vehiculoSchema } = require('../schemas');
const db = require('../db');

/**
 * POST /api/vehiculos — "Hazte Viajero/Conductor" (driver-registration.tsx).
 *
 * Antes esta pantalla no mandaba nada a ningún lado: completaba 3 pasos y
 * `setIsSubmitted(true)` mostraba "en revisión" sin que existiera nada que
 * revisar. Un usuario con un vehículo ya cargado (estado PENDIENTE o
 * APROBADO) no puede volver a registrar otro — se actualiza el que tiene,
 * no se duplica.
 */
router.post(
  '/',
  verifyToken,
  validate(vehiculoSchema),
  asyncHandler(async (req, res) => {
    const { tipo, marca, modelo, color, placa, fotoUrl, dniFotoUrl, iban } = req.body;
    const usuarioId = req.user.uid;

    const existente = await db.query('SELECT id, estado FROM vehiculos WHERE usuario_id = $1', [usuarioId]);
    if (existente.rows.length > 0 && existente.rows[0].estado === 'APROBADO') {
      return res.status(409).json({ success: false, message: 'Ya tenés un vehículo aprobado. Escribinos para modificarlo.' });
    }

    let resultado;
    if (existente.rows.length > 0) {
      // Reenvío tras un rechazo (o completar datos): se actualiza la misma
      // fila y vuelve a PENDIENTE, no se acumulan solicitudes viejas.
      resultado = await db.query(
        `UPDATE vehiculos
         SET tipo = $1, marca = $2, modelo = $3, color = $4, placa = $5,
             foto_url = $6, dni_foto_url = $7, iban = $8, estado = 'PENDIENTE'
         WHERE usuario_id = $9
         RETURNING *`,
        [tipo, marca || null, modelo || null, color || null, placa, fotoUrl || null, dniFotoUrl || null, iban, usuarioId],
      );
    } else {
      resultado = await db.query(
        `INSERT INTO vehiculos (usuario_id, tipo, marca, modelo, color, placa, foto_url, dni_foto_url, iban)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [usuarioId, tipo, marca || null, modelo || null, color || null, placa, fotoUrl || null, dniFotoUrl || null, iban],
      );
    }

    res.status(201).json({ success: true, message: 'Solicitud enviada. La revisamos en 24-48 horas.', vehiculo: resultado.rows[0] });
  }),
);

/** GET /api/vehiculos/me — estado de mi propia solicitud (PENDIENTE/APROBADO/RECHAZADO), o null si nunca registró uno. */
router.get(
  '/me',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { rows } = await db.query('SELECT * FROM vehiculos WHERE usuario_id = $1', [req.user.uid]);
    res.json({ success: true, vehiculo: rows[0] || null });
  }),
);

module.exports = router;
