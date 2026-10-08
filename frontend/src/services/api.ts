/**
 * Bag Voyage — Cliente HTTP
 *
 * Antes cada pantalla hacía su propio `fetch(BACKEND_URL + ruta)`, con su
 * propio manejo (o falta de manejo) de errores, y pasando el token a mano
 * donde se acordaban de hacerlo. Un solo cliente: adjunta el token
 * guardado, entiende el formato de error del backend
 * (`{success:false, message, field?}` — ver middleware/validate.js del
 * backend) y lo traduce a algo que cualquier pantalla puede mostrar
 * directo con `error.message`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const TOKEN_KEY = 'userToken';

export class ApiError extends Error {
  readonly status: number;
  readonly field?: string;

  constructor(message: string, status: number, field?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.field = field;
  }
}

export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => AsyncStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => AsyncStorage.removeItem(TOKEN_KEY);

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  skipAuth?: boolean;
}

async function request<T>(path: string, { method = 'GET', body, skipAuth }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!skipAuth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisá tu conexión.', 0);
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => undefined) : undefined;

  if (!response.ok) {
    const body = data as { message?: string; field?: string } | undefined;
    throw new ApiError(body?.message || `Error del servidor (${response.status})`, response.status, body?.field);
  }
  return data as T;
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, bodyData?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body: bodyData }),
  patch: <T>(path: string, bodyData?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body: bodyData }),
};

// --- Tipos de dominio (reflejan lo que de verdad devuelve el backend) ---

export interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  phone: string | null;
  role: string;
}

export interface LegalSeccion {
  titulo: string;
  parrafos: string[];
}
export interface LegalDocumento {
  titulo: string;
  resumen: string;
  secciones: LegalSeccion[];
}
export interface LegalResponse {
  version: string;
  terminos: LegalDocumento;
  privacidad: LegalDocumento;
}

export interface Restaurante {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string | null;
  direccion: string;
  logo_url: string | null;
  cover_url: string | null;
  rating: string;
  tiempo_entrega_min: number;
  costo_envio: string;
  estado?: string;
}

export interface Plato {
  id: string;
  restaurante_id: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  imagen_url: string | null;
  disponible: boolean;
}

export interface Pedido {
  id: string;
  restaurante_id: string;
  items: { platoId: string; nombre: string; precio: number; cantidad: number }[];
  total: string;
  estado: string;
  direccion_entrega: string | null;
  created_at: string;
  cliente_nombre?: string;
  restaurante_nombre?: string;
}

export interface Vehiculo {
  id: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  color: string | null;
  placa: string;
  foto_url: string | null;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  rating: string;
}

export interface Ride {
  id: string;
  status: string;
  pickup_lat: number;
  pickup_lng: number;
  destination: string;
  distance_km: string | null;
  eta_minutes: number | null;
  final_price: string | null;
  offer_price: string | null;
  conductor_nombre?: string;
  conductor_apellidos?: string;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
  vehiculo_placa?: string;
  vehiculo_color?: string;
}

export const api = {
  auth: {
    register: (data: { nombre: string; apellidos: string; email: string; password: string; phone?: string; acceptedTermsVersion: string }) =>
      http.post<{ token: string; user: Usuario }>('/auth/register', data, { skipAuth: true }),
    login: (data: { email: string; password: string }) =>
      http.post<{ token: string; user: Usuario }>('/auth/login', data, { skipAuth: true }),
  },
  legal: {
    get: () => http.get<LegalResponse>('/legal', { skipAuth: true }),
  },
  restaurantes: {
    list: () => http.get<{ data: Restaurante[] }>('/restaurantes', { skipAuth: true }),
    get: (id: string) => http.get<{ restaurante: Restaurante; platos: Plato[] }>(`/restaurantes/${id}`, { skipAuth: true }),
    mine: () => http.get<{ restaurante: Restaurante | null }>('/restaurantes/me'),
    register: (data: {
      nombre: string;
      categoria: string;
      descripcion?: string;
      direccion: string;
      lat?: number;
      lng?: number;
      logoUrl?: string;
      coverUrl?: string;
      telefono?: string;
    }) => http.post<{ restaurante: Restaurante }>('/restaurantes', data),
    addPlato: (restauranteId: string, data: { nombre: string; descripcion?: string; precio: number; imagenUrl?: string }) =>
      http.post<{ plato: Plato }>(`/restaurantes/${restauranteId}/platos`, data),
    pedidos: (restauranteId: string) => http.get<{ data: Pedido[] }>(`/restaurantes/${restauranteId}/pedidos`),
    actualizarPedido: (restauranteId: string, pedidoId: string, estado: string) =>
      http.patch<{ pedido: Pedido }>(`/restaurantes/${restauranteId}/pedidos/${pedidoId}`, { estado }),
  },
  pedidos: {
    crear: (data: { restauranteId: string; items: { platoId: string; nombre: string; precio: number; cantidad: number }[]; direccionEntrega?: string }) =>
      http.post<{ pedido: Pedido }>('/pedidos', data),
    mios: () => http.get<{ data: Pedido[] }>('/pedidos/mios'),
  },
  vehiculos: {
    register: (data: { tipo: string; marca?: string; modelo?: string; color?: string; placa: string; fotoUrl?: string; dniFotoUrl?: string; iban: string }) =>
      http.post<{ vehiculo: Vehiculo }>('/vehiculos', data),
    mine: () => http.get<{ vehiculo: Vehiculo | null }>('/vehiculos/me'),
  },
  rides: {
    crear: (data: { pickupLat: number; pickupLng: number; destination: string; destinationLat?: number; destinationLng?: number; offerPrice?: number }) =>
      http.post<{ ride: Ride }>('/rides', data),
    mios: () => http.get<{ data: Ride[] }>('/rides/mios'),
    get: (id: string) => http.get<{ ride: Ride }>(`/rides/${id}`),
  },
  calificaciones: {
    crear: (data: { rideId?: string; pedidoId?: string; estrellas: number; comentario?: string }) => http.post('/calificaciones', data),
  },
  uploads: {
    /** `uri` es el archivo local que entrega expo-image-picker — se sube como multipart. */
    subirImagen: async (uri: string): Promise<{ url: string }> => {
      const token = await getToken();
      const formData = new FormData();
      const nombreArchivo = uri.split('/').pop() || 'foto.jpg';
      formData.append('file', { uri, name: nombreArchivo, type: 'image/jpeg' } as unknown as Blob);

      const response = await fetch(`${API_URL}/uploads`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      const data = await response.json().catch(() => undefined);
      if (!response.ok) throw new ApiError(data?.message || 'No se pudo subir la imagen', response.status);
      return data;
    },
  },
};
