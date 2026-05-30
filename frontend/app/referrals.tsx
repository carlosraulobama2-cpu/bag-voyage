import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';

export default function ReferralsScreen() {
  const router = useRouter();
  const referralCode = 'BAG-CARLOS26';
  const reward = '500 FCFA';

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `¡Hola! Únete a Bag-Vayage, la Super App de Guinea Ecuatorial. Usa mi código ${referralCode} al registrarte y ambos ganaremos ${reward} para nuestro próximo viaje o pedido de comida. ¡Descárgala ya!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invita y Gana</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.giftIconContainer}>
          <SymbolView name={{ ios: 'gift.fill', android: 'card_giftcard', web: 'card_giftcard' }} size={80} tintColor="#D69E2E" />
        </View>

        <Text style={styles.title}>Gana Viajes Gratis</Text>
        <Text style={styles.subtitle}>
          Invita a tus amigos a usar Bag-Vayage. Cuando hagan su primer viaje o pedido, ¡ambos recibirán <Text style={styles.highlight}>{reward}</Text> en su Billetera!
        </Text>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>TU CÓDIGO DE INVITACIÓN</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{referralCode}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <SymbolView name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }} size={20} tintColor="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.shareBtnText}>Compartir Código</Text>
        </TouchableOpacity>

        <View style={styles.howItWorks}>
          <Text style={styles.howTitle}>¿Cómo funciona?</Text>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>1</Text></View>
            <Text style={styles.stepText}>Comparte tu código con un amigo.</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>2</Text></View>
            <Text style={styles.stepText}>Tu amigo se registra usando tu código.</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>3</Text></View>
            <Text style={styles.stepText}>Tu amigo completa su primer viaje.</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>4</Text></View>
            <Text style={styles.stepText}>¡Ambos recibís {reward} instantáneamente!</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  backButton: { padding: 10, backgroundColor: '#F7FAFC', borderRadius: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3748', marginLeft: 15 },
  content: { padding: 25, alignItems: 'center' },
  giftIconContainer: { width: 120, height: 120, backgroundColor: '#FEFCBF', borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2D3748', marginBottom: 15, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#718096', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  highlight: { color: '#D69E2E', fontWeight: 'bold' },
  codeContainer: { width: '100%', marginBottom: 30 },
  codeLabel: { fontSize: 12, fontWeight: 'bold', color: '#A0AEC0', marginBottom: 10, textAlign: 'center', letterSpacing: 1 },
  codeBox: { backgroundColor: '#F7FAFC', borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 15, paddingVertical: 20, alignItems: 'center' },
  codeText: { fontSize: 32, fontWeight: '900', color: '#1E7C67', letterSpacing: 2 },
  shareBtn: { flexDirection: 'row', backgroundColor: '#1E7C67', width: '100%', paddingVertical: 18, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 40, shadowColor: '#1E7C67', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  shareBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  howItWorks: { width: '100%', backgroundColor: '#F7FAFC', padding: 20, borderRadius: 15 },
  howTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginBottom: 15 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#CBD5E0', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  stepNumText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  stepText: { flex: 1, fontSize: 15, color: '#4A5568' }
});
