require('dotenv').config();
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const { initDB } = require('./db');
const db = require('./db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { calcularDistanciaKm, estimarEtaMinutos } = require('./utils/geo');

const authRoutes = require('./routes/auth');
const publicacionesRoutes = require('./routes/publicaciones');
const legalRoutes = require('./routes/legal');
const vehiculosRoutes = require('./routes/vehiculos');
const restaurantesRoutes = require('./routes/restaurantes');
const pedidosRoutes = require('./routes/pedidos');
const ridesRoutes = require('./routes/rides');
const calificacionesRoutes = require('./routes/calificaciones');
const { router: uploadsRoutes, UPLOADS_DIR } = require('./routes/uploads');

const app = express();
// Crear servidor HTTP explícito para poder adjuntarle Socket.io
const server = http.createServer(app);

// Configurar Socket.io con CORS permisivo
const io = new Server(server, {
  cors: {
    origin: '*', // En producción, restringir al dominio de la app
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Límite general — las rutas de auth tienen uno propio más estricto (ver routes/auth.js).
app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiadas peticiones, probá de nuevo en un momento.' },
  }),
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend funcionando' });
});

// Fotos subidas (DNI, auto, logo/portada de comercio, platos). El propio
// backend web y el panel del comercio viven en otro origen que la API —
// sin este override, `helmet()` pone `Cross-Origin-Resource-Policy:
// same-origin` en toda respuesta por defecto, y el navegador descarta la
// imagen aunque el archivo exista (ver el mismo fix en Peyma Music).
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }), express.static(UPLOADS_DIR));

// Rutas REST
app.use('/api/auth', authRoutes);
app.use('/api/publicaciones', publicacionesRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/restaurantes', restaurantesRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/calificaciones', calificacionesRoutes);
app.use('/api/uploads', uploadsRoutes);

/**
 * Estado en memoria de conductores en línea: sólo necesita vivir mientras
 * el proceso corre (si se reinicia el servidor, cada conductor vuelve a
 * mandar `go_online` al reconectar el socket) — no es historial, es "dónde
 * está cada uno AHORA", así que no amerita una tabla ni sobrevive a un
 * restart por diseño, igual que la posición en vivo de Uber tampoco es
 * algo que se audite después.
 */
const conductoresEnLinea = new Map(); // socket.id -> { usuarioId, vehiculoId, lat, lng, nombre, apellidos, vehiculo }

