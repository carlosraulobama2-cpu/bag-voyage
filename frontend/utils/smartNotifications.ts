import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ID identifiers to cancel them if needed
let inactivityNotificationId: string | null = null;
let cartNotificationId: string | null = null;
let ratingNotificationId: string | null = null;

// 1. Marketing / Inactividad (Ej: 10 segundos después de cerrar para probar)
export const scheduleInactivityNotification = async () => {
  // Cancel previous if any
  if (inactivityNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(inactivityNotificationId);
  }

  inactivityNotificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎁 ¡Te echamos de menos!",
      body: "Tienes 500 FCFA de descuento esperándote para tu próximo viaje en Malabo.",
      sound: true,
    },
    trigger: {
      seconds: 15, // Test mode: 15 seconds. In prod, this would be 3 days (3 * 24 * 60 * 60)
    },
  });
  console.log('Notificación de Inactividad programada:', inactivityNotificationId);
};

export const cancelInactivityNotification = async () => {
  if (inactivityNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(inactivityNotificationId);
    inactivityNotificationId = null;
    console.log('Notificación de Inactividad cancelada (Usuario volvió)');
  }
};

// 2. Carrito Abandonado
export const scheduleAbandonedCartNotification = async () => {
  if (cartNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(cartNotificationId);
  }

  cartNotificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🍕 Tu pedido te espera",
      body: "¡No dejes que se enfríe! Tienes comida en el carrito pendiente de pago.",
      sound: true,
    },
    trigger: {
      seconds: 10, // Test mode: 10 seconds. In prod: 15 mins (15 * 60)
    },
  });
  console.log('Notificación de Carrito Abandonado programada:', cartNotificationId);
};

export const cancelAbandonedCartNotification = async () => {
  if (cartNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(cartNotificationId);
    cartNotificationId = null;
    console.log('Notificación de Carrito cancelada (Usuario compró/vació carrito)');
  }
};

// 3. Recordatorio de Reseña
export const scheduleRatingReminder = async (driverName: string) => {
  if (ratingNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(ratingNotificationId);
  }

  ratingNotificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "⭐ ¡Tu viaje ha terminado!",
      body: `¿Qué tal fue tu viaje con ${driverName}? Cuéntanos tu experiencia.`,
      sound: true,
    },
    trigger: {
      seconds: 12, // Test mode: 12 seconds. In prod: 1 hour (3600)
    },
  });
  console.log('Notificación de Reseña programada:', ratingNotificationId);
};

export const cancelRatingReminder = async () => {
  if (ratingNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(ratingNotificationId);
    ratingNotificationId = null;
  }
};
