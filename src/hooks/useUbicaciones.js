import { useEffect, useState } from 'react';
import productosApi from '../api/productos.js';

/**
 * Deriva la lista de ubicaciones (Local / Deposito) a partir de las
 * existencias de un producto, porque el backend TODAVIA no expone
 * un endpoint GET /ubicaciones.
 *
 * El backend siembra una fila de existencia por cada ubicacion activa al
 * crear una variante, asi que cualquier producto sirve de fuente.
 * Cuando exista GET /ubicaciones, reemplazar esta lógica por esa llamada.
 *
 * Devuelve: { ubicaciones: [{ idUbicacion, ubicacion }], loading, error }
 */
export default function useUbicaciones() {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const lista = await productosApi.listar({ limite: 1, pagina: 1 });
        const primero = lista.items?.[0];
        if (!primero) {
          if (vivo) { setUbicaciones([]); setLoading(false); }
          return;
        }
        const detalle = await productosApi.obtener(primero.idProducto);
        const mapa = new Map();
        (detalle.variantes ?? []).forEach((v) =>
          (v.existencias ?? []).forEach((e) => mapa.set(e.idUbicacion, e.ubicacion)),
        );
        if (vivo) {
          setUbicaciones([...mapa.entries()].map(([idUbicacion, ubicacion]) => ({ idUbicacion, ubicacion })));
        }
      } catch (err) {
        if (vivo) setError(err.mensaje ?? 'No se pudieron obtener las ubicaciones');
      } finally {
        if (vivo) setLoading(false);
      }
    })();
    return () => { vivo = false; };
  }, []);

  return { ubicaciones, loading, error };
}
