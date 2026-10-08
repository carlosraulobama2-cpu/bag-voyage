const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const { rideRequestSchema } = require('../schemas');
const { calcularDistanciaKm, estimarEtaMinutos } = require('../utils/geo');
const db = require('../db');

/**
 * POST /api/rides — crear el viaje de verdad antes de ofertarlo por
 * WebSocket. Antes `request_ride` (index.js) generaba su propio
 * `rideId` en el cliente (`Math.random().toString(36)`) y nunca se
 * guardaba nada: un reinicio del servidor, o simplemente preguntar
 * "¿qué viajes pedí?", no tenía de dónde sacar la respuesta. Acá se
 * calcula también la distancia y el tiempo estimado del VIAJE completo
 * (recogida → destino) — lo que ride-map.tsx muestra como resumen antes
 * de pedirlo.
 */
router.post(
  '/',
  verifyToken,
  validate(rideRequestSchema),
  asyncHandler(async (req, res) => {
    const { pickupLat, pickupLng, destination, destinationLat, destinationLng, offerPrice } = req.body;

    let distanciaKm = null;
    let etaMinutos = null;
    if (destinationLat != null && destinationLng != null) {
      distanciaKm = calcularDistanciaKm(pickupLat, pickupLng, destinationLat, destinationLng);
      etaMinutos = estimarEtaMinutos(distanciaKm);
    }

    const { rows } = await db.query(
      `INSERT INTO rides (passenger_id, pickup_lat, pickup_lng, destination, destination_lat, destination_lng, distance_km, eta_minutes, offer_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.user.uid, pickupLat, pickupLng, destination, destinationLat ?? null, destinationLng ?? null, distanciaKm, etaMinutos, offerPrice ?? null],
    );

    res.status(201).json({ success: true, ride: rows[0] });
  }),
);

/** GET /api/rides/mios — mi historial de viajes como pasajero (trip-history.tsx). */
router.get(
  '/mios',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { rows } = await db.query(
      `SELECT r.*, u.nombre AS conductor_nombre, u.apellidos AS conductor_apellidos,
              v.marca AS vehiculo_marca, v.modelo AS vehiculo_modelo, v.placa AS vehiculo_placa, v.color AS vehiculo_color
       FROM rides r
       LEFT JOIN usuarios u ON u.id = r.driver_id
       LEFT JOIN vehiculos v ON v.id = r.driver_vehiculo_id
       WHERE r.passenger_id = $1 ORDER BY r.created_at DESC LIMIT 50`,
      [req.user.uid],
    );
    res.json({ success: true, data: rows });
  }),
);

/** GET /api/rides/:id — un viaje puntual, con el conductor y el vehículo asignado si ya lo tiene (active-trip.tsx al recargar). */
router.get(
  '/:id',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { rows } = await db.query(
      `SELECT r.*, u.nombre AS conductor_nombre, u.apellidos AS conductor_apellidos,
              v.marca AS vehiculo_marca, v.modelo AS vehiculo_modelo, v.placa AS vehiculo_placa,
              v.color AS vehiculo_color, v.foto_url AS vehiculo_foto, v.rating AS conductor_rating
       FROM rides r
       LEFT JOIN usuarios u ON u.id = r.driver_id
       LEFT JOIN vehiculos v ON v.id = r.driver_vehiculo_id
       WHERE r.id = $1 AND (r.passenger_id = $2 OR r.driver_id = $2)`,
      [req.params.id, req.user.uid],
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Viaje no encontrado' });
    res.json({ success: true, ride: rows[0] });
  }),
);

module.exports = router;
