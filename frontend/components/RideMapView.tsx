import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, type MapStyleElement } from 'react-native-maps';

export interface RideMapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface RideMapMarker {
  id: string;
  lat: number;
  lng: number;
  /** Por defecto 🚕. */
  emoji?: string;
  /** El marcador "soy yo"/conductor en movimiento se ancla al centro (como antes en active-trip). */
  anchorCenter?: boolean;
  /** Grados de rotación del ícono — active-trip lo inclinaba 45° para sugerir dirección de marcha. */
  rotateDeg?: number;
}

export interface RideMapViewProps {
  style?: any;
  /** Centra el mapa una vez; no lo sigue recentrando si cambia. */
  initialRegion?: RideMapRegion;
  /** Controlado: el mapa se recentra cada vez que cambia (viaje en curso siguiendo al conductor). */
  region?: RideMapRegion;
  customMapStyle?: MapStyleElement[];
  showsUserLocation?: boolean;
  markers?: RideMapMarker[];
}

/**
 * Versión nativa (iOS/Android), la real: `react-native-maps` no tiene build
 * para web (ver `RideMapView.web.tsx`), así que este archivo nunca se
 * incluye en el bundle web — Metro resuelve el otro automáticamente por la
 * extensión `.web.tsx`. La usan ride-map.tsx, active-trip.tsx y
 * driver-home.tsx: antes cada uno importaba `react-native-maps` directo, y
 * como Expo Router recorre todas las rutas para armar el mapa de
 * navegación, UNA sola pantalla sin este envoltorio bastaba para tirar
 * abajo el bundle web entero (`codegenNativeComponent is not a function`),
 * no sólo esa pantalla.
 */
export function RideMapView({
  style,
  initialRegion,
  region,
  customMapStyle,
  showsUserLocation = true,
  markers = [],
}: RideMapViewProps) {
  return (
    <MapView
      style={style}
      provider={PROVIDER_DEFAULT}
      initialRegion={initialRegion}
      region={region}
      customMapStyle={customMapStyle}
      showsUserLocation={showsUserLocation}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{ latitude: marker.lat, longitude: marker.lng }}
          anchor={marker.anchorCenter ? { x: 0.5, y: 0.5 } : undefined}
        >
          <View style={[styles.carMarker, marker.rotateDeg != null && { transform: [{ rotate: `${marker.rotateDeg}deg` }] }]}>
            <Text style={{ fontSize: marker.anchorCenter ? 24 : 20 }}>{marker.emoji ?? '🚕'}</Text>
          </View>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  carMarker: {
    backgroundColor: '#FFFFFF',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D69E2E',
  },
});
