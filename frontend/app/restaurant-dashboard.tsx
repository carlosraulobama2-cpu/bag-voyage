import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Simularemos pedidos que van entrando
const INITIAL_ORDERS = [
  { id: 'ORD-001', status: 'pending', items: '2x Pizza Margarita, 1x Pan de Ajo', total: 12000, time: 'Hace 2 min' },
  { id: 'ORD-002', status: 'cooking', items: '1x Pizza Pepperoni', total: 6500, time: 'Hace 10 min' },
];

export default function RestaurantDashboardScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [todayEarnings, setTodayEarnings] = useState(45000); // 45.000 FCFA ganados hoy
  
  const COMMISSION_RATE = 0.15; // 15% Bag-Vayage fee

  useEffect(() => {
    // Simular que entra un nuevo pedido después de 5 segundos
    const timer = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); // "Ding Ding!"
      setOrders(prev => [
        { id: `ORD-00${prev.length + 1}`, status: 'pending', items: '3x Pizza Queso', total: 15000, time: 'Justo ahora' },
        ...prev
      ]);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleAcceptOrder = (orderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cooking' } : o));
  };

  const handleOrderReady = (order: typeof INITIAL_ORDERS[0]) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('¡Comida Lista!', 'Se ha notificado a un conductor (Courier) para que venga a recoger el pedido.', [
      { 
        text: 'Genial', 
        onPress: () => {
          // Eliminar de activos y sumar ganancias
          setOrders(prev => prev.filter(o => o.id !== order.id));
          const netEarnings = order.total * (1 - COMMISSION_RATE);
          setTodayEarnings(prev => prev + netEarnings);
        }
      }
    ]);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const cookingOrders = orders.filter(o => o.status === 'cooking');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pizza Roma (Portal)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Tus Ganancias (Hoy)</Text>
          <Text style={styles.earningsAmount}>{todayEarnings.toLocaleString()} FCFA</Text>
          <Text style={styles.earningsSub}>*Ya se ha descontado el 15% de comisión.</Text>
        </View>

        {/* Nuevos Pedidos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nuevos Pedidos</Text>
          {pendingOrders.length > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{pendingOrders.length}</Text></View>
          )}
        </View>

        {pendingOrders.length === 0 ? (
          <Text style={styles.emptyText}>No hay pedidos nuevos por ahora.</Text>
        ) : (
          pendingOrders.map(order => (
            <View key={order.id} style={styles.orderCardPending}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.orderTime}>{order.time}</Text>
              </View>
              <Text style={styles.orderItems}>{order.items}</Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>{order.total} FCFA</Text>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptOrder(order.id)}>
                  <Text style={styles.acceptBtnText}>Cocinar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={styles.divider} />

        {/* En Cocina */}
        <Text style={styles.sectionTitle}>En Cocina (Preparando)</Text>

        {cookingOrders.length === 0 ? (
          <Text style={styles.emptyText}>La cocina está vacía.</Text>
        ) : (
          cookingOrders.map(order => (
            <View key={order.id} style={styles.orderCardCooking}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{order.id}</Text>
              </View>
              <Text style={styles.orderItems}>{order.items}</Text>
              <TouchableOpacity style={styles.readyBtn} onPress={() => handleOrderReady(order)}>
                <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={20} tintColor="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.readyBtnText}>¡Comida Lista para Enviar!</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#2D3748' },
  backButton: { padding: 10, backgroundColor: '#4A5568', borderRadius: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 15 },
  
  content: { padding: 20 },
  
  earningsCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginBottom: 30, alignItems: 'center', borderLeftWidth: 5, borderLeftColor: '#1E7C67' },
  earningsLabel: { fontSize: 16, color: '#718096', marginBottom: 5 },
  earningsAmount: { fontSize: 32, fontWeight: 'bold', color: '#2D3748' },
  earningsSub: { fontSize: 12, color: '#A0AEC0', marginTop: 10 },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3748' },
  badge: { backgroundColor: '#E53E3E', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12, marginLeft: 10 },
  badgeText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  
  emptyText: { color: '#A0AEC0', fontStyle: 'italic', marginBottom: 20 },
  
  orderCardPending: { backgroundColor: '#FFF5F5', borderRadius: 15, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#FED7D7' },
  orderCardCooking: { backgroundColor: '#E6FFFA', borderRadius: 15, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#B2F5EA' },
  
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#2D3748' },
  orderTime: { fontSize: 14, color: '#E53E3E', fontWeight: '500' },
  
  orderItems: { fontSize: 16, color: '#4A5568', marginBottom: 20, lineHeight: 24 },
  
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
  
  acceptBtn: { backgroundColor: '#E53E3E', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 10 },
  acceptBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  
  readyBtn: { flexDirection: 'row', backgroundColor: '#1E7C67', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, borderRadius: 10 },
  readyBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 }
});
