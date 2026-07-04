import { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Box, Tooltip, Menu, MenuItem,
  Avatar, Divider, ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuth } from '../../auth/AuthContext.jsx';

/** Barra superior fija. Menu de usuario con logout. */
export default function Topbar({ onToggle }) {
  const { usuario, logout } = useAuth();
  const [ancla, setAncla] = useState(null);

  const iniciales = (usuario?.nombre ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <AppBar position="fixed" color="inherit" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton edge="start" onClick={onToggle} aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        <Inventory2Icon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
          Gestion Comercial
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {usuario && (
          <>
            <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }} color="text.secondary">
              {usuario.nombre}
            </Typography>
            <Tooltip title="Cuenta">
              <IconButton onClick={(e) => setAncla(e.currentTarget)} size="small">
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 15 }}>{iniciales}</Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={ancla} open={!!ancla} onClose={() => setAncla(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <MenuItem disabled sx={{ opacity: 1 }}>
                <Box>
                  <Typography variant="body2" fontWeight={700}>{usuario.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">{usuario.usuarioLogin} · {usuario.rol}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAncla(null); logout(); }}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                Cerrar sesion
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
