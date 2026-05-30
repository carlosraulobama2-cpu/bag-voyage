import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuración de cómo se comportan las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E7C67',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permiso denegado para notificaciones push');
      return;
    }
    
    // Aquí se genera el Token. 
    // Para entornos reales con EAS Build es necesario pasar el projectId.
    // Para pruebas locales, esto funciona.
    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token generado:', token);
    } catch (e) {
      console.log('Error generando token push:', e);
    }
  } else {
    console.log('Las notificaciones push solo funcionan en dispositivos físicos, no en emuladores.');
  }

  return token;
}
