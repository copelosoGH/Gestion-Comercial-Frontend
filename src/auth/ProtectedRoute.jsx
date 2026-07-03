import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

/**
 * ANDAMIAJE (placeholder). Envolverá las rutas privadas cuando haya login.
 * Uso futuro:  <Route element={<ProtectedRoute><Layout/></ProtectedRoute>} >
 */
export default function ProtectedRoute({ children }) {
  const { autenticado } = useAuth();
  if (!autenticado) return <Navigate to="/login" replace />;
  return children;
}
