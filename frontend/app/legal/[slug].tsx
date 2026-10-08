import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { api, type LegalDocumento, type LegalResponse } from '../../src/services/api';

/**
 * Términos y Privacidad — antes no existía ninguna pantalla para esto: la
 * política de privacidad y los términos que la app ahora exige aceptar
 * (ver auth/login.tsx) no tenían dónde mostrarse completos, sólo el
 * resumen del checkbox.
 */
export default function LegalScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [legal, setLegal] = useState<LegalResponse | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.legal
      .get()
      .then(setLegal)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const documento: LegalDocumento | undefined = slug === 'privacidad' ? legal?.privacidad : legal?.terminos;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#1E7C67" size="large" />
        </View>
      ) : !documento ? (
        <View style={styles.centered}>
          <Text style={styles.subtitle}>No pudimos cargar este documento. Probá de nuevo más tarde.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{documento.titulo}</Text>
          <Text style={styles.subtitle}>{documento.resumen}</Text>
          <Text style={styles.version}>Versión {legal?.version}</Text>

          {documento.secciones.map((seccion) => (
            <View key={seccion.titulo} style={styles.seccion}>
              <Text style={styles.seccionTitulo}>{seccion.titulo}</Text>
              {seccion.parrafos.map((parrafo, i) => (
                <Text key={i} style={styles.parrafo}>
                  {parrafo}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { paddingTop: 50, paddingBottom: 10, paddingHorizontal: 20 },
  backButton: { alignSelf: 'flex-start' },
  backText: { color: '#0B3B60', fontSize: 16, fontWeight: 'bold' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0B3B60' },
  subtitle: { fontSize: 15, color: '#718096', marginTop: 8, lineHeight: 22 },
  version: { fontSize: 12, color: '#A0AEC0', marginTop: 10, marginBottom: 20 },
  seccion: { marginBottom: 22 },
  seccionTitulo: { fontSize: 17, fontWeight: 'bold', color: '#2D3748', marginBottom: 6 },
  parrafo: { fontSize: 15, color: '#4A5568', lineHeight: 22, marginBottom: 8 },
});
