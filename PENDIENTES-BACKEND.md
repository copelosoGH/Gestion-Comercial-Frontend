# Pendientes del backend (para consumir desde el frontend)

Estado al día. El frontend ya consume todo lo que el backend expone. Lo que
sigue está bloqueado o limitado hasta que el backend agregue estos
endpoints/features.

## Ya resuelto (referencia)

- **Autenticación** — `POST /auth/login` + `GET /auth/usuario` integrados: login,
  token en cada request, manejo de 401 y logout. El `idUsuario` de
  ventas/compras/stock/pagos sale del usuario logueado.
- **Reportes** — `GET /reportes/{mas-vendidos,margenes,stock,reposicion}` con
  export a Excel (`?formato=excel`).
- **Compras / Reposiciones** — `/api/reposiciones` (alta, listado, detalle,
  anular) integrado como módulo "Compras".

## Bloqueantes

- **`GET /ubicaciones`** — Listar Local/Depósito (id + nombre). Hoy el frontend
  las **deriva** de las existencias de un producto (`useUbicaciones.js`), lo cual
  funciona pero es frágil (depende de que el producto tenga existencias sembradas
  en todas las ubicaciones). Con este endpoint, Transferencias / Ajustes / Mermas
  y la selección de ubicación en Compras quedan sólidas.
- **`GET /rubros`, `GET /subrubros`, `GET /marcas`** — Para el filtro por rubro
  del catálogo (hoy se acumula de los productos ya cargados) y para poder editar
  la clasificación de un producto (hoy es de solo-lectura en la edición).
- **Alta de productos** (`POST /productos`) — El repositorio tiene
  `crearProducto`/`crearVariante`/`crearExistenciasIniciales`, pero la ruta no
  está montada (solo GET, GET/:id, PUT/:id). Sin esto no hay pantalla
  "Registrar producto" ni alta de variantes.
- **Baja de productos** (`DELETE /productos/:id`) — Existe `darDeBajaProducto` en
  el repositorio pero la ruta no está montada.

## Módulos escritos pero NO montados / incompletos

- **Import / Export de productos** — Existe `productosExcel.js` + middleware
  `multer`, pero no hay rutas montadas para importar/exportar. Al haber export en
  Reportes, esto es menos urgente, pero el import masivo sigue faltando.

## Funcionalidades de la app vieja sin backend equivalente

- **Resúmenes por método de pago / totales de caja** — Reportes cubre
  más-vendidos, márgenes, stock y reposición, pero no el "resumen de ventas"
  (cantidad, menor, mayor, promedio, total, ganancia, y desglose por método de
  pago) que mostraba la pantalla "Resúmenes" del sistema viejo. Haría falta algo
  como `GET /reportes/resumen-ventas?desde&hasta` y
  `GET /reportes/ventas-por-metodo?desde&hasta`.
- **Métodos de pago (ABM)** — En el backend son un enum fijo, no CRUD.
- **Categorías (ABM)** — El backend usa rubro/subrubro/marca, no "categoría".
- **Configuración del negocio** (nombre, moneda, ticket) — Sin endpoint. La
  moneda del frontend hoy está fija en ARS (`utils/formato.js`).
- **Venta con item manual** (precio = costo) — `POST /ventas` solo acepta items
  con `idVariante` existente; no hay item de texto libre.
- **Impresión de ticket / comprobante** — Sin endpoint ni formato definido.

## Endpoint disponible aún no usado en UI

- `GET /cuenta-corriente/pagos/:id` — Detalle de un pago puntual (bajo valor: el
  estado de cuenta ya muestra los pagos recientes).

## Nota de configuración

- El backend ahora exige `JWT_SECRET` en su `.env` y usuarios creados con
  `node src/scripts/crearUsuario.js "Nombre" usuario contraseña DUENO`.
