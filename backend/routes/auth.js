const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secreto-cambialo-en-produccion';

// POST: Registrar un nuevo usuario
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios' });
        }

        // Verificar si el usuario ya existe
        const userExist = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Guardar en la base de datos Neon
        const query = `
            INSERT INTO usuarios (nombre, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, nombre, email;
        `;
        const result = await db.query(query, [nombre || '', email, passwordHash]);
        const user = result.rows[0];

        // Crear Token
        const token = jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ success: true, message: 'Usuario registrado', token, user });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ success: false, message: 'Falta crear la tabla usuarios o error interno' });
    }
});

// POST: Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios' });
        }

        // Buscar usuario en Neon
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Comparar contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // Crear Token
        const token = jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, message: 'Login exitoso', token, user: { id: user.id, nombre: user.nombre, email: user.email } });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

module.exports = router;
