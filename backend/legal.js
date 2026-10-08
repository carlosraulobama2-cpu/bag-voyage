/**
 * Bag Voyage — Términos y Privacidad
 *
 * Única fuente de verdad de la versión aceptada: `routes/auth.js` exige
 * `acceptedTermsVersion === CURRENT_TERMS_VERSION` para registrar una
 * cuenta nueva, y la guarda en `usuarios.accepted_terms_version` junto con
 * la fecha — si el texto cambia, sube la versión acá y toda cuenta vieja
 * queda con la versión que de verdad aceptó, no con la nueva en silencio.
 *
 * AVISO: estos textos describen lo que el sistema hace, pero no son un
 * dictamen jurídico — antes de abrir el servicio al público tienen que
 * pasar por un abogado, y hay que completar los datos entre [CORCHETES].
 */
const CURRENT_TERMS_VERSION = '2026-10-08';

const OPERADOR = {
  razonSocial: '[RAZÓN SOCIAL]',
  nif: '[CIF/NIF]',
  domicilio: '[DOMICILIO SOCIAL]',
  correo: '[CORREO DE CONTACTO]',
};

const TERMINOS = {
  titulo: 'Términos de servicio',
  resumen: 'Qué podés hacer en Bag Voyage, qué esperamos de vos, y las reglas de viajes, envíos y pedidos.',
  secciones: [
    {
      titulo: 'Qué es Bag Voyage',
      parrafos: [
        'Una plataforma que conecta pasajeros con conductores (viajes), remitentes con viajeros que llevan paquetes (envíos), y comercios con clientes (pedidos de comida). Bag Voyage no es transportista ni vendedor: intermedia el contacto y el pago entre las partes.',
      ],
    },
    {
      titulo: 'Tu cuenta',
      parrafos: [
        'Sos responsable de la información que cargás y de mantener tu contraseña en secreto. Una sola cuenta por persona; las cuentas de conductor y de comercio pasan por una revisión antes de poder recibir viajes o pedidos.',
      ],
    },
    {
      titulo: 'Viajes y envíos',
      parrafos: [
        'El precio de un viaje lo proponés vos (o lo ofertás como conductor); Bag Voyage no fija tarifas, sólo muestra una referencia. Cancelar repetidamente sin motivo puede limitar tu cuenta.',
      ],
    },
    {
      titulo: 'Comercios y pedidos',
      parrafos: [
        'Un comercio que se registra es responsable de la información de sus platos, precios y tiempos de entrega. Bag Voyage cobra una comisión sobre cada pedido completado, informada en el panel del comercio antes de aceptar el primer pedido.',
      ],
    },
    {
      titulo: 'Conducta',
      parrafos: [
        'Nada de contenido falso, acoso, ni intentar cobrar o pagar por fuera de la app para evitar la comisión. El incumplimiento puede terminar en la suspensión de la cuenta.',
      ],
    },
    {
      titulo: 'Contacto',
      parrafos: [`Dudas sobre estos términos: ${OPERADOR.correo} — ${OPERADOR.razonSocial}, ${OPERADOR.domicilio}.`],
    },
  ],
};

const PRIVACIDAD = {
  titulo: 'Política de privacidad',
  resumen: 'Qué datos guardamos, para qué, y cómo pedir que los borremos.',
  secciones: [
    {
      titulo: 'Quién trata tus datos',
      parrafos: [`El responsable es ${OPERADOR.razonSocial}, ${OPERADOR.nif}, con domicilio en ${OPERADOR.domicilio}. Para ejercer tus derechos, escribí a ${OPERADOR.correo}.`],
    },
    {
      titulo: 'Qué guardamos',
      parrafos: [
        'De tu cuenta: nombre, apellidos, correo, teléfono (si lo diste) y la contraseña cifrada — nunca en texto plano.',
        'De tu uso: viajes y envíos publicados, pedidos realizados, ubicación de recogida/entrega de cada viaje, y mensajes del chat de un viaje activo.',
        'Si sos conductor o comercio: documento de identidad, matrícula o dirección del local, y datos bancarios para recibir pagos.',
      ],
    },
    {
      titulo: 'Por qué los tratamos',
      parrafos: [
        'Para prestar el servicio que pediste al crear la cuenta (emparejar viajes, procesar pedidos) — sin estos datos la plataforma no funciona.',
        'Por interés legítimo en la seguridad: detectar abuso, fraude o cuentas duplicadas.',
      ],
    },
    {
      titulo: 'Con quién se comparte',
      parrafos: [
        'Tu nombre, foto y ubicación aproximada se muestran a la otra parte de un viaje/pedido activo mientras dura — nunca a terceros con fines publicitarios.',
      ],
    },
    {
      titulo: 'Tus derechos',
      parrafos: ['Acceder, corregir o borrar tus datos: escribí a ' + OPERADOR.correo + '. Borrar la cuenta borra tu perfil; el historial de pagos se conserva el tiempo que exija la ley.'],
    },
  ],
};

module.exports = { CURRENT_TERMS_VERSION, OPERADOR, TERMINOS, PRIVACIDAD };
