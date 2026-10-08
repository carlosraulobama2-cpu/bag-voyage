const { Pool } = require('pg');
require('dotenv').config();

// Configuración del Pool de conexiones para Neon (PostgreSQL)
// Necesitas añadir DATABASE_URL a tu archivo .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://usuario:contraseña@ep-ejemplo-neon.tech/neondb?sslmode=require",
});

// Función para inicializar las tablas de la Base de Datos
const initDB = async () => {
  try {
    console.log("Comprobando / Creando tablas en la Base de Datos...");

    // Tabla de Usuarios (Pasajeros, Conductores, Restaurantes).
    //
    // Antes esto se llamaba "users" (en inglés, con name/phone obligatorios y
    // sin email/password_hash) mientras routes/auth.js — el login y registro
    // reales que usa la app — consultaba una tabla "usuarios" que nunca se
    // creaba en ningún lado. Esa tabla jamás existió: CUALQUIER intento de
    // registrarse o iniciar sesión fallaba con un 500 ("relation usuarios
    // does not exist"). Se unifica en una sola tabla, con el nombre y las
    // columnas que auth.js de verdad usa, más las que ya necesitaban
    // rides/bids (role, wallet_balance). `phone` pasa a ser opcional: el
    // registro actual (app/auth/login.tsx) no lo pide.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone VARCHAR(20) UNIQUE,
        role VARCHAR(20) NOT NULL DEFAULT 'USER',
        wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Viajes (Rides)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rides (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        passenger_id UUID REFERENCES usuarios(id),
        driver_id UUID REFERENCES usuarios(id),
        status VARCHAR(20) DEFAULT 'SEARCHING',
        pickup_lat FLOAT NOT NULL,
        pickup_lng FLOAT NOT NULL,
        destination VARCHAR(255) NOT NULL,
        final_price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Ofertas (Bids) - Modelo InDrive
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
        driver_id UUID REFERENCES usuarios(id),
        offer_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Publicaciones (envíos "viajero"/"remitente").
    //
    // routes/publicaciones.js ya leía y escribía esta tabla desde siempre —
    // su propio mensaje de error ("Falta crear la tabla en Neon") admitía
    // que faltaba crearla. Sin esto, publicar o buscar envíos fallaba
    // siempre con un 500.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS publicaciones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
        modo VARCHAR(20) NOT NULL,
        origen VARCHAR(255) NOT NULL,
        destino VARCHAR(255) NOT NULL,
        fecha VARCHAR(50),
        precio DECIMAL(10, 2),
        envio VARCHAR(255),
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tablas inicializadas correctamente.");
  } catch (err) {
    console.error("❌ Error inicializando la Base de Datos:", err);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDB
};
