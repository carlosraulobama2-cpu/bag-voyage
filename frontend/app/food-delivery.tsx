import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

const mockRestaurants = [
  { id: '1', name: 'Pizza Roma', category: 'Italiana • Pizzas', rating: '4.8', time: '20-30 min', fee: '500 FCFA', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80' },
  { id: '2', name: 'Burger King Malabo', category: 'Hamburguesas • Fast Food', rating: '4.5', time: '15-25 min', fee: 'Gratis', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80' },
  { id: '3', name: 'Rincón Local', category: 'Comida Africana • Tradicional', rating: '4.9', time: '30-45 min', fee: '1000 FCFA', image: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=300&q=80' },
];

const mockCategories = [
  { id: '1', name: 'Ofertas', emoji: '🔥' },
  { id: '2', name: 'Pizzas', emoji: '🍕' },
  { id: '3', name: 'Sana', emoji: '🥗' },
  { id: '4', name: 'Postres', emoji: '🍰' },
];

export default function FoodDeliveryScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor="#2D3748" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>Entregando en</Text>
          <Text style={styles.headerTitle}>Tu Ubicación Actual ▼</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={20} tintColor="#A0AEC0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Restaurantes, platos o tipos de comida"
            placeholderTextColor="#A0AEC0"
          />
        </View>

        {/* Categories (Horizontal) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {mockCategories.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoTitle}>20% Dto. en Cenas</Text>
          <Text style={styles.promoDesc}>Pide antes de las 20:00 y usa el código NIGHT20.</Text>
        </View>

        {/* Restaurants List */}
        <Text style={styles.sectionTitle}>Cerca de ti</Text>
        
        {mockRestaurants.map(rest => (
          <TouchableOpacity 
            key={rest.id} 
            style={styles.restaurantCard}
            onPress={() => require('expo-router').router.push('/restaurant-menu')}
          >
            <Image source={{ uri: rest.image }} style={styles.restaurantImage} />
            
            <View style={styles.restaurantInfo}>
              <View style={styles.restaurantHeaderRow}>
                <Text style={styles.restaurantName}>{rest.name}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{rest.rating}</Text>
                  <SymbolView name={{ ios: 'star.fill', android: 'star', web: 'star' }} size={12} tintColor="#2D3748" />
                </View>
              </View>
              
              <Text style={styles.restaurantCategory}>{rest.category}</Text>
              
              <View style={styles.restaurantDetailsRow}>
                <View style={styles.detailPill}>
                  <Text style={styles.detailText}>{rest.time}</Text>
                </View>
                <View style={[styles.detailPill, { backgroundColor: rest.fee === 'Gratis' ? '#E6FFFA' : '#EDF2F7' }]}>
                  <Text style={[styles.detailText, { color: rest.fee === 'Gratis' ? '#1E7C67' : '#4A5568' }]}>
                    Envío: {rest.fee}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  backButton: { padding: 10, backgroundColor: '#EDF2F7', borderRadius: 20, marginRight: 15 },
  headerTitleContainer: { flex: 1 },
  headerSubtitle: { fontSize: 12, color: '#718096', fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748' },
  scrollContent: { paddingBottom: 40 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF2F7', margin: 20, paddingHorizontal: 15, borderRadius: 12 },
  searchInput: { flex: 1, paddingVertical: 15, marginLeft: 10, fontSize: 16, color: '#2D3748' },
  
  categoriesScroll: { paddingHorizontal: 20, marginBottom: 20 },
  categoryCard: { alignItems: 'center', backgroundColor: '#F7FAFC', padding: 15, borderRadius: 15, marginRight: 15, minWidth: 80 },
  categoryEmoji: { fontSize: 30, marginBottom: 5 },
  categoryName: { fontSize: 14, fontWeight: '600', color: '#4A5568' },
  
  promoBanner: { backgroundColor: '#2D3748', marginHorizontal: 20, marginBottom: 25, borderRadius: 15, padding: 20 },
  promoTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  promoDesc: { color: '#A0AEC0', fontSize: 14 },
  
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3748', marginHorizontal: 20, marginBottom: 15 },
  
  restaurantCard: { marginHorizontal: 20, marginBottom: 25 },
  restaurantImage: { width: '100%', height: 180, borderRadius: 15, marginBottom: 10, backgroundColor: '#EDF2F7' },
  restaurantInfo: {},
  restaurantHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  restaurantName: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  ratingText: { fontSize: 12, fontWeight: 'bold', marginRight: 4, color: '#2D3748' },
  restaurantCategory: { fontSize: 14, color: '#718096', marginBottom: 10 },
  restaurantDetailsRow: { flexDirection: 'row', gap: 10 },
  detailPill: { backgroundColor: '#EDF2F7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  detailText: { fontSize: 12, fontWeight: '600', color: '#4A5568' }
});
