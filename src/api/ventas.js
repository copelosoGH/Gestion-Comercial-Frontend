import api from './axios.js';

/**
 * Modulo Ventas.
 * Endpoints: GET /ventas, POST /ventas, GET /ventas/:id, POST /ventas/:id/anular
 */
export const ventasApi = {
  listar: (filtros = {}) =>
    api.get('/ventas', { params: filtros }).then((r) => r.data),

  obtener: (id) => api.get('/ventas/' + id).then((r) => r.data),

  // datos: { idUsuario, idCliente?, items:[{idVariante, cantidad}], pagos:[{medioPago, monto}], observacion? }
  crear: (datos) => api.post('/ventas', datos).then((r) => r.data),

  // datos: { idUsuario, motivo? }
  anular: (id, datos) =>
    api.post('/ventas/' + id + '/anular', datos).then((r) => r.data),
};

export default ventasApi;
