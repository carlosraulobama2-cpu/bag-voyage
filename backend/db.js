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
        nombre VARCHAR(100) NOT NULL,
        apellidos VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone VARCHAR(20) UNIQUE,
        role VARCHAR(20) NOT NULL DEFAULT 'USER',
        wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
        -- Qué versión de términos/privacidad aceptó y cuándo — el backend
        -- rechaza el registro sin esto (ver schemas.js), igual que ya hacía
        -- Peyma Music: quien reclama "no acepté nada" tiene que poder
        -- revisarse, no alcanza con un checkbox que no deja rastro.
        accepted_terms_version VARCHAR(20) NOT NULL,
        accepted_terms_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Añade columnas a bases ya creadas antes de este cambio (idempotente:
    // CREATE TABLE IF NOT EXISTS no las agrega si la tabla ya existía).
    await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellidos VARCHAR(100);`);
    await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS accepted_terms_version VARCHAR(20);`);
    await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMP;`);

    // Tabla de Viajes (Rides).
    //
    // Antes `request_ride`/`accept_bid` (index.js) sólo reenviaban eventos de
    // WebSocket entre pasajero y conductor — nada se guardaba acá, así que un
    // reinicio del servidor borraba cualquier viaje en curso, y no había
    // forma de calcular ni mostrar distancia/tiempo estimado. Se agregan las
    // coordenadas de destino (para la distancia real, ver utils/geo.js) y el
    // vehículo asignado, para poder mostrar auto + distancia + ETA como en
    // Uber apenas se empareja un conductor.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rides (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        passenger_id UUID REFERENCES usuarios(id),
        driver_id UUID REFERENCES usuarios(id),
        driver_vehiculo_id UUID,
        status VARCHAR(20) NOT NULL DEFAULT 'SEARCHING',
        pickup_lat FLOAT NOT NULL,
        pickup_lng FLOAT NOT NULL,
        destination VARCHAR(255) NOT NULL,
        destination_lat FLOAT,
        destination_lng FLOAT,
        distance_km DECIMAL(6, 2),
        eta_minutes INT,
        offer_price DECIMAL(10, 2),
        final_price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`ALTER TABLE rides ADD COLUMN IF NOT EXISTS driver_vehiculo_id UUID;`);
    await pool.query(`ALTER TABLE rides ADD COLUMN IF NOT EXISTS destination_lat FLOAT;`);
    await pool.query(`ALTER TABLE rides ADD COLUMN IF NOT EXISTS destination_lng FLOAT;`);
    await pool.query(`ALTER TABLE rides ADD COLUMN IF NOT EXISTS distance_km DECIMAL(6, 2);`);
    await pool.query(`ALTER TABLE rides ADD COLUMN IF NOT EXISTS eta_minutes INT;`);
    await pool.query(`ALTER TABLE rides ADD COLUMN IF NOT EXISTS offer_price DECIMAL(10, 2);`);
    await pool.query(`ALTER TABLE rides ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);

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

    // Vehículos / perfil de conductor — lo que antes pedía
    // driver-registration.tsx sin guardar nada en ningún lado. `estado`
    // arranca en PENDIENTE: un conductor recién registrado no puede
    // conectarse a recibir viajes hasta que se aprueba (igual que Uber pide
    // "verificación de documentos" antes de dejar manejar).
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehiculos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        tipo VARCHAR(30) NOT NULL,
        marca VARCHAR(50),
        modelo VARCHAR(50),
        color VARCHAR(30),
        placa VARCHAR(20) NOT NULL,
        foto_url TEXT,
        dni_foto_url TEXT,
        iban VARCHAR(40),
        estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
        rating DECIMAL(2, 1) NOT NULL DEFAULT 5.0,
        total_viajes INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Comercios (restaurantes/tiendas) — el registro que pide esta tarea:
    // "un restaurante o un comercio puede registrarse". `estado` también
    // arranca en PENDIENTE: alguien tiene que poder revisar un comercio
    // antes de que aparezca listado para pedir, si no cualquiera pone
    // cualquier cosa y aparece ya mismo en la app.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS restaurantes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nombre VARCHAR(150) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        descripcion TEXT,
        direccion VARCHAR(255) NOT NULL,
        lat FLOAT,
        lng FLOAT,
        logo_url TEXT,
        cover_url TEXT,
        telefono VARCHAR(20),
        comision_pct DECIMAL(4, 3) NOT NULL DEFAULT 0.150,
        estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
        rating DECIMAL(2, 1) NOT NULL DEFAULT 5.0,
        tiempo_entrega_min INT DEFAULT 30,
        costo_envio DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Platos del menú de cada comercio.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurante_id UUID NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL,
        imagen_url TEXT,
        disponible BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Pedidos de comida — lo que restaurant-dashboard.tsx mostraba con
    // datos inventados (`INITIAL_ORDERS`) y un setTimeout simulando que
    // "entraba un pedido nuevo". `items` guarda una copia del pedido
    // (nombre/precio/cantidad) en el momento de comprar: si el restaurante
    // cambia después el precio de un plato, el pedido viejo no debe
    // cambiar con él.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurante_id UUID NOT NULL REFERENCES restaurantes(id),
        cliente_id UUID NOT NULL REFERENCES usuarios(id),
        items JSONB NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
        direccion_entrega VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Calificaciones — lo que rating.tsx pedía por pantalla sin que
    // `handleSubmit` guardara nada en ningún lado.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS calificaciones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
        pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
        calificador_id UUID NOT NULL REFERENCES usuarios(id),
        estrellas INT NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
        comentario TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (ride_id IS NOT NULL OR pedido_id IS NOT NULL)
      );
    `);

    // Chat del viaje — antes trip-chat.tsx mostraba dos mensajes de ejemplo
    // en estado local: "enviar" sólo agregaba a la lista propia, nunca
    // llegaba al otro lado y se perdía al cerrar la app. Se persiste acá y
    // se entrega en tiempo real reusando la sala `ride:${rideId}` que ya
    // se arma en `accept_bid` (index.js).
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mensajes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
        remitente_id UUID NOT NULL REFERENCES usuarios(id),
        texto TEXT,
        audio_url TEXT,
        leido BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (texto IS NOT NULL OR audio_url IS NOT NULL)
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

    // Índices para las consultas que de verdad hace la app (listar
    // comercios aprobados, pedidos de un restaurante, viajes de un
    // usuario) — sin esto cada una es un recorrido completo de la tabla.
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_restaurantes_estado ON restaurantes(estado);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_platos_restaurante ON platos(restaurante_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pedidos_restaurante ON pedidos(restaurante_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_rides_passenger ON rides(passenger_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_vehiculos_usuario ON vehiculos(usuario_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_publicaciones_user ON publicaciones(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_mensajes_ride ON mensajes(ride_id, created_at);`);

    console.log("✅ Tablas inicializadas correctamente.");
  } catch (err) {
    console.error("❌ Error inicializando la Base de Datos:", err);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDB
};
