import api from './axios.js';

/**
 * Módulo Reposiciones.
 * OJO: el backend tiene el módulo escrito pero NO está montado en app.js
 * (falta `app.use('/api/reposiciones', ...)`). Cuando lo monten, esto ya funciona.
 * Endpoints previstos: GET /reposiciones, POST /reposiciones,
 *                      GET /reposiciones/:id, POST /reposiciones/:id/anular
 */
export const reposicionesApi = {
  listar: (filtros = {}) =>
    api.get('/reposiciones', { params: filtros }).then((r) => r.data),

  obtener: (id) => api.get(`/reposiciones/${id}`).then((r) => r.data),

  crear: (datos) => api.post('/reposiciones', datos).then((r) => r.data),

  anular: (id, motivo) =>
    api.post(`/reposiciones/${id}/anular`, { motivo }).then((r) => r.data),
};

export default reposicionesApi;
