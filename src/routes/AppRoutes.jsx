import { Routes, Route } from 'react-router-dom';

import Inicio from '../pages/Inicio/Inicio.jsx';
import NuevaVenta from '../pages/Ventas/NuevaVenta.jsx';
import HistorialVentas from '../pages/Ventas/HistorialVentas.jsx';
import NuevaCompra from '../pages/Compras/NuevaCompra.jsx';
import HistorialCompras from '../pages/Compras/HistorialCompras.jsx';
import Catalogo from '../pages/Productos/Catalogo.jsx';
import ImportarExportar from '../pages/Productos/ImportarExportar.jsx';
import Existencias from '../pages/Stock/Existencias.jsx';
import Transferencias from '../pages/Stock/Transferencias.jsx';
import Ajustes from '../pages/Stock/Ajustes.jsx';
import Mermas from '../pages/Stock/Mermas.jsx';
import Alertas from '../pages/Stock/Alertas.jsx';
import Reposicion from '../pages/Stock/Reposicion.jsx';
import Deudores from '../pages/CuentaCorriente/Deudores.jsx';
import RegistrarPago from '../pages/CuentaCorriente/RegistrarPago.jsx';
import Clientes from '../pages/Clientes/Clientes.jsx';
import Proveedores from '../pages/Proveedores/Proveedores.jsx';
import Reportes from '../pages/Reportes/Reportes.jsx';
import Configuracion from '../pages/Configuracion/Configuracion.jsx';
import NotFound from '../pages/NotFound.jsx';

/** Definicion central de rutas (coinciden con menuConfig.jsx). */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />

      <Route path="/ventas" element={<HistorialVentas />} />
      <Route path="/ventas/nueva" element={<NuevaVenta />} />

      <Route path="/compras" element={<HistorialCompras />} />
      <Route path="/compras/nueva" element={<NuevaCompra />} />

      <Route path="/productos" element={<Catalogo />} />
      <Route path="/productos/importar" element={<ImportarExportar />} />

      <Route path="/stock" element={<Existencias />} />
      <Route path="/stock/transferencias" element={<Transferencias />} />
      <Route path="/stock/ajustes" element={<Ajustes />} />
      <Route path="/stock/mermas" element={<Mermas />} />
      <Route path="/stock/alertas" element={<Alertas />} />
      <Route path="/stock/reposicion" element={<Reposicion />} />

      <Route path="/cuenta-corriente/deudores" element={<Deudores />} />
      <Route path="/cuenta-corriente/pagos" element={<RegistrarPago />} />

      <Route path="/clientes" element={<Clientes />} />
      <Route path="/proveedores" element={<Proveedores />} />
      <Route path="/reportes" element={<Reportes />} />
      <Route path="/configuracion" element={<Configuracion />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
