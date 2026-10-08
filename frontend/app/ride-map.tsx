import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, TextInput, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { io, Socket } from 'socket.io-client';
import { RideMapView } from '../components/RideMapView';

const { width, height } = Dimensions.get('window');

// Para probar en Simulador iOS es localhost. Para Emulador Android es 10.0.2.2
const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const mockDrivers = [
  { id: '1', lat: 3.7504, lng: 8.7860, type: 'Coche' },
  { id: '2', lat: 3.7520, lng: 8.7810, type: 'Coche' },
];

// --- BASE DE DATOS LOCAL DE GUINEA ECUATORIAL (Simulando el escáner) ---
const EG_LOCATIONS = [
  'Barrio Semu, Malabo',
  'Ela Nguema, Malabo',
  'Perez, Malabo',
  'Aeropuerto SSG, Malabo',
  'Mercado Central, Malabo',
  'Sampaka, Malabo',
  'Banapa, Malabo',
  'Buena Esperanza, Malabo',
  'Paseo Marítimo, Malabo'
];

export default function RideMapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [destination, setDestination] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [status, setStatus] = useState<'idle' | 'bidding' | 'found'>('idle');
  const [scheduleTime, setScheduleTime] = useState('Ahora');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [incomingBids, setIncomingBids] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1);
  const basePrice = 1500;
  const finalPrice = basePrice * surgeMultiplier;

  useEffect(() => {
    // Simulamos un algoritmo de Surge Pricing: Alta Demanda aleatoria
    const isHighDemand = Math.random() > 0.4; // 60% probabilidad de alta demanda
    if (isHighDemand) {
      setSurgeMultiplier(1.5); // x1.5 el precio base
    }

    // 1. Pedir Ubicación
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permiso de ubicación denegado');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();

    // 2. Conectar al Servidor de Tiempo Real
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Conectado al servidor WebSocket:', newSocket.id);
      newSocket.emit('join_city', 'malabo');
    });

    // 3. Escuchar ofertas reales del servidor
    newSocket.on('incoming_bid', (data) => {
      console.log('Recibida oferta del servidor:', data);
      setIncomingBids(prev => [...prev, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleRequestRide = () => {
    if (!destination) {
      Alert.alert('Faltan Datos', 'Por favor ingresa un destino.');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setStatus('bidding'); // Lo usaremos como estado de "buscando"

    // Enviar solicitud REAL al servidor WebSocket
    if (socket) {
      socket.emit('request_ride', {
        rideId: Math.random().toString(36).substring(7),
        city: 'malabo',
        pickup: location ? location.coords : { latitude: 3.7504, longitude: 8.7860 },
        destination: destination,
        offerPrice: finalPrice.toString() // Precio dinámico
      });
    }

    // MOCK: Simulamos que tras 3 segundos, encuentra un conductor y lo asigna automáticamente
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '¡Conductor Encontrado!',
        'Carlos Díaz va en camino a recogerte.',
        [{ text: 'Ver Viaje', onPress: () => router.push('/active-trip') }]
      );
      setStatus('idle');
    }, 3000);
  };

  const acceptBid = (bid: any) => {
    // Avisar al servidor que aceptamos
    if (socket) {
      socket.emit('accept_bid', {
        rideId: 'dummy_ride_id',
        driverId: bid.driverId
      });
    }
    // Navegar a Viaje Activo
    router.push('/active-trip');
  };

  const initialRegion = {
    latitude: location ? location.coords.latitude : 3.7504,
    longitude: location ? location.coords.longitude : 8.7860,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor="#2D3748" />
      </TouchableOpacity>

      <RideMapView style={styles.map} initialRegion={initialRegion} markers={mockDrivers.map((d) => ({ id: d.id, lat: d.lat, lng: d.lng }))} />

      <View style={styles.bottomPanel}>
        {status === 'idle' && (
          <>
            <Text style={styles.panelTitle}>¿A dónde vas?</Text>
            
            {/* Selector de Tiempo (Ahora vs Programado) */}
            <View style={styles.scheduleRow}>
              <TouchableOpacity 
                style={[styles.scheduleBtn, scheduleTime === 'Ahora' && styles.scheduleBtnActive]}
                onPress={() => setScheduleTime('Ahora')}
              >
                <SymbolView name={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' }} size={16} tintColor={scheduleTime === 'Ahora' ? '#FFFFFF' : '#718096'} />
                <Text style={[styles.scheduleBtnText, scheduleTime === 'Ahora' && {color: '#FFFFFF'}]}>Ahora</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.scheduleBtn, scheduleTime !== 'Ahora' && styles.scheduleBtnActive]}
                onPress={() => {
                  Alert.prompt(
                    'Programar Viaje',
                    '¿A qué hora quieres que te recojan? (Ej. 10:00, o dentro de 5 horas)',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Programar', onPress: (time?: string) => setScheduleTime(time || 'Programado') }
                    ]
                  );
                }}
              >
                <SymbolView name={{ ios: 'calendar', android: 'event', web: 'event' }} size={16} tintColor={scheduleTime !== 'Ahora' ? '#FFFFFF' : '#718096'} />
                <Text style={[styles.scheduleBtnText, scheduleTime !== 'Ahora' && {color: '#FFFFFF'}]}>
                  {scheduleTime === 'Ahora' ? 'Programar' : scheduleTime}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ zIndex: 50 }}>
              <View style={styles.inputContainer}>
                <View style={[styles.dot, { backgroundColor: '#E53E3E' }]} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Destino (Ej. Barrio Semu)" 
                  value={destination} 
                  onChangeText={(text) => {
                    setDestination(text);
                    // Mostrar sugerencias si hay más de 1 letra
                    if(text.length > 1) {
                      setSuggestions(EG_LOCATIONS.filter(loc => loc.toLowerCase().includes(text.toLowerCase())));
                    } else {
                      setSuggestions([]);
                    }
                  }} 
                />
              </View>
              
              {/* Dropdown de Sugerencias (Autocompletado) */}
              {suggestions.length > 0 && (
                <View style={styles.suggestionsDropdown}>
                  {suggestions.map((item, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.suggestionItem}
                      onPress={() => {
                        setDestination(item);
                        setSuggestions([]);
                        Haptics.selectionAsync();
                      }}
                    >
                      <SymbolView name={{ ios: 'mappin.and.ellipse', android: 'place', web: 'place' }} size={16} tintColor="#A0AEC0" />
                      <Text style={styles.suggestionText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Campo clave para África: Punto de Referencia */}
            <View style={styles.inputContainer}>
              <SymbolView name={{ ios: 'mappin.and.ellipse', android: 'my_location', web: 'my_location' }} size={16} tintColor="#718096" style={{ marginRight: 5 }} />
              <TextInput 
                style={styles.input} 
                placeholder="Referencia (Ej. Frente a farmacia, casa azul)" 
                placeholderTextColor="#A0AEC0"
              />
            </View>

            {/* Mostrar precio dinámico si hay un destino */}
            {destination ? (
              <View style={[styles.fixedPriceCard, surgeMultiplier > 1 && { borderColor: '#E53E3E', backgroundColor: '#FFF5F5' }]}>
                <View>
                  <Text style={[styles.fixedPriceLabel, surgeMultiplier > 1 && { color: '#C53030' }]}>Precio del viaje:</Text>
                  {surgeMultiplier > 1 && <Text style={{ fontSize: 12, color: '#E53E3E', fontWeight: 'bold' }}>⚡ Alta demanda</Text>}
                </View>
                <Text style={[styles.fixedPriceValue, surgeMultiplier > 1 && { color: '#E53E3E' }]}>{finalPrice} FCFA</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.requestBtn} onPress={handleRequestRide}>
              <Text style={styles.requestBtnText}>Solicitar Viaje</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'bidding' && (
          <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1E7C67" style={{ marginBottom: 20 }} />
            <Text style={styles.searchingTitle}>Buscando al conductor más cercano...</Text>
            <Text style={styles.searchingSub}>Asignación automática por {finalPrice} FCFA</Text>

            <TouchableOpacity style={styles.cancelLink} onPress={() => setStatus('idle')}>
              <Text style={styles.cancelLinkText}>Cancelar búsqueda</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: width, height: height },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: '#FFFFFF', padding: 10, borderRadius: 20, zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  bottomPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  panelTitle: { fontSize: 22, fontWeight: 'bold', color: '#2D3748', marginBottom: 15 },
  scheduleRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  scheduleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDF2F7', paddingVertical: 12, borderRadius: 10 },
  scheduleBtnActive: { backgroundColor: '#1E7C67' },
  scheduleBtnText: { marginLeft: 8, fontSize: 14, fontWeight: 'bold', color: '#4A5568' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF2F7', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#2D3748' },
  suggestionsDropdown: { position: 'absolute', top: 55, left: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10, zIndex: 100 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  suggestionText: { marginLeft: 10, fontSize: 16, color: '#4A5568' },
  requestBtn: { backgroundColor: '#1E7C67', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  requestBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  fixedPriceCard: { backgroundColor: '#F0FFF4', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#9AE6B4', marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fixedPriceLabel: { fontSize: 16, color: '#276749', fontWeight: '600' },
  fixedPriceValue: { fontSize: 20, color: '#22543D', fontWeight: 'bold' },
  searchingTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', textAlign: 'center' },
  searchingSub: { fontSize: 14, color: '#718096', textAlign: 'center', marginTop: 5, marginBottom: 20 },
  biddingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  bidCard: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, marginBottom: 10 },
  bidInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  bidAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#CBD5E0', marginRight: 15 },
  bidName: { fontSize: 16, fontWeight: 'bold', color: '#2D3748' },
  bidCar: { fontSize: 12, color: '#718096', marginTop: 2 },
  bidPrice: { fontSize: 18, fontWeight: 'bold', color: '#D69E2E' },
  acceptBidBtn: { backgroundColor: '#2D3748', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  acceptBidText: { color: '#FFFFFF', fontWeight: 'bold' },
  cancelLink: { marginTop: 15, alignItems: 'center' },
  cancelLinkText: { color: '#E53E3E', fontWeight: '600' },
});
