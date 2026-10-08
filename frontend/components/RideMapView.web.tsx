import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RideMapViewProps } from './RideMapView';

/**
 * `react-native-maps` no tiene build para web — su código nativo rompe el
 * bundle entero apenas Metro lo evalúa (`codegenNativeComponent is not a
 * function`), no sólo la pantalla que lo use. Esta variante `.web.tsx` hace
 * que Metro nunca llegue a importar el paquete real al compilar para web:
 * sólo se usa cuando el nombre coincide y la plataforma es web.
 *
 * Es un resumen de texto, no un mapa interactivo — más adelante podría
 * cambiarse por una librería de mapas con soporte web real (MapLibre GL,
 * Leaflet) si el mapa en el navegador llega a importar de verdad.
 */
export function RideMapView({ style, initialRegion, region, markers = [] }: RideMapViewProps) {
  const centro = region ?? initialRegion;

  return (
    // El `style` que pasan las pantallas trae un ancho/alto fijo en píxeles
    // (`Dimensions.get('window')` leído una sola vez al cargar el módulo,
    // pensado para una pantalla de teléfono) — en la vista web, sobre todo
    // en el primer render del servidor, ese valor no refleja el viewport
    // real y el cartel quedaba apretado en una columna angosta. Se ignoran
    // el ancho/alto que traiga y se usa flex para ocupar el espacio
    // disponible de verdad.
    <View style={[styles.container, style, styles.fillOverride]}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={styles.title}>El mapa no está disponible en la vista web</Text>
      <Text style={styles.subtitle}>Abrí la app en tu teléfono (iOS/Android) para ver el mapa en vivo.</Text>
      {centro && (
        <Text style={styles.meta}>
          {markers.length > 0 ? `${markers.length} punto${markers.length === 1 ? '' : 's'} cerca de ` : 'Centro: '}
          {centro.latitude.toFixed(3)}, {centro.longitude.toFixed(3)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
    padding: 24,
  },
  fillOverride: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    marginTop: 6,
  },
  meta: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 14,
  },
});