// Lógica de WebSockets (Tiempo Real)
io.on('connection', (socket) => {
    console.log(`🟢 Nuevo dispositivo conectado: ${socket.id}`);

    // Unirse a una sala de ciudad (ej. "room:malabo")
    socket.on('join_city', (city) => {
        socket.join(`room:${city}`);
        console.log(`Usuario ${socket.id} se unió a la ciudad: ${city}`);
    });

    /**
     * Conductor se conecta a recibir viajes. Antes de esto, `send_bid` no
     * tenía forma de decir QUIÉN es el conductor (nombre, auto, rating) —
     * sólo mandaba `socket.id`, así que ride-map.tsx nunca pudo mostrar el
     * perfil real de quien te viene a buscar, sólo lo que el propio cliente
     * del conductor quisiera mandar (sin verificar nada contra la base).
     */
    socket.on('go_online', async (data) => {
        try {
            const { rows } = await db.query(
                `SELECT u.id AS usuario_id, u.nombre, u.apellidos, v.id AS vehiculo_id, v.marca, v.modelo,
                        v.color, v.placa, v.foto_url, v.rating
                 FROM usuarios u JOIN vehiculos v ON v.usuario_id = u.id
                 WHERE u.id = $1 AND v.estado = 'APROBADO'`,
                [data.usuarioId],
            );
            if (rows.length === 0) {
                socket.emit('go_online_error', { message: 'Tu vehículo todavía no está aprobado.' });
                return;
            }
            conductoresEnLinea.set(socket.id, { ...rows[0], lat: data.lat, lng: data.lng });
            socket.emit('go_online_ok');
        } catch (err) {
            console.error('Error en go_online:', err);
            socket.emit('go_online_error', { message: 'No pudimos conectarte. Probá de nuevo.' });
        }
    });

    /** El conductor manda su posición cada pocos segundos mientras está en línea — para calcular "a qué distancia está" en tiempo real. */
    socket.on('update_location', (data) => {
        const conductor = conductoresEnLinea.get(socket.id);
        if (conductor) {
            conductor.lat = data.lat;
            conductor.lng = data.lng;
        }
    });

    socket.on('disconnect', () => {
        conductoresEnLinea.delete(socket.id);
        console.log(`🔴 Dispositivo desconectado: ${socket.id}`);
    });

    // Pasajero solicita un viaje (el rideId ya viene de un POST /api/rides previo — ver app/ride-map.tsx)
    socket.on('request_ride', (data) => {
        console.log('Nueva solicitud de viaje:', data);
        socket.join(`ride:${data.rideId}`);
        // Emitir a todos los conductores en esa ciudad
        socket.to(`room:${data.city}`).emit('new_ride_request', {
            rideId: data.rideId,
            passengerId: socket.id,
            pickup: data.pickup,
            destination: data.destination,
            offerPrice: data.offerPrice
        });
    });

    // Conductor envía una contraoferta — se persiste en `bids` (antes se reenviaba sin guardar nada).
    socket.on('send_bid', async (data) => {
        try {
            const conductor = conductoresEnLinea.get(socket.id);
            const { rows } = await db.query(
                `INSERT INTO bids (ride_id, driver_id, offer_amount) VALUES ($1, $2, $3) RETURNING id`,
                [data.rideId, conductor?.usuario_id || null, data.price],
            );
            io.to(data.passengerId).emit('incoming_bid', {
                bidId: rows[0].id,
                driverSocketId: socket.id,
                driverId: conductor?.usuario_id,
                driverName: conductor ? `${conductor.nombre} ${conductor.apellidos}`.trim() : data.driverName,
                price: data.price,
                distance: data.distance,
            });
        } catch (err) {
            console.error('Error en send_bid:', err);
        }
    });

    /**
     * Pasajero acepta una oferta — acá es donde antes TODO lo que pedía
     * esta tarea ("ver el perfil y el coche que te vienen a coger, a qué
     * distancia está, cuánto va a durar") era imposible: no había
     * vehículo, ni distancia, ni ETA del lado del conductor, sólo un
     * `driverId` suelto. Ahora se arma el perfil completo del conductor +
     * su auto + distancia/ETA hasta el punto de recogida (en base a su
     * última posición conocida) y se guarda el emparejamiento en `rides`.
     */
    socket.on('accept_bid', async (data) => {
        try {
            const conductor = conductoresEnLinea.get(data.driverSocketId);
            if (!conductor) {
                socket.emit('accept_bid_error', { message: 'El conductor ya no está disponible.' });
                return;
            }

            const ride = await db.query(
                `UPDATE rides SET driver_id = $1, driver_vehiculo_id = $2, status = 'ACCEPTED', final_price = $3, updated_at = NOW()
                 WHERE id = $4 RETURNING pickup_lat, pickup_lng`,
                [conductor.usuario_id, conductor.vehiculo_id, data.price, data.rideId],
            );
            const pickup = ride.rows[0];

            let distanciaConductorKm = null;
            let etaConductorMinutos = null;
            if (pickup && conductor.lat != null && conductor.lng != null) {
                distanciaConductorKm = calcularDistanciaKm(conductor.lat, conductor.lng, pickup.pickup_lat, pickup.pickup_lng);
                etaConductorMinutos = estimarEtaMinutos(distanciaConductorKm);
            }

            const rideRoom = `ride:${data.rideId}`;
            socket.join(rideRoom);
            io.sockets.sockets.get(data.driverSocketId)?.join(rideRoom);

            const payloadConductor = {
                rideId: data.rideId,
                conductor: {
                    id: conductor.usuario_id,
                    nombre: conductor.nombre,
                    apellidos: conductor.apellidos,
                    rating: conductor.rating,
                },
                vehiculo: {
                    marca: conductor.marca,
                    modelo: conductor.modelo,
                    color: conductor.color,
                    placa: conductor.placa,
                    fotoUrl: conductor.foto_url,
                },
                distanciaKm: distanciaConductorKm != null ? Number(distanciaConductorKm.toFixed(1)) : null,
                etaMinutos: etaConductorMinutos,
            };

            // Al pasajero: el perfil completo (lo que pedía la tarea). Al conductor: sólo que ganó el viaje.
            socket.emit('ride_matched', payloadConductor);
            io.to(data.driverSocketId).emit('bid_accepted', { rideId: data.rideId, passengerId: socket.id });
        } catch (err) {
            console.error('Error en accept_bid:', err);
            socket.emit('accept_bid_error', { message: 'No pudimos confirmar el viaje. Probá de nuevo.' });
        }
    });
});

app.use(notFoundHandler);
app.use(errorHandler);

// Inicializar Base de Datos y arrancar el servidor
initDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Servidor Bag-Vayage (HTTP + WebSockets) corriendo en http://localhost:${PORT}`);
    });
});
