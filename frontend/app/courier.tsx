import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function CourierScreen() {
  const router = useRouter();
  
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [packageSize, setPackageSize] = useState<'small' | 'medium' | 'large'>('small');
  
  const [pin, setPin] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleRequestCourier = () => {
    if (!pickup || !dropoff || !recipientName || !recipientPhone) {
      Alert.alert('Faltan Datos', 'Por favor rellena todos los campos para enviar el paquete de forma segura.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSearching(true);
    
    // Generar PIN de seguridad de 4 dígitos
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Simulamos búsqueda de conductor y generación de PIN
    setTimeout(() => {
      setPin(generatedPin);
      setIsSearching(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2500);
  };

  const handleFinish = () => {
    // Al cerrar, limpiar e ir al mapa activo (simulando que la moto ya va en camino)
    router.replace('/active-trip');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enviar Paquete</Text>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        
        {/* Banner Informativo */}
        <View style={styles.banner}>
          <SymbolView name={{ ios: 'shield.fill', android: 'security', web: 'security' }} size={30} tintColor="#D69E2E" />
          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={styles.bannerTitle}>Envíos 100% Seguros</Text>
            <Text style={styles.bannerText}>Generaremos un PIN secreto. El conductor no entregará el paquete hasta que el destinatario le diga este PIN.</Text>
          </View>
        </View>

        {/* Sección de Rutas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ruta del Envío</Text>
          
          <View style={styles.inputContainer}>
            <View style={[styles.dot, { backgroundColor: '#38A169' }]} />
            <TextInput 
              style={styles.input} 
              placeholder="¿Dónde recogemos? (Ej. Barrio Semu)" 
              value={pickup} 
              onChangeText={setPickup} 
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={[styles.dot, { backgroundColor: '#E53E3E' }]} />
            <TextInput 
              style={styles.input} 
              placeholder="¿Dónde entregamos? (Ej. Mercado Central)" 
              value={dropoff} 
              onChangeText={setDropoff} 
            />
          </View>
        </View>

        {/* Datos del Destinatario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Quién recibe?</Text>
          
          <View style={styles.inputContainer}>
            <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} size={16} tintColor="#A0AEC0" style={{ marginRight: 10 }} />
            <TextInput 
              style={styles.input} 
              placeholder="Nombre del destinatario" 
              value={recipientName} 
              onChangeText={setRecipientName} 
            />
          </View>

          <View style={styles.inputContainer}>
            <SymbolView name={{ ios: 'phone.fill', android: 'phone', web: 'phone' }} size={16} tintColor="#A0AEC0" style={{ marginRight: 10 }} />
            <TextInput 
              style={styles.input} 
              placeholder="Teléfono (Para llamarle al llegar)" 
              value={recipientPhone} 
              onChangeText={setRecipientPhone} 
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Tamaño del Paquete */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tamaño del Paquete</Text>
          <View style={styles.sizeRow}>
            <TouchableOpacity 
              style={[styles.sizeCard, packageSize === 'small' && styles.sizeCardActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPackageSize('small'); }}
            >
              <SymbolView name={{ ios: 'envelope', android: 'mail', web: 'mail' }} size={24} tintColor={packageSize === 'small' ? '#1E7C67' : '#718096'} />
              <Text style={[styles.sizeTitle, packageSize === 'small' && { color: '#1E7C67' }]}>Pequeño</Text>
              <Text style={styles.sizeSub}>Documentos, llaves</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sizeCard, packageSize === 'medium' && styles.sizeCardActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPackageSize('medium'); }}
            >
              <SymbolView name={{ ios: 'shippingbox', android: 'inventory_2', web: 'inventory_2' }} size={24} tintColor={packageSize === 'medium' ? '#1E7C67' : '#718096'} />
              <Text style={[styles.sizeTitle, packageSize === 'medium' && { color: '#1E7C67' }]}>Mediano</Text>
              <Text style={styles.sizeSub}>Ropa, cajas pequeñas</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer / Botón */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleRequestCourier} disabled={isSearching}>
          <Text style={styles.submitBtnText}>
            {isSearching ? 'Buscando repartidor...' : 'Solicitar Envío Seguro'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DEL PIN DE SEGURIDAD */}
      {pin && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <SymbolView name={{ ios: 'lock.shield.fill', android: 'verified_user', web: 'verified_user' }} size={50} tintColor="#38A169" />
            <Text style={styles.modalTitle}>¡Repartidor Encontrado!</Text>
            <Text style={styles.modalDesc}>Comparte este código de 4 dígitos con <Text style={{fontWeight:'bold'}}>{recipientName}</Text>. El repartidor no le dará el paquete si no le dicta este código.</Text>
            
            <View style={styles.pinBox}>
              <Text style={styles.pinText}>{pin}</Text>
            </View>
            
            <View style={styles.sharePinBtn}>
              <SymbolView name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }} size={18} tintColor="#FFFFFF" />
              <Text style={styles.sharePinText}>Enviar PIN por WhatsApp</Text>
            </View>

            <TouchableOpacity style={styles.closeModalBtn} onPress={handleFinish}>
              <Text style={styles.closeModalText}>Ver ruta en el Mapa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 15, paddingHorizontal: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#EDF2F7' },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3748' },
  
  scrollArea: { flex: 1, padding: 20 },
  
  banner: { flexDirection: 'row', backgroundColor: '#FEFCBF', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 25 },
  bannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#B7791F', marginBottom: 3 },
  bannerText: { fontSize: 13, color: '#975A16', lineHeight: 18 },
  
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginBottom: 15 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#2D3748' },
  
  sizeRow: { flexDirection: 'row', gap: 10 },
  sizeCard: { flex: 1, backgroundColor: '#F7FAFC', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 15, padding: 15, alignItems: 'center' },
  sizeCardActive: { borderColor: '#1E7C67', backgroundColor: '#E6FFFA' },
  sizeTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A5568', marginTop: 10 },
  sizeSub: { fontSize: 12, color: '#718096', marginTop: 5, textAlign: 'center' },
  
  footer: { padding: 20, paddingBottom: 40, borderTopWidth: 1, borderColor: '#EDF2F7', backgroundColor: '#FFFFFF' },
  submitBtn: { backgroundColor: '#1E7C67', paddingVertical: 18, borderRadius: 15, alignItems: 'center', shadowColor: '#1E7C67', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 30 },
  modalCard: { backgroundColor: '#FFFFFF', width: width * 0.85, borderRadius: 25, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 15 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#2D3748', marginTop: 15, marginBottom: 10 },
  modalDesc: { fontSize: 14, color: '#718096', textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  pinBox: { backgroundColor: '#EDF2F7', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, marginBottom: 25, borderWidth: 2, borderColor: '#CBD5E0', borderStyle: 'dashed' },
  pinText: { fontSize: 40, fontWeight: 'bold', color: '#2D3748', letterSpacing: 10 },
  sharePinBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#38A169', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, marginBottom: 20 },
  sharePinText: { color: '#FFFFFF', fontWeight: 'bold', marginLeft: 10 },
  closeModalBtn: { marginTop: 10 },
  closeModalText: { fontSize: 16, fontWeight: 'bold', color: '#1E7C67' }
});
