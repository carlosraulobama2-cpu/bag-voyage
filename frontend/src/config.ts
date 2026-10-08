import { Platform } from 'react-native';

/**
 * Antes cada pantalla definía su propio `BACKEND_URL` repetido
 * (auth/login.tsx, ride-map.tsx, driver-home.tsx, publicar.tsx…), cada uno
 * con su propia versión del comentario "cambiá esto en un dispositivo
 * físico". Un solo lugar, y si el día de mañana esto se mueve a una URL
 * de producción real hay un solo sitio que tocar.
 */
export const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://127.0.0.1:3000/api';
export const SOCKET_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://127.0.0.1:3000';
