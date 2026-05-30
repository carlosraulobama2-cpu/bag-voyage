import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';

// Definir la tarea en segundo plano que se ejecuta incluso con la app cerrada
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Error en tarea de background de ubicación', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const latestLocation = locations[0];
    
    console.log('📍 [Background] Ubicación del conductor actualizada:', latestLocation.coords);

    // TODO: Hacer un POST (fetch) silencioso a la base de datos para guardar estas coordenadas
    // Esto asegura que el backend siempre sepa dónde está el taxista para emparejarlo con clientes
  }
});

export const startBackgroundLocationTracking = async () => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.log('Permiso Foreground denegado');
      return;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.log('Permiso Background denegado. El rastreo no funcionará con la app cerrada.');
      return;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 30000, // Actualizar cada 30 segundos en background
      distanceInterval: 100, // o cada 100 metros recorridos
      showsBackgroundLocationIndicator: true, // Requerido en iOS/Android para mostrar que se está usando el GPS
      foregroundService: {
        notificationTitle: 'Conductor Activo',
        notificationBody: 'Bag-Vayage está buscando viajes cercanos para ti.',
        notificationColor: '#1E7C67',
      },
    });
    console.log('✅ Rastreo en Background iniciado correctamente.');
  } catch (error) {
    console.error('Error iniciando rastreo background:', error);
  }
};

export const stopBackgroundLocationTracking = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log('🛑 Rastreo en Background detenido.');
  }
};
