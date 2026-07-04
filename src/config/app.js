/**
 * Configuracion de la app en el frontend.
 */

// El id del usuario logueado sale de la sesion (token). Se reexporta aca para
// que las pantallas lo tomen sin acoplarse a session.js.
export { getIdUsuarioActual } from '../auth/session.js';

/** Medios de pago validos para una venta (deben coincidir con el backend). */
export const MEDIOS_PAGO = [
  { valor: 'EFECTIVO', label: 'Efectivo' },
  { valor: 'DEBITO', label: 'Debito' },
  { valor: 'CREDITO', label: 'Credito' },
  { valor: 'TRANSFERENCIA', label: 'Transferencia' },
  { valor: 'QR', label: 'QR' },
  { valor: 'CUENTA_CORRIENTE', label: 'Cuenta corriente (fiado)' },
];
