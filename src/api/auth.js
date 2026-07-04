import api from './axios.js';

/**
 * Módulo Auth.
 * Endpoints: POST /auth/login, GET /auth/usuario
 */
export const authApi = {
  login: (usuarioLogin, password) =>
    api.post('/auth/login', { usuarioLogin, password }).then((r) => r.data),

  me: () => api.get('/auth/usuario').then((r) => r.data),
};

export default authApi;
