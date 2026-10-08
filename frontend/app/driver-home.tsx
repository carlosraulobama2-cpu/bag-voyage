import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, Easing, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { io, Socket } from 'socket.io-client';
import { RideMapView } from '../components/RideMapView';
import { SOCKET_URL } from '../src/config';
import { useAppStore } from '../src/store/useAppStore';

const { width, height } = Dimensions.get('window');

interface RideRequest {
  rideId: string;
  passengerId: string;
  pickup: { latitude: number; longitude: number };
  destination: string;
  offerPrice: string;
}

export default function DriverHomeScreen() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<RideRequest | null>(null);
  const [ofertaEnviada, setOfertaEnviada] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Empezar a palpitar el radar cuando estamos online buscando
  useEffect(() => {
    if (isOnline && !incomingRequest) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOnline, incomingRequest]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
  }, []);

  // Mientras está en línea, el backend necesita la posición actualizada del
  // conductor para calcular distancia/ETA real al confirmar un viaje
  // (ver `accept_bid` en el backend) — antes sólo se mandaba una vez al
  // conectar y nunca más se actualizaba.
  useEffect(() => {
    if (!isOnline || !socket) return;
    let subscripcion: Location.LocationSubscription | undefined;

    (async () => {
      subscripcion = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 20 }, (loc) => {
        setLocation(loc);
        socket.emit('update_location', { lat: loc.coords.latitude, lng: loc.coords.longitude });
      });
    })();

    return () => subscripcion?.remove();
  }, [isOnline, socket]);

  const toggleOnline = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newStatus = !isOnline;

    if (newStatus && !user) {
      Alert.alert('Iniciá sesión', 'Necesitás una cuenta para conectarte como conductor.');
      return;
    }

    setIsOnline(newStatus);

    if (newStatus) {
      // Importar dinámicamente o llamar a la función de background
      const { startBackgroundLocationTracking } = require('../utils/backgroundTasks');
      await startBackgroundLocationTracking();

      // Conectar al socket y anunciar que estamos online
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Conductor conectado:', newSocket.id);
        newSocket.emit('join_city', 'malabo');
        if (location) {
          newSocket.emit('go_online', {
            usuarioId: user!.id,
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });
        }
      });

      newSocket.on('go_online_error', (data: { message: string }) => {
        Alert.alert('No pudimos conectarte', data.message);
        setIsOnline(false);
        newSocket.disconnect();
        setSocket(null);
      });

      // Escuchar cuando un pasajero pide viaje
      newSocket.on('new_ride_request', (data: RideRequest) => {
        console.log('Nueva solicitud recibida!', data);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); // Vibración de alerta
        setOfertaEnviada(false);
        setIncomingRequest(data);
      });

      // El pasajero aceptó NUESTRA oferta (puede haber otros conductores ofertando también).
      newSocket.on('bid_accepted', () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('¡Viaje Aceptado!', 'Ve a recoger al pasajero en la ruta indicada.');
        setIncomingRequest(null);
        setOfertaEnviada(false);
      });
    } else {
      const { stopBackgroundLocationTracking } = require('../utils/backgroundTasks');
      await stopBackgroundLocationTracking();

      // Desconectar
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIncomingRequest(null);
      setOfertaEnviada(false);
    }
  };

  const acceptRide = () => {
    if (!socket || !incomingRequest) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Antes esto llamaba directo a `accept_bid`, el evento que el backend
    // espera del PASAJERO una vez que elige entre ofertas — un conductor
    // nunca podía de verdad cerrar un viaje así, `accept_bid` validaba
    // contra datos que no tenían sentido desde este lado. El conductor
    // manda su oferta (`send_bid`) y espera a que el pasajero la acepte.
    socket.emit('send_bid', {
      rideId: incomingRequest.rideId,
      passengerId: incomingRequest.passengerId,
      price: Number(incomingRequest.offerPrice),
    });
    setOfertaEnviada(true);
  };

  const initialRegion = {
    latitude: location ? location.coords.latitude : 3.7504,
    longitude: location ? location.coords.longitude : 8.7860,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => router.back()}>
          <SymbolView name={{ ios: 'line.horizontal.3', android: 'menu', web: 'menu' }} size={24} tintColor="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isOnline ? 'EN LÍNEA' : 'DESCONECTADO'}</Text>
        <View style={styles.earningsBadge}>
          <Text style={styles.earningsText}>15.000 FCFA</Text>
        </View>
      </View>

      <RideMapView
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={isOnline ? darkMapStyle : []} // Mapa oscuro si está online
      />

      {/* Radar de Búsqueda */}
      {isOnline && !incomingRequest && (
        <View style={styles.radarContainer} pointerEvents="none">
          <Animated.View style={[styles.radarCircle, { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.5], outputRange: [0.5, 0] }) }]} />
          <View style={styles.radarCenter} />
          <Text style={styles.radarText}>Buscando viajes cercanos...</Text>
        </View>
      )}

      {/* Botón Flotante para Conectarse/Desconectarse */}
      {!incomingRequest && (
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={[styles.goOnlineBtn, isOnline ? styles.goOfflineBtn : null]} 
            onPress={toggleOnline}
          >
            <Text style={styles.goOnlineText}>{isOnline ? 'DESCONECTARSE' : 'CONECTARSE (GO ONLINE)'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL DE NUEVA SOLICITUD DE VIAJE */}
      {incomingRequest && (
        <View style={styles.requestOverlay}>
          <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestTitle}>¡NUEVO VIAJE!</Text>
              <Text style={styles.timeBadge}>⏱️ 15s</Text>
            </View>

            <View style={styles.routeBox}>
              <View style={styles.routeItem}>
                <View style={[styles.dot, { backgroundColor: '#38A169' }]} />
                <Text style={styles.routeText}>A 2 min de ti</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeItem}>
                <View style={[styles.dot, { backgroundColor: '#E53E3E' }]} />
                <Text style={styles.routeText}>{incomingRequest.destination || 'Destino del Pasajero'}</Text>
              </View>
            </View>

            <View style={styles.offerBox}>
              <Text style={styles.offerLabel}>El pasajero ofrece:</Text>
              <Text style={styles.offerPrice}>{incomingRequest.offerPrice} FCFA</Text>
            </View>

            {ofertaEnviada ? (
              <Text style={styles.waitingText}>Esperando que el pasajero confirme...</Text>
            ) : (
              <>
                <TouchableOpacity style={styles.acceptBtn} onPress={acceptRide}>
                  <Text style={styles.acceptBtnText}>ACEPTAR VIAJE</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.rejectBtn} onPress={() => setIncomingRequest(null)}>
                  <Text style={styles.rejectBtnText}>Ignorar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: width, height: height },
  header: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  menuBtn: { backgroundColor: '#FFFFFF', padding: 10, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  headerTitle: { backgroundColor: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, fontWeight: 'bold', color: '#2D3748', overflow: 'hidden' },
  earningsBadge: { backgroundColor: '#1E7C67', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  earningsText: { color: '#FFFFFF', fontWeight: 'bold' },
  
  radarContainer: { position: 'absolute', top: height / 2 - 50, left: width / 2 - 50, width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  radarCircle: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#1E7C67' },
  radarCenter: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1E7C67', borderWidth: 4, borderColor: '#FFFFFF' },
  radarText: { position: 'absolute', top: 80, width: 200, textAlign: 'center', backgroundColor: '#FFFFFF', padding: 5, borderRadius: 10, fontWeight: '600', color: '#2D3748', overflow: 'hidden' },

  bottomBar: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  goOnlineBtn: { backgroundColor: '#38A169', paddingVertical: 18, borderRadius: 30, alignItems: 'center', shadowColor: '#38A169', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  goOfflineBtn: { backgroundColor: '#E53E3E', shadowColor: '#E53E3E' },
  goOnlineText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },

  // Modal de Solicitud
  requestOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', zIndex: 20 },
  requestCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  requestTitle: { fontSize: 24, fontWeight: 'bold', color: '#E53E3E' },
  timeBadge: { backgroundColor: '#EDF2F7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, fontWeight: 'bold' },
  routeBox: { backgroundColor: '#F7FAFC', padding: 15, borderRadius: 15, marginBottom: 20 },
  routeItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  routeText: { fontSize: 16, fontWeight: '600', color: '#2D3748' },
  routeLine: { width: 2, height: 20, backgroundColor: '#CBD5E0', marginLeft: 5, marginVertical: 4 },
  offerBox: { alignItems: 'center', marginBottom: 20 },
  offerLabel: { fontSize: 16, color: '#718096', marginBottom: 5 },
  offerPrice: { fontSize: 36, fontWeight: 'bold', color: '#1E7C67' },
  actionLabel: { textAlign: 'center', color: '#4A5568', marginBottom: 10, fontWeight: '600' },
  biddingActions: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  bidBtn: { flex: 1, backgroundColor: '#EDF2F7', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  bidBtnText: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
  acceptBtn: { backgroundColor: '#1E7C67', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  acceptBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  rejectBtn: { alignItems: 'center', paddingVertical: 10 },
  rejectBtnText: { color: '#718096', fontSize: 16, fontWeight: '600' },
  waitingText: { textAlign: 'center', color: '#4A5568', fontWeight: '600', paddingVertical: 15 }
});

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];
