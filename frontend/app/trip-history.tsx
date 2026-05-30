import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';

const mockHistory = [
  { id: '1', type: 'ride', date: 'Hoy, 14:30', status: 'Completado', origin: 'Barrio Semu', destination: 'Ela Nguema', price: '1500 FCFA', driver: 'Carlos D.', rating: 5 },
  { id: '2', type: 'food', date: 'Ayer, 20:15', status: 'Entregado', restaurant: 'Pizzería Napoli', items: '2x Pizza Margarita', price: '8000 FCFA', driver: 'Marta G.', rating: 4 },
  { id: '3', type: 'courier', date: '12 de Mayo', status: 'Entregado', origin: 'Mercado Central', destination: 'Aeropuerto SSG', price: '2500 FCFA', driver: 'Luis R.', rating: 5 },
];

export default function TripHistoryScreen() {
  const router = useRouter();
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const openReceipt = (item: any) => {
    Haptics.selectionAsync();
    setSelectedReceipt(item);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'ride': return { name: { ios: 'car.fill', android: 'directions_car', web: 'directions_car' } as any, color: '#1E7C67', bg: '#E6FFFA' };
      case 'food': return { name: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' } as any, color: '#DD6B20', bg: '#FEEBC8' };
      case 'courier': return { name: { ios: 'cube.box.fill', android: 'local_shipping', web: 'local_shipping' } as any, color: '#3182CE', bg: '#EBF8FF' };
      default: return { name: { ios: 'star', android: 'star', web: 'star' } as any, color: '#718096', bg: '#EDF2F7' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Actividades</Text>
      </View>

      <ScrollView style={styles.list}>
        {mockHistory.map((item) => {
          const icon = getIconForType(item.type);
          return (
            <TouchableOpacity key={item.id} style={styles.historyCard} onPress={() => openReceipt(item)}>
              <View style={[styles.iconBox, { backgroundColor: icon.bg }]}>
                <SymbolView name={icon.name} size={24} tintColor={icon.color} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.type === 'food' ? item.restaurant : item.destination}</Text>
                <Text style={styles.cardSubtitle}>{item.date}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardPrice}>{item.price}</Text>
                <Text style={styles.cardStatus}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Recibo / Ticket Modal */}
      <Modal visible={!!selectedReceipt} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>Recibo Electrónico</Text>
              <TouchableOpacity onPress={() => setSelectedReceipt(null)}>
                <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }} size={30} tintColor="#A0AEC0" />
              </TouchableOpacity>
            </View>

            {selectedReceipt && (
              <>
                <Text style={styles.receiptDate}>{selectedReceipt.date}</Text>
                
                <View style={styles.receiptDivider} />
                
                <Text style={styles.receiptLabel}>Total Cobrado</Text>
                <Text style={styles.receiptTotal}>{selectedReceipt.price}</Text>
                
                <View style={styles.receiptDivider} />

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Realizado por:</Text>
                  <Text style={styles.receiptValue}>{selectedReceipt.driver}</Text>
                </View>
                
                {selectedReceipt.type === 'ride' || selectedReceipt.type === 'courier' ? (
                  <>
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptLabel}>Origen:</Text>
                      <Text style={styles.receiptValue}>{selectedReceipt.origin}</Text>
                    </View>
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptLabel}>Destino:</Text>
                      <Text style={styles.receiptValue}>{selectedReceipt.destination}</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Pedido:</Text>
                    <Text style={styles.receiptValue}>{selectedReceipt.items}</Text>
                  </View>
                )}
                
                <View style={styles.receiptDivider} />
                
                <TouchableOpacity style={styles.downloadBtn} onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  alert('Recibo descargado en PDF');
                }}>
                  <SymbolView name={{ ios: 'arrow.down.doc.fill', android: 'file_download', web: 'file_download' }} size={20} tintColor="#FFFFFF" style={{ marginRight: 10 }} />
                  <Text style={styles.downloadBtnText}>Descargar PDF</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  backButton: { padding: 10, backgroundColor: '#F7FAFC', borderRadius: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3748', marginLeft: 15 },
  list: { padding: 20 },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  iconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#718096' },
  cardRight: { alignItems: 'flex-end' },
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#1E7C67', marginBottom: 4 },
  cardStatus: { fontSize: 12, color: '#A0AEC0' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  receiptCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50, minHeight: 400 },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  receiptTitle: { fontSize: 22, fontWeight: 'bold', color: '#2D3748' },
  receiptDate: { fontSize: 14, color: '#718096', textAlign: 'center', marginBottom: 20 },
  receiptTotal: { fontSize: 36, fontWeight: 'bold', color: '#2D3748', textAlign: 'center', marginVertical: 10 },
  receiptDivider: { height: 1, backgroundColor: '#EDF2F7', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E0', marginVertical: 20 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  receiptLabel: { fontSize: 15, color: '#718096', textAlign: 'center' },
  receiptValue: { fontSize: 15, fontWeight: '600', color: '#2D3748', maxWidth: '60%', textAlign: 'right' },
  downloadBtn: { flexDirection: 'row', backgroundColor: '#2D3748', paddingVertical: 18, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  downloadBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
