import HomeIcon from '@mui/icons-material/Home';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';

/**
 * Arbol del menu lateral. Esta MISMA estructura la consumen el Sidebar
 * (para dibujar el menu) y AppRoutes (para generar las <Route>).
 */
export const menu = [
  { label: 'Inicio', icon: <HomeIcon />, path: '/' },

  {
    label: 'Ventas',
    icon: <PointOfSaleIcon />,
    children: [
      { label: 'Nueva venta', path: '/ventas/nueva' },
      { label: 'Historial', path: '/ventas' },
    ],
  },

  {
    label: 'Compras',
    icon: <ShoppingCartIcon />,
    children: [
      { label: 'Nueva compra', path: '/compras/nueva' },
      { label: 'Historial', path: '/compras' },
    ],
  },

  {
    label: 'Productos',
    icon: <Inventory2Icon />,
    children: [
      { label: 'Catalogo', path: '/productos' },
      { label: 'Importar / Exportar', path: '/productos/importar' },
    ],
  },

  {
    label: 'Stock',
    icon: <WarehouseIcon />,
    children: [
      { label: 'Existencias', path: '/stock' },
      { label: 'Transferencias', path: '/stock/transferencias' },
      { label: 'Ajustes', path: '/stock/ajustes' },
      { label: 'Mermas', path: '/stock/mermas' },
      { label: 'Alertas', path: '/stock/alertas' },
      { label: 'Reposicion', path: '/stock/reposicion' },
    ],
  },

  {
    label: 'Cuenta corriente',
    icon: <AccountBalanceWalletIcon />,
    children: [
      { label: 'Deudores', path: '/cuenta-corriente/deudores' },
      { label: 'Registrar pago', path: '/cuenta-corriente/pagos' },
    ],
  },

  { label: 'Clientes', icon: <PeopleIcon />, path: '/clientes' },
  { label: 'Proveedores', icon: <LocalShippingIcon />, path: '/proveedores' },
  { label: 'Reportes', icon: <AssessmentIcon />, path: '/reportes' },
  { label: 'Configuracion', icon: <SettingsIcon />, path: '/configuracion' },
];

export default menu;
