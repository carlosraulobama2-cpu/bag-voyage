import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { SymbolView } from 'expo-symbols';

const { width } = Dimensions.get('window');

export default function IndexScreen() {
  const [role, setRole] = useState<'user' | 'driver'>('user');

  if (role === 'driver') {
    return (
      <View style={styles.driverContainer}>
        <View style={styles.driverHeader}>
          <Text style={styles.driverTitle}>Modo Conductor</Text>
          <TouchableOpacity onPress={() => setRole('user')} style={styles.switchRoleBtn}>
            <Text style={styles.switchRoleText}>Volver a Usuario</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.emojiGiant}>🗺️</Text>
          <Text style={styles.mapText}>Mapa del Conductor Centrado en Ti</Text>
        </View>
        <View style={styles.goOnlineContainer}>
          <TouchableOpacity 
            style={styles.goOnlineBtn}
            onPress={() => require('expo-router').router.push('/driver-home')}
          >
            <Text style={styles.goOnlineText}>CONECTARSE (GO ONLINE)</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Buenos días, Carlos 👋</Text>
          <Text style={styles.locationText}>📍 Malabo, Guinea Ecuatorial</Text>
        </View>
        <TouchableOpacity onPress={() => setRole('driver')} style={styles.switchRoleBtn}>
          <Text style={styles.switchRoleText}>Modo Conductor</Text>
        </TouchableOpacity>
      </View>

      {/* Main Services Grid */}
      <View style={styles.servicesGrid}>
        {/* Viaje (Ride) */}
        <TouchableOpacity 
          style={styles.bigServiceCard}
          onPress={() => require('expo-router').router.push('/ride-map')}
        >
          <View style={styles.serviceImageContainer}>
            <Text style={styles.serviceEmoji}>🚗</Text>
          </View>
          <Text style={styles.serviceTitle}>Viaje</Text>
        </TouchableOpacity>

        <View style={styles.rightColumnServices}>
          {/* Comida (Food) */}
          <TouchableOpacity 
            style={styles.smallServiceCard}
            onPress={() => require('expo-router').router.push('/food-delivery')}
          >
            <Text style={styles.serviceEmojiSmall}>🍔</Text>
            <Text style={styles.serviceTitle}>Comida</Text>
          </TouchableOpacity>
          
          {/* Paquetes (Courier) */}
          <TouchableOpacity 
            style={styles.smallServiceCard}
            onPress={() => require('expo-router').router.push('/courier')}
          >
            <Text style={styles.serviceEmojiSmall}>📦</Text>
            <Text style={styles.serviceTitle}>Envíos</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Promos / Offers */}
      <View style={styles.promoBanner}>
        <View style={styles.promoTextContainer}>
          <Text style={styles.promoTitle}>Envía tu primer paquete gratis</Text>
          <Text style={styles.promoDesc}>Usa el código BGVY2026</Text>
        </View>
        <Text style={styles.promoEmoji}>🎁</Text>
      </View>

      {/* Destinos Recientes (Recent Destinations) */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>¿A dónde vas?</Text>
        
        <TouchableOpacity style={styles.searchBar}>
          <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={20} tintColor="#A0AEC0" />
          <Text style={styles.searchPlaceholder}>Ingresa un destino...</Text>
        </TouchableOpacity>

        <View style={styles.recentItem}>
          <View style={styles.recentIcon}>
            <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={20} tintColor="#4A5568" />
          </View>
          <View style={styles.recentTextContainer}>
            <Text style={styles.recentTitle}>Aeropuerto Internacional de Malabo</Text>
            <Text style={styles.recentSubtitle}>Guinea Ecuatorial</Text>
          </View>
        </View>

        <View style={styles.recentItem}>
          <View style={styles.recentIcon}>
            <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={20} tintColor="#4A5568" />
          </View>
          <View style={styles.recentTextContainer}>
            <Text style={styles.recentTitle}>Centro Comercial</Text>
            <Text style={styles.recentSubtitle}>Bata, Litoral</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  locationText: {
    fontSize: 14,
    color: '#718096',
    marginTop: 5,
  },
  switchRoleBtn: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  switchRoleText: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 10,
  },
  bigServiceCard: {
    flex: 1,
    backgroundColor: '#EDF2F7',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 180,
  },
  rightColumnServices: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 10,
  },
  smallServiceCard: {
    flex: 1,
    backgroundColor: '#EDF2F7',
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
  },
  serviceImageContainer: {
    alignItems: 'flex-end',
  },
  serviceEmoji: {
    fontSize: 60,
  },
  serviceEmojiSmall: {
    fontSize: 40,
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  promoBanner: {
    margin: 20,
    backgroundColor: '#1E7C67',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  promoDesc: {
    color: '#E6FFFA',
    fontSize: 14,
  },
  promoEmoji: {
    fontSize: 40,
  },
  recentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 16,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  recentTextContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: 15,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  recentSubtitle: {
    fontSize: 14,
    color: '#718096',
  },

  // Driver View Styles
  driverContainer: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  driverTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B3B60',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiGiant: {
    fontSize: 80,
  },
  mapText: {
    fontSize: 18,
    color: '#4A5568',
    marginTop: 10,
    fontWeight: 'bold',
  },
  goOnlineContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    paddingBottom: 40,
  },
  goOnlineBtn: {
    backgroundColor: '#38A169',
    padding: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  goOnlineText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
