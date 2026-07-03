import { createContext, useContext, useState } from 'react';

/**
 * ANDAMIAJE DE AUTH (placeholder).
 * Por ahora NO hay login: el backend todavía no expone endpoint de autenticación
 * (las ventas usan un idUsuario fijo). Este contexto queda listo para enchufar
 * el login real cuando exista:
 *   - guardar token en el interceptor de src/api/axios.js
 *   - envolver rutas privadas con <ProtectedRoute>
 *
 * Mientras tanto exponemos un usuario "de sistema" fijo.
 */
const USUARIO_SISTEMA = { idUsuario: 1, nombre: 'Sistema' };

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(USUARIO_SISTEMA);

  const login = async (/* credenciales */) => {
    // TODO: cuando exista el endpoint -> POST /auth/login, guardar token
    setUsuario(USUARIO_SISTEMA);
  };

  const logout = () => setUsuario(null);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, autenticado: !!usuario }}>
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
