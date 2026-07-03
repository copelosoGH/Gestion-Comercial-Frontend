import api from './axios.js';

/**
 * Módulo Productos.
 * Endpoints backend: GET /productos, GET /productos/:id, PUT /productos/:id
 * (POST/DELETE aún no existen en el backend).
 */
export const productosApi = {
  // filtros: { pagina, limite, busqueda, idRubro }
  listar: (filtros = {}) =>
    api.get('/productos', { params: filtros }).then((r) => r.data),

  obtener: (id) => api.get(`/productos/${id}`).then((r) => r.data),

  actualizar: (id, datos) =>
    api.put(`/productos/${id}`, datos).then((r) => r.data),
};

export default productosApi;
