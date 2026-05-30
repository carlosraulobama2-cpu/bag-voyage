const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secreto-cambialo-en-produccion';

// Middleware para verificar el token JWT Custom
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No se proporcionó token de autenticación' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Guardamos { uid, email } en la request
        next();
    } catch (error) {
        console.error('Error verificando token:', error.message);
        return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
    }
};

module.exports = { verifyToken };
