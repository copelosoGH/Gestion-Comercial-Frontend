import { useCallback, useEffect, useState } from 'react';
import ventasApi from '../api/ventas.js';

/**
 * Hook de listado de ventas.
 * Filtros: desde, hasta (YYYY-MM-DD), idCliente, idUsuario, incluirAnuladas.
 * Respuesta: { items, paginacion: { pagina, limite, total, totalPaginas } }
 */
export default function useVentas(inicial = {}) {
  const [params, setParams] = useState({
    pagina: 1,
    limite: 20,
    desde: '',
    hasta: '',
    incluirAnuladas: false,
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
      if (params.desde) query.desde = params.desde;
      if (params.hasta) query.hasta = params.hasta;
      if (params.idCliente) query.idCliente = params.idCliente;
      if (params.idUsuario) query.idUsuario = params.idUsuario;
      if (params.incluirAnuladas) query.incluirAnuladas = true;

      const data = await ventasApi.listar(query);
      setItems(data.items ?? []);
      setPaginacion(data.paginacion ?? { pagina: 1, limite: params.limite, total: 0, totalPaginas: 1 });
    } catch (err) {
      setError(err.mensaje ?? 'No se pudieron cargar las ventas');
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
