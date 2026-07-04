import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Stack, IconButton, Tooltip, Button, TextField,
  MenuItem, Alert, Snackbar, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FactCheckIcon from '@mui/icons-material/FactCheck';

import BuscarProductoDialog from '../Ventas/BuscarProductoDialog.jsx';
import useUbicaciones from '../../hooks/useUbicaciones.js';
import stockApi from '../../api/stock.js';
import { getIdUsuarioActual } from '../../config/app.js';

export default function Ajustes() {
  const { ubicaciones, loading: cargandoUbic, error: errorUbic } = useUbicaciones();
  const [ubicacion, setUbicacion] = useState('');
  const [items, setItems] = useState([]);
  const [observacion, setObservacion] = useState('');
  const [buscar, setBuscar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState('');

  const agregar = (l) => setItems((prev) => {
    if (prev.some((x) => x.idVariante === l.idVariante)) return prev;
    return [...prev, { idVariante: l.idVariante, descripcion: l.descripcion, cantidadContada: '' }];
  });
  const setContada = (id, v) => setItems((prev) => prev.map((x) => (x.idVariante === id ? { ...x, cantidadContada: v } : x)));
  const quitar = (id) => setItems((prev) => prev.filter((x) => x.idVariante !== id));

  const puede = ubicacion && items.length > 0 && items.every((i) => i.cantidadContada !== '' && Number(i.cantidadContada) >= 0);

  const confirmar = async () => {
    setError(null);
    if (!puede) { setError('Elegí una ubicación y cargá la cantidad contada de cada item.'); return; }
    setGuardando(true);
    try {
      await stockApi.ajustar({
        idUsuario: getIdUsuarioActual(),
        idUbicacion: Number(ubicacion),
        observacion: observacion.trim() || null,
        items: items.map((i) => ({ idVariante: i.idVariante, cantidadContada: Number(i.cantidadContada) })),
      });
      setSnack('Ajuste registrado');
      setItems([]); setObservacion('');
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo registrar el ajuste');
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoUbic) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;
  if (errorUbic || ubicaciones.length === 0) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>Ajustes de stock</Typography>
        <Alert severity="warning">No se pudieron determinar las ubicaciones. Cuando el backend exponga GET /ubicaciones esto sera directo. {errorUbic}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }} spacing={1}>
        <Typography variant="h5">Ajustes de stock</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setBuscar(true)}>Agregar producto</Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Cargá la cantidad real contada; el backend ajusta la existencia a ese valor.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <TextField select label="Ubicación" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} size="small" sx={{ minWidth: 200 }}>
          {ubicaciones.map((u) => <MenuItem key={u.idUbicacion} value={u.idUbicacion}>{u.ubicacion}</MenuItem>)}
        </TextField>
      </Paper>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right" sx={{ width: 150 }}>Cantidad contada</TableCell>
                <TableCell align="center" sx={{ width: 50 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 5, color: 'text.secondary' }}>Agregá productos a ajustar.</TableCell></TableRow>
              ) : items.map((it) => (
                <TableRow key={it.idVariante}>
                  <TableCell>{it.descripcion}</TableCell>
                  <TableCell align="right">
                    <TextField type="number" size="small" value={it.cantidadContada} onChange={(e) => setContada(it.idVariante, e.target.value)} inputProps={{ min: 0, step: 'any' }} sx={{ width: 120 }} />
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
          startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <FactCheckIcon />}>
          Confirmar ajuste
        </Button>
      </Stack>

      <BuscarProductoDialog open={buscar} onClose={() => setBuscar(false)} onAgregar={agregar} />
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
