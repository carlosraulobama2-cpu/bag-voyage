const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const { registerSchema, loginSchema } = require('../schemas');
const { CURRENT_TERMS_VERSION } = require('../legal');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secreto-cambialo-en-produccion';
const BCRYPT_ROUNDS = 12;

// Límite propio y más estricto para login/registro: son el blanco típico de
// fuerza bruta y de scraping de correos registrados, y el límite general de
// /api (120/min, ver index.js) es demasiado laxo para esto en particular.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
});

function firmarToken(usuario) {
  return jwt.sign({ uid: usuario.id, email: usuario.email, role: usuario.role }, JWT_SECRET, { expiresIn: '7d' });
}

function usuarioPublico(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    email: usuario.email,
    phone: usuario.phone,
    role: usuario.role,
  };
}

// POST: Registrar un nuevo usuario
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { nombre, apellidos, email, password, phone } = req.body;

    const yaExiste = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (yaExiste.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Ese correo ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const { rows } = await db.query(
      `INSERT INTO usuarios (nombre, apellidos, email, password_hash, phone, accepted_terms_version, accepted_terms_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, nombre, apellidos, email, phone, role`,
      [nombre, apellidos, email, passwordHash, phone || null, CURRENT_TERMS_VERSION],
    );

    const usuario = rows[0];
    res.status(201).json({ success: true, message: 'Usuario registrado', token: firmarToken(usuario), user: usuarioPublico(usuario) });
  }),
);

// POST: Login de usuario
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    // Mismo mensaje tanto si el correo no existe como si la contraseña no
    // coincide — decir cuál de las dos fue mal es un mapa de qué correos
    // están registrados para quien prueba al azar.
    const CREDENCIALES_INVALIDAS = { success: false, message: 'Credenciales inválidas' };
    if (rows.length === 0) return res.status(401).json(CREDENCIALES_INVALIDAS);

    const usuario = rows[0];
    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) return res.status(401).json(CREDENCIALES_INVALIDAS);

    res.json({ success: true, message: 'Login exitoso', token: firmarToken(usuario), user: usuarioPublico(usuario) });
  }),
);

module.exports = router;
