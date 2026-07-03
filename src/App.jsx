import Layout from './components/layout/Layout.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

/**
 * App raíz. El Layout es persistente (sidebar + topbar) y adentro
 * se renderizan las rutas mediante <Outlet>.
 */
export default function App() {
  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}
