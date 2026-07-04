import { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Stack, IconButton, Tooltip, Button, TextField,
  MenuItem, Autocomplete, Alert, Snackbar, CircularProgress, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import BuscarProductoDialog from '../Ventas/BuscarProductoDialog.jsx';
import useUbicaciones from '../../hooks/useUbicaciones.js';
import reposicionesApi from '../../api/reposiciones.js';
import proveedoresApi from '../../api/proveedores.js';
import { formatMoneda } from '../../utils/formato.js';
import { getIdUsuarioActual } from '../../config/app.js';

const subtotalLinea = (l) => Number(l.cantidadCajas || 0) * Number(l.unidadesPorCaja || 0) * Number(l.costoUnitario || 0);

export default function NuevaCompra() {
  const { ubicaciones } = useUbicaciones();
  const [proveedor, setProveedor] = useState(null);
  const [opcionesProv, setOpcionesProv] = useState([]);
  const [inputProv, setInputProv] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [numeroFactura, setNumeroFactura] = useState('');
  const [fecha, setFecha] = useState('');
  const [observacion, setObservacion] = useState('');
  const [items, setItems] = useState([]);
  const [buscar, setBuscar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    if (inputProv.trim().length < 1) { setOpcionesProv([]); return; }
    const t = setTimeout(async () => {
      try {
        const data = await proveedoresApi.listar({ busqueda: inputProv.trim(), limite: 10 });
        setOpcionesProv(data.items ?? []);
      } catch { setOpcionesProv([]); }
    }, 350);
    return () => clearTimeout(t);
  }, [inputProv]);

  const agregar = (l) => setItems((prev) => {
    if (prev.some((x) => x.idVariante === l.idVariante)) return prev;
    return [...prev, {
      idVariante: l.idVariante,
      descripcion: l.descripcion,
      cantidadCajas: 1,
      unidadesPorCaja: l.unidadesPorCaja || 1,
      costoUnitario: l.precioCosto ?? '',
    }];
  });
  const setCampo = (id, campo, v) => setItems((prev) => prev.map((x) => (x.idVariante === id ? { ...x, [campo]: v } : x)));
  const quitar = (id) => setItems((prev) => prev.filter((x) => x.idVariante !== id));

  const total = useMemo(() => items.reduce((acc, l) => acc + subtotalLinea(l), 0), [items]);

  const puede = proveedor && items.length > 0 && items.every(
    (i) => Number(i.cantidadCajas) > 0 && Number.isInteger(Number(i.unidadesPorCaja)) && Number(i.unidadesPorCaja) >= 1 && Number(i.costoUnitario) >= 0 && i.costoUnitario !== '',
  );

  const confirmar = async () => {
    setError(null);
    if (!puede) { setError('Elegí proveedor y completá cajas, unidades por caja y costo de cada item.'); return; }
    setGuardando(true);
    try {
      const compra = await reposicionesApi.crear({
        idUsuario: getIdUsuarioActual(),
        idProveedor: proveedor.idProveedor,
        idUbicacion: ubicacion ? Number(ubicacion) : null,
        numeroFactura: numeroFactura.trim() || null,
        fecha: fecha || null,
        observacion: observacion.trim() || null,
        items: items.map((i) => ({
          idVariante: i.idVariante,
          cantidadCajas: Number(i.cantidadCajas),
          unidadesPorCaja: parseInt(i.unidadesPorCaja, 10),
          costoUnitario: Number(i.costoUnitario),
        })),
      });
      setSnack(`Compra #${compra.idReposicion ?? ''} registrada`);
      setItems([]); setNumeroFactura(''); setFecha(''); setObservacion('');
      setProveedor(null); setInputProv(''); setUbicacion('');
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo registrar la compra');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }} spacing={1}>
        <Typography variant="h5">Nueva compra (ingreso de mercadería)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setBuscar(true)}>Agregar producto</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={opcionesProv}
              getOptionLabel={(o) => o?.nombre ?? ''}
              isOptionEqualToValue={(a, b) => a.idProveedor === b.idProveedor}
              value={proveedor}
              onChange={(_, v) => setProveedor(v)}
              inputValue={inputProv}
              onInputChange={(_, v) => setInputProv(v)}
              renderInput={(params) => <TextField {...params} label="Proveedor" size="small" required />}
              noOptionsText="Escribí para buscar…"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField select fullWidth size="small" label="Ubicación (opcional)" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}>
              <MenuItem value="">(Por defecto)</MenuItem>
              {ubicaciones.map((u) => <MenuItem key={u.idUbicacion} value={u.idUbicacion}>{u.ubicacion}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth size="small" label="N° factura (opcional)" value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth size="small" label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right" sx={{ width: 100 }}>Cajas</TableCell>
                <TableCell align="right" sx={{ width: 110 }}>U./caja</TableCell>
                <TableCell align="right" sx={{ width: 130 }}>Costo unit.</TableCell>
                <TableCell align="right">Subtotal</TableCell>
                <TableCell align="center" sx={{ width: 50 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>Agregá productos a la compra.</TableCell></TableRow>
              ) : items.map((it) => (
                <TableRow key={it.idVariante}>
                  <TableCell>{it.descripcion}</TableCell>
                  <TableCell align="right">
                    <TextField type="number" size="small" value={it.cantidadCajas} onChange={(e) => setCampo(it.idVariante, 'cantidadCajas', e.target.value)} inputProps={{ min: 0, step: 'any' }} sx={{ width: 85 }} />
                  </TableCell>
                  <TableCell align="right">
                    <TextField type="number" size="small" value={it.unidadesPorCaja} onChange={(e) => setCampo(it.idVariante, 'unidadesPorCaja', e.target.value)} inputProps={{ min: 1, step: 1 }} sx={{ width: 90 }} />
                  </TableCell>
                  <TableCell align="right">
                    <TextField type="number" size="small" value={it.costoUnitario} onChange={(e) => setCampo(it.idVariante, 'costoUnitario', e.target.value)} inputProps={{ min: 0, step: '0.01' }} sx={{ width: 110 }} />
                  </TableCell>
                  <TableCell align="right">{formatMoneda(subtotalLinea(it))}</TableCell>
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

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <Typography variant="h6">Total: {formatMoneda(total)}</Typography>
        <Button variant="contained" size="large" onClick={confirmar} disabled={!puede || guardando}
          startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <LocalShippingIcon />}>
          Confirmar compra
        </Button>
      </Stack>

      <BuscarProductoDialog open={buscar} onClose={() => setBuscar(false)} onAgregar={agregar} />
      <Snackbar open={!!snack} autoHideDuration={3500} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
