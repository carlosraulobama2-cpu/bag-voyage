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

    // Tabla de Usuarios (Pasajeros, Conductores, Restaurantes)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'USER',
        wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Viajes (Rides)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rides (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        passenger_id UUID REFERENCES users(id),
        driver_id UUID REFERENCES users(id),
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
        driver_id UUID REFERENCES users(id),
        offer_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
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
