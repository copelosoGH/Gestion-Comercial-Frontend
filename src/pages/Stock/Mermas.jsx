import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Stack, IconButton, Tooltip, Button, TextField,
  MenuItem, Alert, Snackbar, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

import BuscarProductoDialog from '../Ventas/BuscarProductoDialog.jsx';
import useUbicaciones from '../../hooks/useUbicaciones.js';
import stockApi from '../../api/stock.js';
import { ID_USUARIO_ACTUAL } from '../../config/app.js';

const TIPOS = [
  { valor: 'ROTURA', label: 'Rotura' },
  { valor: 'PERDIDA', label: 'Perdida' },
  { valor: 'CONSUMO_INTERNO', label: 'Consumo interno' },
];

export default function Mermas() {
  const { ubicaciones, loading: cargandoUbic, error: errorUbic } = useUbicaciones();
  const [ubicacion, setUbicacion] = useState('');
  const [tipo, setTipo] = useState('ROTURA');
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

  const puede = ubicacion && tipo && items.length > 0 && items.every((i) => i.cantidad > 0);

  const confirmar = async () => {
    setError(null);
    if (!puede) { setError('Elegí ubicación, tipo y al menos un item con cantidad.'); return; }
    setGuardando(true);
    try {
      await stockApi.registrarMerma({
        idUsuario: ID_USUARIO_ACTUAL,
        idUbicacion: Number(ubicacion),
        tipo,
        observacion: observacion.trim() || null,
        items: items.map((i) => ({ idVariante: i.idVariante, cantidad: i.cantidad })),
      });
      setSnack('Merma registrada');
      setItems([]); setObservacion('');
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo registrar la merma');
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoUbic) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;
  if (errorUbic || ubicaciones.length === 0) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>Mermas</Typography>
        <Alert severity="warning">No se pudieron determinar las ubicaciones. Cuando el backend exponga GET /ubicaciones esto sera directo. {errorUbic}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }} spacing={1}>
        <Typography variant="h5">Mermas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setBuscar(true)}>Agregar producto</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select label="Ubicación" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} size="small" sx={{ minWidth: 180 }}>
            {ubicaciones.map((u) => <MenuItem key={u.idUbicacion} value={u.idUbicacion}>{u.ubicacion}</MenuItem>)}
          </TextField>
          <TextField select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} size="small" sx={{ minWidth: 180 }}>
            {TIPOS.map((t) => <MenuItem key={t.valor} value={t.valor}>{t.label}</MenuItem>)}
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
                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 5, color: 'text.secondary' }}>Agregá productos con merma.</TableCell></TableRow>
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
        <Button variant="contained" color="error" size="large" onClick={confirmar} disabled={!puede || guardando}
          startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <ReportProblemIcon />}>
          Registrar merma
        </Button>
      </Stack>

      <BuscarProductoDialog open={buscar} onClose={() => setBuscar(false)} onAgregar={agregar} />
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
