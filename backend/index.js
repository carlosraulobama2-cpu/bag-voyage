require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { initDB } = require('./db');

const authRoutes = require('./routes/auth');
const publicacionesRoutes = require('./routes/publicaciones');

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

app.use(cors());
app.use(express.json());

// Rutas REST
app.use('/api/auth', authRoutes);
app.use('/api/publicaciones', publicacionesRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend funcionando' });
});

// Lógica de WebSockets (Tiempo Real)
io.on('connection', (socket) => {
    console.log(`🟢 Nuevo dispositivo conectado: ${socket.id}`);

    // Unirse a una sala de ciudad (ej. "room:malabo")
    socket.on('join_city', (city) => {
        socket.join(`room:${city}`);
        console.log(`Usuario ${socket.id} se unió a la ciudad: ${city}`);
    });

    // Pasajero solicita un viaje
    socket.on('request_ride', (data) => {
        console.log('Nueva solicitud de viaje:', data);
        // Emitir a todos los conductores en esa ciudad
        socket.to(`room:${data.city}`).emit('new_ride_request', {
            rideId: data.rideId,
            passengerId: socket.id,
            pickup: data.pickup,
            destination: data.destination,
            offerPrice: data.offerPrice
        });
    });

    // Conductor envía una contraoferta
    socket.on('send_bid', (data) => {
        console.log('Nueva oferta de conductor:', data);
        // Enviar la oferta directamente al Pasajero
        io.to(data.passengerId).emit('incoming_bid', {
            driverId: socket.id,
            driverName: data.driverName,
            price: data.price,
            distance: data.distance
        });
    });

    // Pasajero acepta una oferta
    socket.on('accept_bid', (data) => {
        console.log('Oferta aceptada:', data);
        // Avisar al conductor que ha ganado el viaje
        io.to(data.driverId).emit('bid_accepted', {
            rideId: data.rideId,
            passengerId: socket.id
        });
        
        // Aquí ambos se unirían a una sala privada "room:ride_123" para enviarse GPS en vivo
        const rideRoom = `ride:${data.rideId}`;
        socket.join(rideRoom);
        // Faltaría hacer que el conductor también se una (se puede hacer desde el cliente cuando reciba bid_accepted)
    });

    socket.on('disconnect', () => {
        console.log(`🔴 Dispositivo desconectado: ${socket.id}`);
    });
});

// Inicializar Base de Datos y arrancar el servidor
initDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Servidor Bag-Vayage (HTTP + WebSockets) corriendo en http://localhost:${PORT}`);
    });
});
