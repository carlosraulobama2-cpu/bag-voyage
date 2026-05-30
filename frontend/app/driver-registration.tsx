import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

export default function DriverRegistrationScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [dniImage, setDniImage] = useState<string | null>(null);
  const [iban, setIban] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setDniImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.successEmoji}>⏳</Text>
        <Text style={styles.title}>Cuenta en Revisión</Text>
        <Text style={styles.subtitle}>
          Hemos recibido tus documentos. Nuestro equipo los revisará en un plazo de 24-48 horas.
          Te avisaremos cuando puedas empezar a recibir viajes.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver al Mapa</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Hazte Viajero</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, step >= 1 && styles.progressActive]} />
            <View style={[styles.progressBar, step >= 2 && styles.progressActive]} />
            <View style={[styles.progressBar, step >= 3 && styles.progressActive]} />
          </View>
        </View>

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Datos del Vehículo / Viaje</Text>
            <Text style={styles.label}>¿En qué vas a repartir?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Coche, Moto, Furgoneta, Avión..."
              value={vehicleType}
              onChangeText={setVehicleType}
            />
            <Text style={styles.label}>Matrícula (o Nº de Vuelo habitual)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 1234 ABC"
              value={licensePlate}
              onChangeText={setLicensePlate}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Verificación de Identidad (KYC)</Text>
            <Text style={styles.subtitle}>Sube una foto clara de tu DNI o Pasaporte por delante.</Text>
            
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {dniImage ? (
                <Image source={{ uri: dniImage }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.emoji}>📷</Text>
                  <Text style={styles.uploadText}>Toca para subir foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Datos Bancarios</Text>
            <Text style={styles.subtitle}>¿Dónde quieres recibir tus ganancias?</Text>
            <Text style={styles.label}>Número de Cuenta (IBAN)</Text>
            <TextInput
              style={styles.input}
              placeholder="ESXX XXXX XXXX XXXX XXXX"
              value={iban}
              onChangeText={setIban}
              keyboardType="default"
            />
          </View>
        )}

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleNext}
          disabled={
            (step === 1 && (!vehicleType || !licensePlate)) ||
            (step === 2 && !dniImage) ||
            (step === 3 && !iban)
          }
        >
          <Text style={styles.buttonText}>{step === 3 ? 'Enviar Solicitud' : 'Siguiente'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    flexGrow: 1,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#0B3B60',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  progressActive: {
    backgroundColor: '#1E7C67',
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B3B60',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#2D3748',
  },
  imagePicker: {
    marginTop: 20,
    height: 200,
    backgroundColor: '#EDF2F7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  uploadText: {
    color: '#718096',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  button: {
    backgroundColor: '#1E7C67',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
});
