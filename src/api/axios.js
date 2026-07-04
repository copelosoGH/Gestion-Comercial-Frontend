import axios from 'axios';
import { getToken, clearSession } from '../auth/session.js';

/**
 * Instancia central de Axios. Un solo lugar para baseURL, token y errores.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// --- Request: adjunta el token si hay sesion ---
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

// --- Response: normaliza el error y maneja el 401 (sesion vencida) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';

    // 401 en cualquier request que no sea el propio login -> cerrar sesion.
    if (status === 401 && !url.includes('/auth/login')) {
      clearSession();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    const mensaje =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'Error de conexion con el servidor';
    return Promise.reject(Object.assign(error, { mensaje }));
  },
);

export default api;
