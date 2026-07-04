import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';

/**
 * App raiz. /login es publico; el resto va protegido dentro del Layout.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <AppRoutes />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
