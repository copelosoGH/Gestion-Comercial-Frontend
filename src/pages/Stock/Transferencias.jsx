import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Stack, IconButton, Tooltip, Button, TextField,
  MenuItem, Alert, Snackbar, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import BuscarProductoDialog from '../Ventas/BuscarProductoDialog.jsx';
import useUbicaciones from '../../hooks/useUbicaciones.js';
import stockApi from '../../api/stock.js';
import { formatNumero } from '../../utils/formato.js';
import { ID_USUARIO_ACTUAL } from '../../config/app.js';

export default function Transferencias() {
  const { ubicaciones, loading: cargandoUbic, error: errorUbic } = useUbicaciones();
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [items, setItems] = useState([]);
  const [observacion, setObservacion] = useState('');
  const [buscar, setBuscar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState('');

  const agregar = (l) => setItems((prev) => {
    const i = prev.findIndex((x) => x.idVariante === l.idVariante);
    if (i >= 0) { const c = [...prev]; c[i] = { ...c[i], cantidad: c[i].cantidad + l.cantidad }; return c; }
    return [...prev, { idVariante: l.idVariante, descripcion: l.descripcion, cantidad: l.cantidad }];
  });
  const setCantidad = (id, v) => setItems((prev) => prev.map((x) => (x.idVariante === id ? { ...x, cantidad: Number(v) } : x)));
  const quitar = (id) => setItems((prev) => prev.filter((x) => x.idVariante !== id));

  const puede = origen && destino && origen !== destino && items.length > 0 && items.every((i) => i.cantidad > 0);

  const confirmar = async () => {
    setError(null);
    if (!puede) { setError('Elegí origen y destino distintos y al menos un item con cantidad.'); return; }
    setGuardando(true);
    try {
      await stockApi.transferir({
        idUsuario: ID_USUARIO_ACTUAL,
        idUbicacionOrigen: Number(origen),
        idUbicacionDestino: Number(destino),
        observacion: observacion.trim() || null,
        items: items.map((i) => ({ idVariante: i.idVariante, cantidad: i.cantidad })),
      });
      setSnack('Transferencia registrada');
      setItems([]); setObservacion('');
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo registrar la transferencia');
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoUbic) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;
  if (errorUbic || ubicaciones.length < 2) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>Transferencias de stock</Typography>
        <Alert severity="warning">
          No se pudieron determinar las ubicaciones (se necesitan al menos dos, ej. Local y Deposito).
          Cuando el backend exponga GET /ubicaciones esto sera directo. {errorUbic}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }} spacing={1}>
        <Typography variant="h5">Transferencias de stock</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setBuscar(true)}>Agregar producto</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField select label="Origen" value={origen} onChange={(e) => setOrigen(e.target.value)} size="small" sx={{ minWidth: 180 }}>
            {ubicaciones.map((u) => <MenuItem key={u.idUbicacion} value={u.idUbicacion}>{u.ubicacion}</MenuItem>)}
          </TextField>
          <SwapHorizIcon color="action" />
          <TextField select label="Destino" value={destino} onChange={(e) => setDestino(e.target.value)} size="small" sx={{ minWidth: 180 }}>
            {ubicaciones.map((u) => <MenuItem key={u.idUbicacion} value={u.idUbicacion} disabled={String(u.idUbicacion) === String(origen)}>{u.ubicacion}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right" sx={{ width: 120 }}>Cantidad</TableCell>
                <TableCell align="center" sx={{ width: 50 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 5, color: 'text.secondary' }}>Agregá productos a transferir.</TableCell></TableRow>
              ) : items.map((it) => (
                <TableRow key={it.idVariante}>
                  <TableCell>{it.descripcion}</TableCell>
                  <TableCell align="right">
                    <TextField type="number" size="small" value={it.cantidad} onChange={(e) => setCantidad(it.idVariante, e.target.value)} inputProps={{ min: 0, step: 'any' }} sx={{ width: 100 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Quitar"><IconButton size="small" color="error" onClick={() => quitar(it.idVariante)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <TextField label="Observacion (opcional)" value={observacion} onChange={(e) => setObservacion(e.target.value)} fullWidth size="small" multiline rows={2} sx={{ mt: 2 }} />

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="contained" size="large" onClick={confirmar} disabled={!puede || guardando}
          startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <SwapHorizIcon />}>
          Confirmar transferencia
        </Button>
      </Stack>

      <BuscarProductoDialog open={buscar} onClose={() => setBuscar(false)} onAgregar={agregar} />
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
