import api from './axios.js';

/**
 * Modulo Compras / Reposiciones. (montado en /api/reposiciones)
 * Endpoints: GET /reposiciones, POST /reposiciones,
 *            GET /reposiciones/:id, POST /reposiciones/:id/anular
 */
export const reposicionesApi = {
  listar: (filtros = {}) =>
    api.get('/reposiciones', { params: filtros }).then((r) => r.data),

  obtener: (id) => api.get('/reposiciones/' + id).then((r) => r.data),

  // datos: { idUsuario, idProveedor, idUbicacion?, numeroFactura?, fecha?, observacion?,
  //          items:[{ idVariante, cantidadCajas, unidadesPorCaja, costoUnitario }] }
  crear: (datos) => api.post('/reposiciones', datos).then((r) => r.data),

  // datos: { idUsuario, motivo? }
  anular: (id, datos) => api.post('/reposiciones/' + id + '/anular', datos).then((r) => r.data),
};

export default reposicionesApi;
