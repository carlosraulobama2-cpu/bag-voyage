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
      {/* Todas las pantallas fuera de (tabs) ya traen su propio header
          (botón atrás, título, etc. dibujados a mano) — sin
          `headerShown: false` por pantalla, cada una mostraba ADEMÁS la
          barra nativa genérica con el nombre del archivo como título
          ("auth/login", "ride-map"…), duplicada y encima de la real. Pasa
          en cualquier plataforma, no sólo en la vista web. `modal` es la
          excepción: no tiene botón de cerrar propio, así que necesita el
          de la barra nativa. */}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="active-trip" options={{ headerShown: false }} />
        <Stack.Screen name="courier" options={{ headerShown: false }} />
        <Stack.Screen name="driver-home" options={{ headerShown: false }} />
        <Stack.Screen name="driver-profile" options={{ headerShown: false }} />
        <Stack.Screen name="driver-registration" options={{ headerShown: false }} />
        <Stack.Screen name="food-delivery" options={{ headerShown: false }} />
        <Stack.Screen name="legal/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="rating" options={{ headerShown: false }} />
        <Stack.Screen name="restaurant-registration" options={{ headerShown: false }} />
        <Stack.Screen name="referrals" options={{ headerShown: false }} />
        <Stack.Screen name="restaurant-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="restaurant-menu" options={{ headerShown: false }} />
        <Stack.Screen name="ride-map" options={{ headerShown: false }} />
        <Stack.Screen name="trip-chat" options={{ headerShown: false }} />
        <Stack.Screen name="trip-history" options={{ headerShown: false }} />
        <Stack.Screen name="verify" options={{ headerShown: false }} />
        <Stack.Screen name="wallet" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
