import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

const DRIVER = {
  name: 'Carlos Díaz',
  rating: '4.8',
  trips: 1250,
  joined: 'Hace 2 años',
  car: 'Toyota Prius (Blanco)',
  plate: '1234 ABC',
  languages: 'Español, Francés',
  bio: 'Hola! Soy conductor profesional desde hace 5 años. Me gusta la música tranquila y mantener el coche siempre impecable.',
  reviews: [
    { id: '1', author: 'Ana', rating: '5', text: 'Conductor muy amable y coche limpísimo. Llegamos a tiempo.', date: 'Ayer' },
    { id: '2', author: 'Luis', rating: '5', text: 'Me ayudó con las maletas, excelente servicio.', date: 'Hace 3 días' },
    { id: '3', author: 'María', rating: '4', text: 'Todo correcto, conducción suave.', date: 'Hace 1 semana' }
  ]
};

export default function DriverProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header con foto de portada y botón volver */}
      <View style={styles.header}>
        <View style={styles.coverImage} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor="#FFFFFF" />
        </TouchableOpacity>
        
        {/* Avatar del Conductor */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder} />
          <View style={styles.vipBadge}>
            <SymbolView name={{ ios: 'star.fill', android: 'star', web: 'star' }} size={14} tintColor="#FFFFFF" />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        
        {/* Información Principal */}
        <View style={styles.mainInfo}>
          <Text style={styles.driverName}>{DRIVER.name}</Text>
          <Text style={styles.carText}>{DRIVER.car} • {DRIVER.plate}</Text>
        </View>

        {/* Stats del Conductor */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>⭐ {DRIVER.rating}</Text>
            <Text style={styles.statLabel}>Valoración</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{DRIVER.trips}</Text>
            <Text style={styles.statLabel}>Viajes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{DRIVER.joined}</Text>
            <Text style={styles.statLabel}>Experiencia</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Sobre el Conductor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre Carlos</Text>
          <Text style={styles.bioText}>{DRIVER.bio}</Text>
          <View style={styles.infoRow}>
            <SymbolView name={{ ios: 'globe', android: 'language', web: 'language' }} size={20} tintColor="#718096" />
            <Text style={styles.infoText}>Habla: {DRIVER.languages}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Reseñas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas Reseñas</Text>
          
          {DRIVER.reviews.map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAuthorRow}>
                  <View style={styles.reviewerAvatar} />
                  <Text style={styles.reviewerName}>{review.author}</Text>
                </View>
                <View style={styles.reviewRatingRow}>
                  <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { height: 180, backgroundColor: '#2D3748', position: 'relative' },
  coverImage: { flex: 1, opacity: 0.8 },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 10 },
  avatarContainer: { position: 'absolute', bottom: -50, alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EDF2F7', borderWidth: 4, borderColor: '#FFFFFF' },
  vipBadge: { position: 'absolute', bottom: 5, right: 0, backgroundColor: '#D69E2E', padding: 5, borderRadius: 15, borderWidth: 2, borderColor: '#FFFFFF' },
  
  scrollArea: { flex: 1, paddingTop: 60 },
  mainInfo: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  driverName: { fontSize: 28, fontWeight: 'bold', color: '#2D3748' },
  carText: { fontSize: 16, color: '#718096', marginTop: 5 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 20, marginBottom: 20 },
  statBox: { alignItems: 'center', paddingHorizontal: 15 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
  statLabel: { fontSize: 12, color: '#718096', marginTop: 5 },
  statDivider: { width: 1, backgroundColor: '#EDF2F7', height: '80%', alignSelf: 'center' },
  
  divider: { height: 8, backgroundColor: '#F7FAFC' },
  
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3748', marginBottom: 15 },
  bioText: { fontSize: 16, color: '#4A5568', lineHeight: 24, marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { marginLeft: 10, fontSize: 14, color: '#718096' },
  
  reviewCard: { backgroundColor: '#F7FAFC', padding: 15, borderRadius: 12, marginBottom: 15 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reviewAuthorRow: { flexDirection: 'row', alignItems: 'center' },
  reviewerAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#CBD5E0', marginRight: 10 },
  reviewerName: { fontSize: 16, fontWeight: 'bold', color: '#2D3748' },
  reviewRatingRow: { backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  reviewRating: { fontSize: 12, fontWeight: 'bold' },
  reviewText: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
  reviewDate: { fontSize: 12, color: '#A0AEC0', marginTop: 10, textAlign: 'right' }
});
