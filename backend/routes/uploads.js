const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { verifyToken } = require('../middleware/auth');

/**
 * Antes `driver-registration.tsx`, `restaurant-registration.tsx` y el menú
 * de un comercio pedían una foto con `expo-image-picker` y la guardaban
 * como un `file://` local — nunca viajaba al servidor, así que un
 * `fotoUrl`/`logoUrl` real no tenía de dónde salir. Esto guarda el
 * archivo en disco (igual que hace Peyma Music cuando no hay bucket S3
 * configurado) y devuelve la URL pública para guardarla en la fila
 * correspondiente (vehiculos.foto_url, restaurantes.logo_url, etc.).
 */
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const sufijo = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${sufijo}${path.extname(file.originalname) || '.jpg'}`);
  },
});

const TIPOS_PERMITIDOS = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  // Notas de voz del chat del viaje (trip-chat.tsx, grabadas con expo-av) —
  // el formato real depende del dispositivo (m4a en iOS, 3gp/mp4 en Android).
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/aac',
  'audio/3gpp',
  'audio/mpeg',
]);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB — fotos de DNI/auto/platos o una nota de voz corta, no videos
  fileFilter: (req, file, cb) => {
    if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
      return cb(new Error('Tipo de archivo no permitido'));
    }
    cb(null, true);
  },
});

router.post('/', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' });
  const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({ success: true, url: publicUrl });
});

module.exports = { router, UPLOADS_DIR };
