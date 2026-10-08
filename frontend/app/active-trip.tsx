import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { scheduleRatingReminder } from '../utils/smartNotifications';
import { RideMapView } from '../components/RideMapView';

const { width, height } = Dimensions.get('window');

export default function ActiveTripScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    rideId?: string;
    destination?: string;
    price?: string;
    driverNombre?: string;
    driverApellidos?: string;
    driverRating?: string;
    vehiculoMarca?: string;
    vehiculoModelo?: string;
    vehiculoColor?: string;
    vehiculoPlaca?: string;
    vehiculoFotoUrl?: string;
    distanciaKm?: string;
    etaMinutos?: string;
  }>();

  const driverName = params.driverNombre ? `${params.driverNombre} ${params.driverApellidos || ''}`.trim() : 'Carlos Díaz';
  const carDetails = [params.vehiculoMarca, params.vehiculoModelo].filter(Boolean).join(' ') || 'Vehículo';
  const carPlate = params.vehiculoPlaca || '----';
  const etaMinutos = params.etaMinutos ? Number(params.etaMinutos) : null;
  const distanciaKm = params.distanciaKm ? Number(params.distanciaKm) : null;
  const destinationText = params.destination || 'tu destino';
  const priceText = params.price || '1500';

  // Posición inicial del conductor (simulada cerca de Malabo)
  const [driverLocation, setDriverLocation] = useState({
    latitude: 3.7504,
    longitude: 8.7860,
  });

  useEffect(() => {
    // Vibración (Haptic Feedback) pesada cuando se abre la pantalla (simula que el conductor llegó/empezó el viaje)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Simular el movimiento suave del coche (Interpolación básica de estado)
    const interval = setInterval(() => {
      setDriverLocation(prev => ({
        latitude: prev.latitude + 0.0001,
        longitude: prev.longitude + 0.0001,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSOS = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      '🚨 EMERGENCIA (SOS)',
      '¿Estás en peligro? Notificaremos a las autoridades y a tus contactos de confianza inmediatamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Llamar a Policía', style: 'destructive' },
      ]
    );
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Compartir', 'Enlace de rastreo en vivo copiado al portapapeles. ¡Envíalo por WhatsApp!');
  };

  return (
    <View style={styles.container}>
      <RideMapView
        style={styles.map}
        region={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        markers={[{ id: 'driver', lat: driverLocation.latitude, lng: driverLocation.longitude, anchorCenter: true, rotateDeg: 45 }]}
      />

      {/* Botones Flotantes de Seguridad */}
      <View style={styles.floatingTopBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <SymbolView name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} size={24} tintColor="#2D3748" />
        </TouchableOpacity>
        
        <View style={styles.safetyButtons}>
          <TouchableOpacity 
            style={styles.finishBtn} 
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              scheduleRatingReminder(driverName);
              router.replace({ pathname: '/rating', params: { type: 'trip' } });
            }}
          >
            <Text style={styles.finishBtnText}>Finalizar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <SymbolView name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }} size={16} tintColor="#2D3748" />
            <Text style={styles.shareBtnText}>Compartir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sosBtn} onPress={handleSOS}>
            <Text style={styles.sosBtnText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Panel Inferior (Conductor y Progreso) */}
      <View style={styles.bottomPanel}>
        <View style={styles.progressHeader}>
          <Text style={styles.timeText}>{etaMinutos != null ? `${etaMinutos} min` : '-- min'}</Text>
          <Text style={styles.arrivalText}>{distanciaKm != null ? `A ${distanciaKm} km de vos` : 'Llegando'}</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '40%' }]} />
        </View>

        <Text style={styles.destinationText}>Hacia: {destinationText}</Text>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.driverInfoRow}
          onPress={() => router.push('/driver-profile')}
        >
          <View style={styles.avatarContainer}>
            {params.vehiculoFotoUrl ? (
              <Image source={{ uri: params.vehiculoFotoUrl }} style={styles.avatarPlaceholder} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
            <View style={styles.vipBadge}>
              <SymbolView name={{ ios: 'star.fill', android: 'star', web: 'star' }} size={10} tintColor="#FFFFFF" />
            </View>
          </View>

          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{driverName}</Text>
            <Text style={styles.carDetails}>{carDetails}{params.vehiculoColor ? ` ${params.vehiculoColor}` : ''} • {carPlate}</Text>
            {params.driverRating && <Text style={styles.carDetails}>⭐ {params.driverRating}</Text>}
          </View>

          <View style={styles.contactActions}>
            <TouchableOpacity 
              style={styles.actionCircle} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/trip-chat');
              }}
            >
              <SymbolView name={{ ios: 'message.fill', android: 'chat', web: 'chat' }} size={20} tintColor="#2D3748" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCircle} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <SymbolView name={{ ios: 'phone.fill', android: 'phone', web: 'phone' }} size={20} tintColor="#2D3748" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View style={styles.paymentRow}>
          <View style={styles.walletBadge}>
            <SymbolView name={{ ios: 'creditcard.fill', android: 'wallet', web: 'wallet' }} size={16} tintColor="#1E7C67" />
            <Text style={styles.walletText}>Bag-Vayage Wallet</Text>
          </View>
          <Text style={styles.priceText}>{priceText} FCFA</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: width, height: height },

  floatingTopBar: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  iconBtn: { backgroundColor: '#FFFFFF', width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  safetyButtons: { flexDirection: 'row', gap: 10 },
  finishBtn: { backgroundColor: '#38A169', justifyContent: 'center', paddingHorizontal: 15, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  finishBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  shareBtn: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  shareBtnText: { marginLeft: 5, fontWeight: 'bold', color: '#2D3748' },
  sosBtn: { backgroundColor: '#E53E3E', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  sosBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },

  bottomPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  timeText: { fontSize: 24, fontWeight: 'bold', color: '#1E7C67' },
  arrivalText: { fontSize: 16, color: '#718096', alignSelf: 'flex-end', paddingBottom: 3 },
  progressBar: { height: 6, backgroundColor: '#EDF2F7', borderRadius: 3, marginBottom: 15 },
  progressFill: { height: '100%', backgroundColor: '#1E7C67', borderRadius: 3 },
  destinationText: { fontSize: 16, fontWeight: '600', color: '#2D3748' },
  
  divider: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 20 },
  
  driverInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarContainer: { position: 'relative', marginRight: 15 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#CBD5E0' },
  vipBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#D69E2E', borderRadius: 10, padding: 2, borderWidth: 2, borderColor: '#FFFFFF' },
  driverDetails: { flex: 1 },
  driverName: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
  carDetails: { fontSize: 14, color: '#718096', marginTop: 2 },
  contactActions: { flexDirection: 'row', gap: 10 },
  actionCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EDF2F7', justifyContent: 'center', alignItems: 'center' },

  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F7FAFC', padding: 15, borderRadius: 12 },
  walletBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6FFFA', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  walletText: { marginLeft: 5, color: '#1E7C67', fontWeight: 'bold', fontSize: 12 },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
});
