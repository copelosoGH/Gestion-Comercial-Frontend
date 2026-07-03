import api from './axios.js';

/** Chequeo de salud del backend. GET /health */
export const healthApi = {
  check: () => api.get('/health').then((r) => r.data),
};

export default healthApi;
