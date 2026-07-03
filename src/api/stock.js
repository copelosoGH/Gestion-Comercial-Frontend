import api from './axios.js';

/**
 * Módulo Stock (multi-ubicación).
 * Endpoints: POST /stock/transferencias, /stock/ajustes, /stock/mermas
 *            GET /stock/alertas
 */
export const stockApi = {
  transferir: (datos) =>
    api.post('/stock/transferencias', datos).then((r) => r.data),

  ajustar: (datos) => api.post('/stock/ajustes', datos).then((r) => r.data),

  registrarMerma: (datos) =>
    api.post('/stock/mermas', datos).then((r) => r.data),

  alertas: (filtros = {}) =>
    api.get('/stock/alertas', { params: filtros }).then((r) => r.data),
};

export default stockApi;
