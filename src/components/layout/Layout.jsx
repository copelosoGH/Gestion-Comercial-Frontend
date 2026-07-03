import { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Topbar from './Topbar.jsx';
import Sidebar from './Sidebar.jsx';

export const DRAWER_WIDTH = 260;
export const MINI_WIDTH = 68;

/**
 * Layout persistente de la app: Topbar arriba, Sidebar a la izquierda,
 * y el contenido (las rutas) a la derecha.
 *
 * - En escritorio el drawer es permanente y se puede colapsar a modo "mini"
 *   (solo iconos) con el botón del Topbar.
 * - En mobile el drawer es temporal (se abre por encima).
 */
export default function Layout({ children }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Escritorio: colapsado o no. Mobile: abierto o no (overlay).
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => {
    if (isDesktop) setCollapsed((c) => !c);
    else setMobileOpen((o) => !o);
  };

  const currentWidth = isDesktop ? (collapsed ? MINI_WIDTH : DRAWER_WIDTH) : 0;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Topbar onToggle={handleToggle} drawerWidth={currentWidth} />

      <Sidebar
        isDesktop={isDesktop}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${currentWidth}px)` },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          p: { xs: 2, md: 3 },
        }}
      >
        {/* Espaciador para no quedar debajo del AppBar fijo */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
