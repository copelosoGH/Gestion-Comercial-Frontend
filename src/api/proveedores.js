import api from './axios.js';

/**
 * Módulo Proveedores (CRUD completo).
 * Endpoints: GET /proveedores, POST /proveedores, GET /proveedores/:id,
 *            PUT /proveedores/:id, DELETE /proveedores/:id (baja lógica)
 */
export const proveedoresApi = {
  listar: (filtros = {}) =>
    api.get('/proveedores', { params: filtros }).then((r) => r.data),

  obtener: (id) => api.get(`/proveedores/${id}`).then((r) => r.data),

  crear: (datos) => api.post('/proveedores', datos).then((r) => r.data),

  actualizar: (id, datos) =>
    api.put(`/proveedores/${id}`, datos).then((r) => r.data),

  darDeBaja: (id) => api.delete(`/proveedores/${id}`).then((r) => r.data),
};

export default proveedoresApi;
