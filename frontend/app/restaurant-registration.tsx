import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { api, ApiError } from '../src/services/api';

const CATEGORIAS = ['Comida Rápida', 'Pizzería', 'Saludable', 'Postres', 'Café', 'Asiática', 'Otros'];

export default function RestaurantRegistrationScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const pickImage = async (setter: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const enviarSolicitud = async () => {
    setEnviando(true);
    setError(null);
    try {
      let logoUrl: string | undefined;
      let coverUrl: string | undefined;
      if (logoImage) logoUrl = (await api.uploads.subirImagen(logoImage)).url;
      if (coverImage) coverUrl = (await api.uploads.subirImagen(coverImage)).url;

      await api.restaurantes.register({
        nombre,
        categoria,
        descripcion: descripcion || undefined,
        direccion,
        telefono: telefono || undefined,
        logoUrl,
        coverUrl,
      });
      setIsSubmitted(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo enviar la solicitud. Probá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    enviarSolicitud();
  };

  if (isSubmitted) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.successEmoji}>⏳</Text>
        <Text style={styles.title}>Comercio en Revisión</Text>
        <Text style={styles.subtitle}>
          Recibimos los datos de {nombre}. Nuestro equipo los revisará en un plazo de 24-48 horas.
          Te avisaremos cuando tu comercio esté visible y puedas empezar a recibir pedidos.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
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
          <Text style={styles.title}>Registra tu Comercio</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, step >= 1 && styles.progressActive]} />
            <View style={[styles.progressBar, step >= 2 && styles.progressActive]} />
            <View style={[styles.progressBar, step >= 3 && styles.progressActive]} />
          </View>
        </View>

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Datos del Comercio</Text>
            <Text style={styles.label}>Nombre del comercio</Text>
            <TextInput style={styles.input} placeholder="Ej: Pizzería Roma" value={nombre} onChangeText={setNombre} />

            <Text style={styles.label}>Categoría</Text>
            <View style={styles.chipsRow}>
              {CATEGORIAS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, categoria === cat && styles.chipActive]}
                  onPress={() => setCategoria(cat)}
                >
                  <Text style={[styles.chipText, categoria === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Dirección</Text>
            <TextInput style={styles.input} placeholder="Calle, número, ciudad" value={direccion} onChangeText={setDireccion} />

            <Text style={styles.label}>Teléfono de contacto (opcional)</Text>
            <TextInput style={styles.input} placeholder="Ej: +34 600 000 000" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Imágenes del Comercio</Text>
            <Text style={styles.subtitle}>Subí un logo y una foto de portada. Ayudan a que los clientes confíen en tu comercio.</Text>

            <Text style={styles.label}>Logo</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(setLogoImage)}>
              {logoImage ? (
                <Image source={{ uri: logoImage }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.emoji}>🏪</Text>
                  <Text style={styles.uploadText}>Toca para subir logo</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Foto de portada</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(setCoverImage)}>
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.emoji}>📷</Text>
                  <Text style={styles.uploadText}>Toca para subir portada</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Contanos sobre tu comercio</Text>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Especialidades, horario, lo que te hace diferente..."
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={4}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, enviando && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={
            enviando ||
            (step === 1 && (!nombre.trim() || !categoria || !direccion.trim())) ||
            (step === 2 && (!logoImage || !coverImage))
          }
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>{step === 3 ? 'Enviar Solicitud' : 'Siguiente'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  centerContent: { justifyContent: 'center', alignItems: 'center', padding: 30 },
  scrollContent: { padding: 20, paddingTop: 50, flexGrow: 1 },
  header: { marginBottom: 30 },
  backButton: { marginBottom: 10 },
  backText: { color: '#0B3B60', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2D3748', marginBottom: 15 },
  subtitle: { fontSize: 16, color: '#718096', marginBottom: 20, textAlign: 'center' },
  progressContainer: { flexDirection: 'row', gap: 10 },
  progressBar: { flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3 },
  progressActive: { backgroundColor: '#E53E3E' },
  stepContainer: { flex: 1 },
  stepTitle: { fontSize: 20, fontWeight: 'bold', color: '#0B3B60', marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 8, padding: 15, fontSize: 16, color: '#2D3748' },
  textArea: { height: 100, textAlignVertical: 'top' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E0', backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: '#E53E3E', borderColor: '#E53E3E' },
  chipText: { color: '#4A5568', fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#FFFFFF' },
  imagePicker: { marginTop: 8, height: 160, backgroundColor: '#EDF2F7', borderRadius: 12, borderWidth: 2, borderColor: '#CBD5E0', borderStyle: 'dashed', overflow: 'hidden' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 36, marginBottom: 8 },
  uploadText: { color: '#718096', fontWeight: '600' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  button: { backgroundColor: '#E53E3E', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  successEmoji: { fontSize: 60, marginBottom: 20 },
  errorText: { color: '#E53E3E', marginTop: 12, fontSize: 14, textAlign: 'center' },
});
