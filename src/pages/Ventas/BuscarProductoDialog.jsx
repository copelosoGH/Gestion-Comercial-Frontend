import { useEffect, useRef, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  InputAdornment, List, ListItemButton, ListItemText, CircularProgress,
  Alert, Box, Stack, Chip, IconButton, Divider, Typography, TableRow,
  Table, TableBody, TableCell,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

import useProductos from '../../hooks/useProductos.js';
import productosApi from '../../api/productos.js';
import { formatMoneda, formatNumero } from '../../utils/formato.js';

/**
 * Diálogo para buscar un producto y elegir una variante + cantidad,
 * que se agrega al carrito de la venta.
 * onAgregar({ idVariante, descripcion, precioVenta, cantidad, stockTotal })
 */
export default function BuscarProductoDialog({ open, onClose, onAgregar }) {
  const { items, loading, error, setFiltro } = useProductos({ limite: 10 });
  const [texto, setTexto] = useState('');
  const primeraRender = useRef(true);

  const [detalle, setDetalle] = useState(null); // producto con variantes
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [cantidades, setCantidades] = useState({});

  useEffect(() => {
    if (primeraRender.current) { primeraRender.current = false; return; }
    const t = setTimeout(() => setFiltro({ busqueda: texto }), 400);
    return () => clearTimeout(t);
  }, [texto]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset al abrir/cerrar
  useEffect(() => {
    if (!open) { setDetalle(null); setTexto(''); setCantidades({}); }
  }, [open]);

  const abrirProducto = async (idProducto) => {
    setCargandoDetalle(true);
    try {
      const data = await productosApi.obtener(idProducto);
      setDetalle(data);
      setCantidades({});
    } catch {
      /* el error de detalle se ignora; el usuario puede reintentar */
    } finally {
      setCargandoDetalle(false);
    }
  };

  const agregar = (v) => {
    const cantidad = Number(cantidades[v.idVariante] || 1);
    if (cantidad <= 0) return;
    onAgregar({
      idVariante: v.idVariante,
      descripcion: v.descripcion,
      precioVenta: v.precioVenta,
      cantidad,
      stockTotal: v.stockTotal,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {detalle ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton size="small" onClick={() => setDetalle(null)}><ArrowBackIcon /></IconButton>
            <span>{detalle.descripcion}</span>
          </Stack>
        ) : 'Buscar producto'}
      </DialogTitle>
      <DialogContent dividers>
        {/* PASO 1: búsqueda + lista de productos */}
        {!detalle && (
          <>
            <TextField
              autoFocus
              fullWidth
              size="small"
              placeholder="Buscar por nombre o código de barras…"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
              sx={{ mb: 1 }}
            />
            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
            ) : items.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>No hay resultados.</Typography>
            ) : (
              <List dense>
                {items.map((p) => (
                  <ListItemButton key={p.idProducto} onClick={() => abrirProducto(p.idProducto)}>
                    <ListItemText
                      primary={p.descripcion}
                      secondary={`${p.rubro} · ${p.cantidadVariantes} variante(s) · stock ${formatNumero(p.stockTotal)}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </>
        )}

        {/* PASO 2: variantes del producto elegido */}
        {detalle && (
          cargandoDetalle ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <>
              <Divider textAlign="left" sx={{ mb: 1 }}><Typography variant="overline">Elegí variante y cantidad</Typography></Divider>
              <Table size="small">
                <TableBody>
                  {(detalle.variantes ?? []).map((v) => (
                    <TableRow key={v.idVariante}>
                      <TableCell>
                        <Typography variant="body2">{v.descripcion}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip size="small" label={formatMoneda(v.precioVenta)} color={v.precioVenta === 0 ? 'warning' : 'primary'} variant="outlined" />
                          <Chip size="small" label={`Stock: ${formatNumero(v.stockTotal)}`} color={v.stockTotal <= 0 ? 'error' : 'default'} />
                        </Stack>
                      </TableCell>
                      <TableCell align="right" sx={{ width: 110 }}>
                        <TextField
                          type="number"
                          size="small"
                          label="Cant."
                          value={cantidades[v.idVariante] ?? ''}
                          onChange={(e) => setCantidades((c) => ({ ...c, [v.idVariante]: e.target.value }))}
                          inputProps={{ min: 0, step: 'any' }}
                          sx={{ width: 90 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ width: 60 }}>
                        <IconButton color="primary" onClick={() => agregar(v)}>
                          <AddShoppingCartIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
