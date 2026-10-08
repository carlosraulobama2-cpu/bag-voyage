import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { api, ApiError, type Pedido, type Restaurante } from '../src/services/api';

const COMMISSION_RATE = 0.15; // 15% comisión de Bag Voyage
const POLL_MS = 8000;

export default function RestaurantDashboardScreen() {
  const router = useRouter();
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPedidos = useCallback(async (restauranteId: string) => {
    try {
      const { data } = await api.restaurantes.pedidos(restauranteId);
      setPedidos(data);
    } catch {
      // un fallo puntual de polling no debería tirar abajo el panel entero
    }
  }, []);

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval> | undefined;

    api.restaurantes
      .mine()
      .then(async ({ restaurante: mio }) => {
        setRestaurante(mio);
        if (mio && mio.estado === 'APROBADO') {
          await cargarPedidos(mio.id);
          intervalo = setInterval(() => cargarPedidos(mio.id), POLL_MS);
        }
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'No se pudo cargar tu comercio'))
      .finally(() => setCargando(false));

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [cargarPedidos]);

  const handleAcceptOrder = async (pedido: Pedido) => {
    if (!restaurante) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPedidos((prev) => prev.map((p) => (p.id === pedido.id ? { ...p, estado: 'COCINANDO' } : p)));
    try {
      await api.restaurantes.actualizarPedido(restaurante.id, pedido.id, 'COCINANDO');
    } catch (e) {
      cargarPedidos(restaurante.id); // revertir a lo que diga el servidor si falló
    }
  };

  const handleOrderReady = (pedido: Pedido) => {
    if (!restaurante) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('¡Comida Lista!', 'Se ha notificado a un conductor (Courier) para que venga a recoger el pedido.', [
      {
        text: 'Genial',
        onPress: async () => {
          setPedidos((prev) => prev.map((p) => (p.id === pedido.id ? { ...p, estado: 'LISTO' } : p)));
          try {
            await api.restaurantes.actualizarPedido(restaurante.id, pedido.id, 'LISTO');
          } catch {
            cargarPedidos(restaurante.id);
          }
        },
      },
    ]);
  };

  const pendingOrders = pedidos.filter((p) => p.estado === 'PENDIENTE');
  const cookingOrders = pedidos.filter((p) => p.estado === 'COCINANDO');
  const todayEarnings = pedidos
    .filter((p) => p.estado === 'ENTREGADO' && isToday(p.created_at))
    .reduce((sum, p) => sum + Number(p.total) * (1 - COMMISSION_RATE), 0);

  if (cargando) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#1E7C67" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>{error}</Text>
        <TouchableOpacity style={styles.readyBtn} onPress={() => router.back()}>
          <Text style={styles.readyBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!restaurante) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.headerTitleDark}>Todavía no registraste un comercio</Text>
        <Text style={styles.emptyText}>Registrá tu restaurante o tienda para empezar a recibir pedidos.</Text>
        <TouchableOpacity style={styles.readyBtn} onPress={() => router.push('/restaurant-registration')}>
          <Text style={styles.readyBtnText}>Registrar mi comercio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (restaurante.estado !== 'APROBADO') {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.successEmoji}>⏳</Text>
        <Text style={styles.headerTitleDark}>{restaurante.nombre} está en revisión</Text>
        <Text style={styles.emptyText}>Te avisaremos apenas esté aprobado y visible para los clientes.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurante.nombre} (Portal)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Tus Ganancias (Hoy)</Text>
          <Text style={styles.earningsAmount}>{todayEarnings.toLocaleString()} FCFA</Text>
          <Text style={styles.earningsSub}>*Ya se ha descontado el 15% de comisión.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nuevos Pedidos</Text>
          {pendingOrders.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingOrders.length}</Text>
            </View>
          )}
        </View>

        {pendingOrders.length === 0 ? (
          <Text style={styles.emptyText}>No hay pedidos nuevos por ahora.</Text>
        ) : (
          pendingOrders.map((order) => (
            <View key={order.id} style={styles.orderCardPending}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                <Text style={styles.orderTime}>{new Date(order.created_at).toLocaleTimeString()}</Text>
              </View>
              <Text style={styles.orderItems}>{order.items.map((i) => `${i.cantidad}x ${i.nombre}`).join(', ')}</Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>{Number(order.total).toLocaleString()} FCFA</Text>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptOrder(order)}>
                  <Text style={styles.acceptBtnText}>Cocinar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>En Cocina (Preparando)</Text>

        {cookingOrders.length === 0 ? (
          <Text style={styles.emptyText}>La cocina está vacía.</Text>
        ) : (
          cookingOrders.map((order) => (
            <View key={order.id} style={styles.orderCardCooking}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
              </View>
              <Text style={styles.orderItems}>{order.items.map((i) => `${i.cantidad}x ${i.nombre}`).join(', ')}</Text>
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

function isToday(isoDate: string): boolean {
  const d = new Date(isoDate);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 30 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#2D3748' },
  backButton: { padding: 10, backgroundColor: '#4A5568', borderRadius: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 15 },
  headerTitleDark: { fontSize: 20, fontWeight: 'bold', color: '#2D3748', marginBottom: 10, textAlign: 'center' },

  content: { padding: 20 },

  earningsCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginBottom: 30, alignItems: 'center', borderLeftWidth: 5, borderLeftColor: '#1E7C67' },
  earningsLabel: { fontSize: 16, color: '#718096', marginBottom: 5 },
  earningsAmount: { fontSize: 32, fontWeight: 'bold', color: '#2D3748' },
  earningsSub: { fontSize: 12, color: '#A0AEC0', marginTop: 10 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3748' },
  badge: { backgroundColor: '#E53E3E', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12, marginLeft: 10 },
  badgeText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },

  emptyText: { color: '#A0AEC0', fontStyle: 'italic', marginBottom: 20, textAlign: 'center' },

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

  readyBtn: { flexDirection: 'row', backgroundColor: '#1E7C67', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 10, marginTop: 15 },
  readyBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },

  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },
  successEmoji: { fontSize: 60, marginBottom: 20 },
});
