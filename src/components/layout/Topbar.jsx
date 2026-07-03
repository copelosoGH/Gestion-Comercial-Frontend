import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Inventory2Icon from '@mui/icons-material/Inventory2';

/**
 * Barra superior fija. El botón de menú colapsa/expande el sidebar.
 */
export default function Topbar({ onToggle, drawerWidth }) {
  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <IconButton edge="start" onClick={onToggle} aria-label="menú" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        <Inventory2Icon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
          Gestión Comercial
        </Typography>

        <Box sx={{ flexGrow: 1 }} />
        {/* Espacio reservado para: usuario, notificaciones, buscador global */}
      </Toolbar>
    </AppBar>
  );
}
