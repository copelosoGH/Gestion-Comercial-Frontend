import { useCallback, useEffect, useState } from 'react';
import productosApi from '../api/productos.js';

/**
 * Hook de listado de productos. Encapsula fetch + loading + error + paginación.
 * Sirve de molde para los hooks de los demás módulos.
 *
 * Respuesta del backend:
 *   { items: [...], paginacion: { pagina, limite, total, totalPaginas } }
 */
export default function useProductos(inicial = {}) {
  const [params, setParams] = useState({
    pagina: 1,
    limite: 20,
    busqueda: '',
    idRubro: '',
    ...inicial,
  });

  const [items, setItems] = useState([]);
  const [paginacion, setPaginacion] = useState({ pagina: 1, limite: 20, total: 0, totalPaginas: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Limpiamos params vacíos para no mandar ?busqueda=&idRubro=
      const query = {};
      if (params.pagina) query.pagina = params.pagina;
      if (params.limite) query.limite = params.limite;
      if (params.busqueda?.trim()) query.busqueda = params.busqueda.trim();
      if (params.idRubro) query.idRubro = params.idRubro;

      const data = await productosApi.listar(query);
      setItems(data.items ?? []);
      setPaginacion(data.paginacion ?? { pagina: 1, limite: params.limite, total: 0, totalPaginas: 1 });
    } catch (err) {
      setError(err.mensaje ?? 'No se pudieron cargar los productos');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Helpers para actualizar filtros reseteando la página cuando corresponde.
  const setFiltro = (cambios, resetPagina = true) =>
    setParams((prev) => ({ ...prev, ...cambios, ...(resetPagina ? { pagina: 1 } : {}) }));

  const setPagina = (pagina) => setParams((prev) => ({ ...prev, pagina }));

  return { items, paginacion, loading, error, params, setFiltro, setPagina, recargar: cargar };
}
