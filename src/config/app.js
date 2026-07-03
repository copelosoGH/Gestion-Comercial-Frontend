/**
 * Configuración de la app en el frontend.
 *
 * ID_USUARIO_ACTUAL: mientras no haya login, el backend exige un idUsuario en
 * ventas, anulaciones y pagos. Usamos un usuario de sistema fijo. Cuando se
 * agregue autenticación, esto sale del token / AuthContext.
 */
export const ID_USUARIO_ACTUAL = 1;

/** Medios de pago válidos para una venta (deben coincidir con el backend). */
export const MEDIOS_PAGO = [
  { valor: 'EFECTIVO', label: 'Efectivo' },
  { valor: 'DEBITO', label: 'Débito' },
  { valor: 'CREDITO', label: 'Crédito' },
  { valor: 'TRANSFERENCIA', label: 'Transferencia' },
  { valor: 'QR', label: 'QR' },
  { valor: 'CUENTA_CORRIENTE', label: 'Cuenta corriente (fiado)' },
];
