/**
 * Bag Voyage — Distancia y tiempo estimado (ETA)
 *
 * Sin clave de Google Maps/Mapbox: la fórmula de Haversine (distancia en
 * línea recta sobre la esfera terrestre) y una velocidad media asumida dan
 * una estimación razonable para mostrar "2.3 km · 6 min" apenas se
 * empareja un conductor — exactamente lo que de verdad hace falta (Uber
 * también muestra esto ANTES de calcular la ruta real por calles). Si más
 * adelante se integra una API de rutas real, sólo hay que reemplazar
 * `calcularDistanciaKm`/`estimarEtaMinutos` sin tocar quién las llama.
 */

const RADIO_TIERRA_KM = 6371;

/** Grados a radianes. */
function aRadianes(grados) {
  return (grados * Math.PI) / 180;
}

/** Distancia en línea recta entre dos puntos (lat/lng), en kilómetros. */
function calcularDistanciaKm(lat1, lng1, lat2, lng2) {
  const dLat = aRadianes(lat2 - lat1);
  const dLng = aRadianes(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RADIO_TIERRA_KM * c;
}

/**
 * 25 km/h de velocidad media: tráfico urbano real, no autopista — Malabo y
 * Bata (donde corre esta app) no tienen autopistas de verdad. Un mínimo de
 * 2 minutos para que un viaje de la vuelta de la esquina no muestre "0 min"
 * y parezca un error.
 */
function estimarEtaMinutos(distanciaKm, velocidadKmh = 25) {
  const minutos = (distanciaKm / velocidadKmh) * 60;
  return Math.max(2, Math.round(minutos));
}

module.exports = { calcularDistanciaKm, estimarEtaMinutos };
