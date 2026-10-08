const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../db');

// POST: Crear nueva publicación
router.post('/', verifyToken, async (req, res) => {
    try {
        const { modo, origen, destino, fecha, precio, descripcion, envio } = req.body;
        const userId = req.user.uid;

        const query = `
            INSERT INTO publicaciones (user_id, modo, origen, destino, fecha, precio, envio, descripcion)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        
        const values = [
            userId, 
            modo, 
            origen, 
            destino, 
            fecha, 
            precio || null, 
            envio || null, 
            descripcion || ''
        ];

        try {
            const result = await db.query(query, values);
            res.status(201).json({
                success: true,
                message: "Publicación guardada exitosamente en Neon",
                data: result.rows[0]
            });
        } catch (dbError) {
            console.error("Error de DB al guardar la publicación:", dbError.message);
            res.status(500).json({ success: false, message: 'Error de base de datos' });
        }

    } catch (error) {
        console.error('Error al guardar publicación:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// GET: Obtener todas las publicaciones (Para el buscador)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM publicaciones ORDER BY created_at DESC LIMIT 50');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener publicaciones:', error);
        res.status(500).json({ success: false, message: 'Error de base de datos (Neon)' });
    }
});

module.exports = router;
