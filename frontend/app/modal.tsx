import { StatusBar } from 'expo-status-bar';
import { Image, Platform, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useAppStore } from '@/src/store/useAppStore';
import { router } from 'expo-router';

export default function ModalScreen() {
  const { user, isOfflineMode, setOfflineMode } = useAppStore();

  const handleVerify = () => {
    router.push('/verify');
  };

  return (
    <View style={styles.container}>
      {/* Información del Perfil */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/150?u=guest' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name || 'Usuario Invitado'}</Text>
        <Text style={styles.phone}>{user?.phone || '+240 222 000 000'}</Text>

        <View style={[styles.badge, user?.isVerified ? styles.badgeVerified : styles.badgePending]}>
          <Text style={styles.badgeText}>
            {user?.isVerified ? '✅ Identidad Verificada' : '⚠️ Verificación Pendiente'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Opciones */}
      <View style={styles.optionsContainer}>
        {!user?.isVerified && (
          <TouchableOpacity style={styles.optionButton} onPress={handleVerify}>
            <Text style={styles.optionIcon}>📷</Text>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Subir DIP o Pasaporte</Text>
              <Text style={styles.optionDescription}>Sube tu documento para generar confianza (bajo consumo de datos)</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionIcon}>⭐</Text>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Mis Reseñas</Text>
            <Text style={styles.optionDescription}>Mira lo que otros dicen de ti (4.8 / 5.0)</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionIcon}>💬</Text>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Mis Chats Activos</Text>
            <Text style={styles.optionDescription}>Negocia precios y puntos de entrega</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Modo Offline Activo</Text>
            <Text style={styles.optionDescription}>
              {isOfflineMode ? 'Activo temporalmente' : 'Actívalo si no tienes saldo para ver tus viajes y contactos guardados'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, isOfflineMode && styles.toggleActive]}
            onPress={() => setOfflineMode(!isOfflineMode)}
          >
            <View style={[styles.toggleCircle, isOfflineMode && styles.toggleCircleActive]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Uso de un light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F9FC',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  phone: {
    fontSize: 16,
    color: '#718096',
    marginTop: 4,
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeVerified: {
    backgroundColor: '#C6F6D5',
  },
  badgePending: {
    backgroundColor: '#FEEBC8',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 20,
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  optionDescription: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CBD5E0',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#48BB78',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  toggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
});
