import axios from 'axios';

/**
 * Instancia central de Axios.
 * Todos los módulos de src/api/* la usan, así hay un solo lugar para
 * configurar baseURL, headers, auth (a futuro) y manejo de errores.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// --- Request: acá irá el token cuando exista login ---
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Response: normaliza el error para que las páginas muestren un mensaje limpio ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensaje =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'Error de conexión con el servidor';
    // Rechazamos con un error enriquecido pero conservando el original.
    return Promise.reject(Object.assign(error, { mensaje }));
  },
);

export default api;
