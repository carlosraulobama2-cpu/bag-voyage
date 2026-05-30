import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { cancelRatingReminder } from '../utils/smartNotifications';

const { width } = Dimensions.get('window');

export default function RatingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = params.type || 'trip'; // 'trip' o 'order'
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleStarPress = (starIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRating(starIndex);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Calificación', 'Por favor selecciona al menos una estrella antes de continuar.');
      return;
    }
    
    cancelRatingReminder();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('¡Gracias!', 'Tus comentarios nos ayudan a mejorar la experiencia en Bag-Vayage.', [
      { text: 'Ir al Inicio', onPress: () => router.replace('/(tabs)') }
    ]);
  };

  // Textos dinámicos dependiendo de si es un viaje o un pedido de comida
  const headerTitle = type === 'trip' ? 'Viaje Finalizado' : 'Pedido Entregado';
  const questionText = type === 'trip' 
    ? '¿Qué te ha parecido el conductor?' 
    : '¿Qué te ha parecido nuestro servicio?';
  const placeholderText = type === 'trip'
    ? '¿Alguna inconveniencia o detalle que destacar? Pon tu comentario aquí...'
    : 'Déjanos tu comentario sobre la comida y el servicio de entrega...';

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.replace('/(tabs)')}>
          <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={24} tintColor="#A0AEC0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
      </View>

      <View style={styles.content}>
        {/* Avatar / Icono Central */}
        <View style={styles.iconContainer}>
          {type === 'trip' ? (
            <View style={styles.avatarPlaceholder} />
          ) : (
            <Text style={{ fontSize: 60 }}>🍔</Text>
          )}
        </View>

        <Text style={styles.questionTitle}>{questionText}</Text>
        <Text style={styles.subtitle}>Califícanos con hasta 6 estrellas</Text>

        {/* 6 Estrellas de Calificación */}
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5, 6].map((star) => (
            <TouchableOpacity 
              key={star} 
              onPress={() => handleStarPress(star)}
              style={styles.starBtn}
            >
              <SymbolView 
                name={{ ios: rating >= star ? 'star.fill' : 'star', android: 'star', web: 'star' }} 
                size={40} 
                tintColor={rating >= star ? '#D69E2E' : '#E2E8F0'} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Caja de Comentarios */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={placeholderText}
            placeholderTextColor="#A0AEC0"
            multiline={true}
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Botón Enviar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Enviar Calificación</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 20, position: 'relative' },
  closeBtn: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
  
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 30 },
  
  iconContainer: { marginBottom: 20 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#CBD5E0', borderWidth: 4, borderColor: '#EDF2F7' },
  
  questionTitle: { fontSize: 24, fontWeight: 'bold', color: '#2D3748', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#718096', marginBottom: 40 },
  
  starsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginBottom: 40 },
  starBtn: { padding: 5 },
  
  inputContainer: { width: '100%', backgroundColor: '#F7FAFC', borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0', padding: 15 },
  textInput: { fontSize: 16, color: '#2D3748', minHeight: 100 },
  
  footer: { padding: 20, paddingBottom: 40 },
  submitBtn: { backgroundColor: '#1E7C67', paddingVertical: 18, borderRadius: 15, alignItems: 'center', shadowColor: '#1E7C67', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});
