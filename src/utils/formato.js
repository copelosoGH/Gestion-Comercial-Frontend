/**
 * Helpers de formato. La moneda por defecto es ARS (es-AR); cuando el backend
 * exponga la configuracion de moneda del negocio, se puede parametrizar aca.
 */
const monedaFmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
});

const numeroFmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

export function formatMoneda(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? monedaFmt.format(n) : '-';
}

export function formatNumero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? numeroFmt.format(n) : '-';
}

const fechaHoraFmt = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

/** Fecha+hora legible a partir de un ISO string o Date. */
export function formatFechaHora(valor) {
  if (!valor) return '-';
  const d = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(d.getTime()) ? '-' : fechaHoraFmt.format(d);
}

/** Rango de precios "min - max" (o unico si coinciden). */
export function formatRangoPrecio(min, max) {
  if (min == null && max == null) return '-';
  if (min === max) return formatMoneda(min);
  return formatMoneda(min) + ' - ' + formatMoneda(max);
}
