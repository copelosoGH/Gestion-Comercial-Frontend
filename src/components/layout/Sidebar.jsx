import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  Box,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CircleIcon from '@mui/icons-material/Circle';

import menu from '../../routes/menuConfig.jsx';
import { DRAWER_WIDTH, MINI_WIDTH } from './Layout.jsx';

/** Alguna hoja de este grupo coincide con la ruta actual? */
function grupoActivo(item, pathname) {
  return item.children?.some((c) => pathname === c.path);
}

function SidebarContent({ collapsed, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  // Un solo grupo abierto a la vez: guardamos el indice abierto (o null).
  const [abierto, setAbierto] = useState(null);

  // Al cambiar de ruta, abrir el grupo que la contiene y cerrar los demas.
  useEffect(() => {
    const idx = menu.findIndex((item) => item.children && grupoActivo(item, location.pathname));
    if (idx >= 0) setAbierto(idx);
  }, [location.pathname]);

  const ir = (path) => {
    navigate(path);
    onNavigate?.();
  };

  // Acordeon exclusivo: abrir uno cierra el que estuviera abierto.
  const toggleGrupo = (i) => setAbierto((prev) => (prev === i ? null : i));

  return (
    <>
      <Toolbar />
      <Box sx={{ overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        <List component="nav" disablePadding>
          {menu.map((item, i) => {
            // --- Hoja simple ---
            if (!item.children) {
              const selected = location.pathname === item.path;
              return (
                <ListItem key={item.label} disablePadding sx={{ display: 'block' }}>
                  <Tooltip title={collapsed ? item.label : ''} placement="right">
                    <ListItemButton
                      selected={selected}
                      onClick={() => ir(item.path)}
                      sx={{ minHeight: 44, px: 2.5, justifyContent: collapsed ? 'center' : 'initial' }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center' }}>
                        {item.icon}
                      </ListItemIcon>
                      {!collapsed && <ListItemText primary={item.label} />}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            }

            // --- Grupo con hijos desplegables ---
            const open = abierto === i;
            const activo = grupoActivo(item, location.pathname);
            return (
              <Box key={item.label}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <Tooltip title={collapsed ? item.label : ''} placement="right">
                    <ListItemButton
                      selected={collapsed && activo}
                      onClick={() => (collapsed ? ir(item.children[0].path) : toggleGrupo(i))}
                      sx={{ minHeight: 44, px: 2.5, justifyContent: collapsed ? 'center' : 'initial' }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center' }}>
                        {item.icon}
                      </ListItemIcon>
                      {!collapsed && <ListItemText primary={item.label} />}
                      {!collapsed && (open ? <ExpandLess /> : <ExpandMore />)}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>

                {!collapsed && (
                  <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child) => {
                        const selected = location.pathname === child.path;
                        return (
                          <ListItemButton
                            key={child.path}
                            selected={selected}
                            onClick={() => ir(child.path)}
                            sx={{ pl: 4.5, minHeight: 38 }}
                          >
                            <ListItemIcon sx={{ minWidth: 26 }}>
                              <CircleIcon sx={{ fontSize: 8 }} color={selected ? 'primary' : 'disabled'} />
                            </ListItemIcon>
                            <ListItemText primary={child.label} primaryTypographyProps={{ variant: 'body2' }} />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>
    </>
  );
}

/**
 * Sidebar: drawer permanente en escritorio (colapsable a mini) y
 * temporal (overlay) en mobile.
 */
export default function Sidebar({ isDesktop, collapsed, mobileOpen, onMobileClose }) {
  const width = collapsed ? MINI_WIDTH : DRAWER_WIDTH;

  if (!isDesktop) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
      >
        <SidebarContent collapsed={false} onNavigate={onMobileClose} />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
        },
      }}
      open
    >
      <SidebarContent collapsed={collapsed} />
    </Drawer>
  );
}
