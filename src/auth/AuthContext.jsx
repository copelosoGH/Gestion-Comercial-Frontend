import { createContext, useContext, useState } from 'react';
import authApi from '../api/auth.js';
import { getUsuario, getToken, setSession, clearSession } from './session.js';

/**
 * Contexto de autenticacion real (login por usuario + contraseña, token JWT).
 * El token y los datos del usuario viven en localStorage (ver session.js).
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => getUsuario());

  const login = async (usuarioLogin, password) => {
    const data = await authApi.login(usuarioLogin, password);
    setSession(data.token, data.usuario);
    setUsuario(data.usuario);
    return data.usuario;
  };

  const logout = () => {
    clearSession();
    setUsuario(null);
  };

  const autenticado = !!usuario && !!getToken();

  return (
    <AuthContext.Provider value={{ usuario, login, logout, autenticado }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

export default AuthContext;
