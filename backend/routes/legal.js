const express = require('express');
const router = express.Router();
const { CURRENT_TERMS_VERSION, TERMINOS, PRIVACIDAD } = require('../legal');

/**
 * Pública (sin token): la pantalla de registro necesita poder mostrar el
 * texto ANTES de que exista una cuenta. La versión viaja siempre junto al
 * texto para que el cliente mande exactamente esa de vuelta al registrarse
 * (ver schemas.js: `acceptedTermsVersion` tiene que ser un literal igual a
 * ésta, o el registro se rechaza).
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    version: CURRENT_TERMS_VERSION,
    terminos: TERMINOS,
    privacidad: PRIVACIDAD,
  });
});

module.exports = router;
