/**
 * Bag Voyage — Esquemas de validación (zod)
 *
 * Antes cada ruta leía `req.body` a mano y confiaba en que viniera bien
 * formado — un campo faltante no daba un 400 claro, daba una excepción de
 * Postgres (columna NOT NULL, tipo inválido) convertida en un 500 genérico.
 * Centralizar la validación acá, en un solo lugar por recurso, es lo que
 * separa "el backend no tiene errores" de "el backend no tira 500 por
 * cosas que el cliente ya debería haber evitado".
 */
const { z } = require('zod');
const { CURRENT_TERMS_VERSION } = require('./legal');

const registerSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  apellidos: z.string().trim().min(1, 'Los apellidos son obligatorios').max(100),
  email: z.string().trim().toLowerCase().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
  phone: z.string().trim().min(6).max(20).optional().nullable(),
  // Sin esto el registro se rechaza: aceptar términos/privacidad no es
  // opcional, y la versión tiene que ser la vigente — si el cliente tiene
  // cacheada una versión vieja de la pantalla de registro, se lo manda a
  // refrescarla en vez de guardar una aceptación que ya no corresponde.
  acceptedTermsVersion: z.literal(CURRENT_TERMS_VERSION, {
    error: 'Tenés que aceptar la versión vigente de los términos y la política de privacidad',
  }),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const publicacionSchema = z.object({
  modo: z.enum(['viajero', 'remitente']),
  origen: z.string().trim().min(1).max(255),
  destino: z.string().trim().min(1).max(255),
  fecha: z.string().trim().max(50).optional().nullable(),
  precio: z.coerce.number().positive().optional().nullable(),
  envio: z.string().trim().max(255).optional().nullable(),
  descripcion: z.string().trim().max(2000).optional().nullable(),
});

const vehiculoSchema = z.object({
  tipo: z.string().trim().min(1, 'Indicá el tipo de vehículo').max(30),
  marca: z.string().trim().max(50).optional().nullable(),
  modelo: z.string().trim().max(50).optional().nullable(),
  color: z.string().trim().max(30).optional().nullable(),
  placa: z.string().trim().min(1, 'La matrícula es obligatoria').max(20),
  fotoUrl: z.string().trim().url().optional().nullable(),
  dniFotoUrl: z.string().trim().url().optional().nullable(),
  iban: z.string().trim().min(1, 'El IBAN es obligatorio').max(40),
});

const restauranteSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre del comercio es obligatorio').max(150),
  categoria: z.string().trim().min(1, 'Elegí una categoría').max(50),
  descripcion: z.string().trim().max(1000).optional().nullable(),
  direccion: z.string().trim().min(1, 'La dirección es obligatoria').max(255),
  lat: z.coerce.number().min(-90).max(90).optional().nullable(),
  lng: z.coerce.number().min(-180).max(180).optional().nullable(),
  logoUrl: z.string().trim().url().optional().nullable(),
  coverUrl: z.string().trim().url().optional().nullable(),
  telefono: z.string().trim().max(20).optional().nullable(),
});

const platoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre del plato es obligatorio').max(150),
  descripcion: z.string().trim().max(1000).optional().nullable(),
  precio: z.coerce.number().positive('El precio tiene que ser mayor a 0'),
  imagenUrl: z.string().trim().url().optional().nullable(),
  disponible: z.boolean().optional(),
});

const pedidoItemSchema = z.object({
  platoId: z.string().uuid(),
  nombre: z.string().trim().min(1).max(150),
  precio: z.coerce.number().positive(),
  cantidad: z.coerce.number().int().positive().max(50),
});

const pedidoSchema = z.object({
  restauranteId: z.string().uuid('Comercio inválido'),
  items: z.array(pedidoItemSchema).min(1, 'El pedido necesita al menos un plato'),
  direccionEntrega: z.string().trim().max(255).optional().nullable(),
});

const rideRequestSchema = z.object({
  pickupLat: z.coerce.number().min(-90).max(90),
  pickupLng: z.coerce.number().min(-180).max(180),
  destination: z.string().trim().min(1, 'Indicá un destino').max(255),
  destinationLat: z.coerce.number().min(-90).max(90).optional().nullable(),
  destinationLng: z.coerce.number().min(-180).max(180).optional().nullable(),
  offerPrice: z.coerce.number().positive().optional().nullable(),
});

const calificacionSchema = z
  .object({
    rideId: z.string().uuid().optional().nullable(),
    pedidoId: z.string().uuid().optional().nullable(),
    estrellas: z.coerce.number().int().min(1).max(5),
    comentario: z.string().trim().max(500).optional().nullable(),
  })
  .refine((data) => data.rideId || data.pedidoId, {
    message: 'Hace falta indicar rideId o pedidoId',
  });

module.exports = {
  registerSchema,
  loginSchema,
  publicacionSchema,
  vehiculoSchema,
  restauranteSchema,
  platoSchema,
  pedidoSchema,
  rideRequestSchema,
  calificacionSchema,
};
