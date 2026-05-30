import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { scheduleInactivityNotification, cancelInactivityNotification } from '../utils/smartNotifications';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { registerForPushNotificationsAsync } from '../utils/pushNotifications';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      
      // Pedir permisos de notificaciones al abrir la app
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          console.log('Token listo para enviar al backend:', token);
        }
      });
    }

    // Listener para el estado de la aplicación (Fondo vs Primer plano)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // El usuario ha cerrado o minimizado la app
        scheduleInactivityNotification();
      } else if (nextAppState === 'active') {
        // El usuario ha vuelto a la app
        cancelInactivityNotification();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
