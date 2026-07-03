# Gestión Comercial — Frontend

Frontend del sistema de gestión comercial (polirubro). SPA con menú lateral
colapsable y contenido a la derecha — reemplaza la app de escritorio que abría
una ventana por cada opción.

## Stack

- **Vite** + **React 18**
- **Material UI (MUI 6)** + iconos
- **React Router 6**
- **Axios** (capa de API centralizada)

## Cómo correr

```bash
npm install
npm run dev
```

Abre en http://localhost:5173. La URL del backend se configura en `.env`:

```
VITE_API_URL=http://localhost:3000/api
```

El backend (Express + Postgres/Neon) debe estar corriendo en el puerto 3000.

## Estructura

```
src/
  api/          Capa de acceso al backend (axios + un archivo por módulo)
  auth/         Andamiaje de autenticación (placeholder, sin login todavía)
  components/
    layout/     Layout persistente: Topbar + Sidebar colapsable
    common/     Componentes reutilizables (PlaceholderPage, etc.)
  pages/        Una carpeta por módulo con sus pantallas
  routes/       menuConfig (árbol del menú) + AppRoutes (definición de rutas)
  theme/        Tema de MUI (colores, tipografía, locale es)
  main.jsx      Punto de entrada (providers)
  App.jsx       Layout + rutas
```

El menú lateral y las rutas se manejan desde `src/routes/`. Para agregar una
pantalla: creá la página en `src/pages/...`, sumala a `menuConfig.jsx` y a
`AppRoutes.jsx`.

## Estado

Este es el **andamiaje (scaffold)**: layout, navegación y capa de API listos.
Las pantallas son placeholders que se irán reemplazando por el contenido real.

### Endpoints del backend disponibles

- `productos`: GET /, GET /:id, PUT /:id (faltan POST/DELETE)
- `ventas`: GET /, POST /, GET /:id, POST /:id/anular
- `stock`: POST /transferencias, /ajustes, /mermas · GET /alertas
- `cuenta-corriente`: POST /pagos · GET /pagos/:id, /clientes/:id/estado, /deudores
- `clientes`, `proveedores`: CRUD completo
- `health`: GET /

> Pendiente en backend: montar `reposiciones` en `app.js` y agregar autenticación.
