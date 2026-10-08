import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { scheduleAbandonedCartNotification, cancelAbandonedCartNotification } from '../utils/smartNotifications';

const { width } = Dimensions.get('window');

const RESTAURANT = {
  name: 'Pizza Roma',
  rating: '4.8 (200+)',
  time: '20-30 min',
  deliveryFee: '500 FCFA',
  coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'
};

const MENU_ITEMS = [
  { id: '1', name: 'Pizza Margarita', desc: 'Salsa de tomate, mozzarella fresca y albahaca.', price: 5000, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=200&q=80' },
  { id: '2', name: 'Pizza Pepperoni', desc: 'Mozzarella, pepperoni crujiente y orégano.', price: 6500, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=200&q=80' },
  { id: '3', name: 'Pan de Ajo', desc: 'Pan recién horneado con mantequilla de ajo y queso.', price: 2000, image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=200&q=80' },
];

export default function RestaurantMenuScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
    if (totalItems > 0) {
      scheduleAbandonedCartNotification();
    } else {
      cancelAbandonedCartNotification();
    }
  }, [cart]);

  const addItem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeItem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id] -= 1;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = MENU_ITEMS.reduce((sum, item) => sum + (item.price * (cart[item.id] || 0)), 0);

  const handleCheckout = () => {
    cancelAbandonedCartNotification();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      '¡Pedido Confirmado!',
      `Tu pedido está en preparación.\n\nTotal pagado: ${total} FCFA\nDescontado de tu Wallet.`,
      [
        { text: 'Aceptar', onPress: () => router.replace({ pathname: '/rating', params: { type: 'order' } }) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: totalItems > 0 ? 100 : 40 }}>
        
        {/* Portada */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: RESTAURANT.coverImage }} style={styles.coverImage} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor="#2D3748" />
          </TouchableOpacity>
        </View>

        {/* Info del Restaurante */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{RESTAURANT.name}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>⭐ {RESTAURANT.rating}</Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.statText}>🕒 {RESTAURANT.time}</Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.statText}>🛵 Envío: {RESTAURANT.deliveryFee}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Lista de Platos */}
        <Text style={styles.sectionTitle}>Menú Principal</Text>

        {MENU_ITEMS.map(item => {
          const qty = cart[item.id] || 0;
          return (
            <View key={item.id} style={styles.menuItem}>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemPrice}>{item.price} FCFA</Text>
                <Text style={styles.menuItemDesc} numberOfLines={2}>{item.desc}</Text>
              </View>
              
              <View style={styles.menuItemRight}>
                <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                
                {qty === 0 ? (
                  <TouchableOpacity style={styles.addButton} onPress={() => addItem(item.id)}>
                    <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={16} tintColor="#1E7C67" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.qtyControls}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(item.id)}>
                      <SymbolView name={{ ios: 'minus', android: 'remove', web: 'remove' }} size={16} tintColor="#2D3748" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => addItem(item.id)}>
                      <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={16} tintColor="#2D3748" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        })}

      </ScrollView>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
            <Text style={styles.checkoutText}>Ver Carrito</Text>
            <Text style={styles.checkoutPrice}>{total} FCFA</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  coverContainer: { position: 'relative', width: '100%', height: 220 },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: '#FFFFFF', padding: 10, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  
  restaurantInfo: { padding: 20 },
  restaurantName: { fontSize: 28, fontWeight: 'bold', color: '#2D3748', marginBottom: 10 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statText: { fontSize: 14, color: '#4A5568', fontWeight: '500' },
  statDot: { marginHorizontal: 8, color: '#A0AEC0' },
  
  divider: { height: 8, backgroundColor: '#F7FAFC' },
  
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#2D3748', margin: 20, marginBottom: 10 },
  
  menuItem: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  menuItemTextContainer: { flex: 1, paddingRight: 15 },
  menuItemName: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginBottom: 5 },
  menuItemPrice: { fontSize: 16, color: '#4A5568', marginBottom: 8, fontWeight: '500' },
  menuItemDesc: { fontSize: 14, color: '#718096', lineHeight: 20 },
  
  menuItemRight: { alignItems: 'center' },
  menuItemImage: { width: 100, height: 100, borderRadius: 12, marginBottom: -15, zIndex: -1 },
  addButton: { backgroundColor: '#E6FFFA', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2, paddingHorizontal: 5, paddingVertical: 5 },
  qtyBtn: { padding: 5 },
  qtyText: { marginHorizontal: 15, fontSize: 16, fontWeight: 'bold', color: '#2D3748' },

  floatingCartContainer: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  checkoutBtn: { backgroundColor: '#1E7C67', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 12, shadowColor: '#1E7C67', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  cartBadge: { backgroundColor: '#0B3B60', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#FFFFFF', fontWeight: 'bold' },
  checkoutText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  checkoutPrice: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});
