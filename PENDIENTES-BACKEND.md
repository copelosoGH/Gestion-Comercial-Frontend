# Pendientes del backend (para consumir desde el frontend)

El frontend ya consume todo lo que el backend expone hoy. Lo que sigue está
bloqueado o limitado hasta que el backend agregue estos endpoints/features.

## Bloqueantes

- **`GET /ubicaciones`** — Listar Local/Depósito (id + nombre). Hoy el frontend
  las **deriva** de las existencias de un producto (`useUbicaciones.js`), lo cual
  funciona pero es frágil. Con este endpoint, Transferencias/Ajustes/Mermas
  quedan sólidos.
- **`GET /rubros`, `GET /subrubros`, `GET /marcas`** — Para el filtro de rubro del
  catálogo (hoy se acumula de los productos cargados) y para poder editar la
  clasificación de un producto (hoy es de solo-lectura en la edición).
- **Alta de productos** (`POST /productos`) — El backend tiene `crearProducto` en
  el repositorio pero la ruta no está montada (solo GET/GET:id/PUT). Sin esto no
  hay pantalla "Registrar producto".
- **Autenticación (`POST /auth/login`)** — Hoy se usa un `idUsuario` fijo
  (`src/config/app.js` → `ID_USUARIO_ACTUAL`). El andamiaje de auth ya está en
  `src/auth/`.

## Módulos escritos pero NO montados en `app.js`

- **`reposiciones`** — Existe el módulo completo; falta
  `app.use('/api/reposiciones', reposicionRoutes)`.
- **Import/Export de productos** — Existe `productosExcel.js` + middleware de
  `multer`, pero no hay rutas montadas para importar/exportar.

## Funcionalidades de la app vieja sin backend equivalente

- **Resúmenes / Reportes** — La app vieja muestra totales, promedio, ganancia,
  "por métodos", imprimir/exportar. No hay endpoint de agregados. Haría falta
  algo como `GET /reportes/resumen?desde&hasta`.
- **Compra de mercadería / Ingresar productos** — No hay módulo de compras.
- **Métodos de pago (ABM)** — En el backend son un enum fijo, no CRUD.
- **Categorías (ABM)** — El backend usa rubro/subrubro/marca, no "categoría".
- **Configuración del negocio** (nombre, moneda, ticket) — Sin endpoint.
- **Venta con item manual** (precio = costo) — `POST /ventas` solo acepta items
  con `idVariante` existente; no hay item de texto libre.

## Endpoint disponible aún no usado en UI

- `GET /cuenta-corriente/pagos/:id` — Detalle de un pago puntual (bajo valor por
  ahora; el estado de cuenta ya muestra los pagos recientes).
