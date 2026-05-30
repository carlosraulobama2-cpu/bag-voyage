import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const TRANSACTIONS = [
  { id: '1', title: 'Viaje a Barrio Semu', date: 'Hoy, 14:30', amount: '-1500 FCFA', type: 'expense', icon: 'car' },
  { id: '2', title: 'Recompensa Referido (CARLOS-26)', date: 'Ayer, 18:20', amount: '+500 FCFA', type: 'income', icon: 'gift' },
  { id: '3', title: 'Recarga (Cash al Conductor)', date: 'Ayer, 10:00', amount: '+5000 FCFA', type: 'income', icon: 'banknote' },
  { id: '4', title: 'Comida: Pizza Roma', date: 'Hace 3 días', amount: '-3500 FCFA', type: 'expense', icon: 'fork.knife' },
];

export default function WalletScreen() {
  const router = useRouter();

  const handleAction = (actionName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    alert(`Próximamente: ${actionName} en Guinea Ecuatorial.`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Billetera</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Tarjeta de Saldo */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Disponible</Text>
          <Text style={styles.balanceAmount}>15.000 <Text style={styles.currency}>FCFA</Text></Text>
          
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('Recargar con Dinero Móvil')}>
              <View style={styles.actionIconBox}>
                <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={20} tintColor="#1E7C67" />
              </View>
              <Text style={styles.actionBtnText}>Recargar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('Retirar Fondos')}>
              <View style={styles.actionIconBox}>
                <SymbolView name={{ ios: 'arrow.up.right', android: 'call_made', web: 'call_made' }} size={20} tintColor="#1E7C67" />
              </View>
              <Text style={styles.actionBtnText}>Retirar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('Enviar a Amigo')}>
              <View style={styles.actionIconBox}>
                <SymbolView name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }} size={20} tintColor="#1E7C67" />
              </View>
              <Text style={styles.actionBtnText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Historial de Transacciones */}
        <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
        
        {TRANSACTIONS.map(tx => (
          <View key={tx.id} style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: tx.type === 'income' ? '#E6FFFA' : '#FFF5F5' }]}>
              <SymbolView 
                name={{ ios: tx.icon as any, android: 'receipt', web: 'receipt' }} 
                size={20} 
                tintColor={tx.type === 'income' ? '#38A169' : '#E53E3E'} 
              />
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txTitle}>{tx.title}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text style={[styles.txAmount, { color: tx.type === 'income' ? '#38A169' : '#2D3748' }]}>
              {tx.amount}
            </Text>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#FFFFFF' },
  backButton: { padding: 10, backgroundColor: '#F7FAFC', borderRadius: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3748', marginLeft: 15 },
  
  content: { padding: 20 },
  
  balanceCard: { backgroundColor: '#0B3B60', borderRadius: 25, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 10, marginBottom: 30 },
  balanceLabel: { color: '#A0AEC0', fontSize: 16, marginBottom: 5 },
  balanceAmount: { color: '#FFFFFF', fontSize: 40, fontWeight: '900', marginBottom: 30 },
  currency: { fontSize: 20, fontWeight: '600', color: '#E2E8F0' },
  
  cardActions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { alignItems: 'center' },
  actionIconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginBottom: 15 },
  
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 15, marginBottom: 10 },
  txIcon: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 4 },
  txDate: { fontSize: 13, color: '#A0AEC0' },
  txAmount: { fontSize: 16, fontWeight: 'bold' }
});
