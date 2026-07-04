import api from './axios.js';

/**
 * Módulo Reportes.
 * Endpoints (GET, JSON o Excel con ?formato=excel):
 *   /reportes/mas-vendidos?desde&hasta&limite
 *   /reportes/margenes?busqueda&idRubro
 *   /reportes/stock?busqueda&idRubro
 *   /reportes/reposicion
 * En JSON el backend responde { items: [...] }.
 */
const jsonItems = (r) => r.data?.items ?? [];

export const reportesApi = {
  masVendidos: (params = {}) => api.get('/reportes/mas-vendidos', { params }).then(jsonItems),
  margenes: (params = {}) => api.get('/reportes/margenes', { params }).then(jsonItems),
  stock: (params = {}) => api.get('/reportes/stock', { params }).then(jsonItems),
  reposicion: (params = {}) => api.get('/reportes/reposicion', { params }).then(jsonItems),

  /** Descarga el reporte como archivo Excel. */
  descargarExcel: async (recurso, params = {}, nombreArchivo = 'reporte.xlsx') => {
    const res = await api.get(`/reportes/${recurso}`, {
      params: { ...params, formato: 'excel' },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

export default reportesApi;
