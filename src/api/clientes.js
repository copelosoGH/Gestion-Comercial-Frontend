import api from './axios.js';

/**
 * Módulo Clientes (CRUD completo).
 * Endpoints: GET /clientes, POST /clientes, GET /clientes/:id,
 *            PUT /clientes/:id, DELETE /clientes/:id (baja lógica)
 */
export const clientesApi = {
  listar: (filtros = {}) =>
    api.get('/clientes', { params: filtros }).then((r) => r.data),

  obtener: (id) => api.get(`/clientes/${id}`).then((r) => r.data),

  crear: (datos) => api.post('/clientes', datos).then((r) => r.data),

  actualizar: (id, datos) =>
    api.put(`/clientes/${id}`, datos).then((r) => r.data),

  darDeBaja: (id) => api.delete(`/clientes/${id}`).then((r) => r.data),
};

export default clientesApi;
