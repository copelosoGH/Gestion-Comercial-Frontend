import { useCallback, useEffect, useState } from 'react';
import clientesApi from '../api/clientes.js';

/**
 * Hook de listado de clientes. Mismo patrón que useProductos.
 * Filtros: busqueda, conDeuda, incluirInactivos.
 * Respuesta: { items, paginacion: { pagina, limite, total, totalPaginas } }
 */
export default function useClientes(inicial = {}) {
  const [params, setParams] = useState({
    pagina: 1,
    limite: 20,
    busqueda: '',
    conDeuda: false,
    incluirInactivos: false,
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
      const query = { pagina: params.pagina, limite: params.limite };
      if (params.busqueda?.trim()) query.busqueda = params.busqueda.trim();
      if (params.conDeuda) query.conDeuda = true;
      if (params.incluirInactivos) query.incluirInactivos = true;

      const data = await clientesApi.listar(query);
      setItems(data.items ?? []);
      setPaginacion(data.paginacion ?? { pagina: 1, limite: params.limite, total: 0, totalPaginas: 1 });
    } catch (err) {
      setError(err.mensaje ?? 'No se pudieron cargar los clientes');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const setFiltro = (cambios, resetPagina = true) =>
    setParams((prev) => ({ ...prev, ...cambios, ...(resetPagina ? { pagina: 1 } : {}) }));

  const setPagina = (pagina) => setParams((prev) => ({ ...prev, pagina }));

  return { items, paginacion, loading, error, params, setFiltro, setPagina, recargar: cargar };
}
