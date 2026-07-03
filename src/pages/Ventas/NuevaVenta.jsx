import { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Stack, IconButton, Tooltip, Button, TextField,
  MenuItem, Divider, Autocomplete, Alert, Snackbar, CircularProgress, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';

import BuscarProductoDialog from './BuscarProductoDialog.jsx';
import ventasApi from '../../api/ventas.js';
import clientesApi from '../../api/clientes.js';
import { formatMoneda } from '../../utils/formato.js';
import { ID_USUARIO_ACTUAL, MEDIOS_PAGO } from '../../config/app.js';

const centavos = (n) => Math.round(Number(n) * 100);

export default function NuevaVenta() {
  const [lineas, setLineas] = useState([]);
  const [buscarAbierto, setBuscarAbierto] = useState(false);
  const [observacion, setObservacion] = useState('');

  // Cliente (autocomplete async)
  const [cliente, setCliente] = useState(null);
  const [opcionesCliente, setOpcionesCliente] = useState([]);
  const [inputCliente, setInputCliente] = useState('');

  // Pagos
  const [pagos, setPagos] = useState([{ medioPago: 'EFECTIVO', monto: '' }]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState('');

  const total = useMemo(
    () => lineas.reduce((acc, l) => acc + l.precioVenta * l.cantidad, 0),
    [lineas],
  );
  const totalPagos = useMemo(
    () => pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0),
    [pagos],
  );
  const hayCuentaCorriente = pagos.some((p) => p.medioPago === 'CUENTA_CORRIENTE' && Number(p.monto || 0) > 0);

  // Buscar clientes cuando se tipea
  useEffect(() => {
    if (inputCliente.trim().length < 1) { setOpcionesCliente([]); return; }
    const t = setTimeout(async () => {
      try {
        const data = await clientesApi.listar({ busqueda: inputCliente.trim(), limite: 10 });
        setOpcionesCliente(data.items ?? []);
      } catch { setOpcionesCliente([]); }
    }, 350);
    return () => clearTimeout(t);
  }, [inputCliente]);

  const agregarLinea = (nueva) => {
    setLineas((prev) => {
      const i = prev.findIndex((l) => l.idVariante === nueva.idVariante);
      if (i >= 0) {
        const copia = [...prev];
        copia[i] = { ...copia[i], cantidad: copia[i].cantidad + nueva.cantidad };
        return copia;
      }
      return [...prev, nueva];
    });
  };

  const setCantidad = (idVariante, cantidad) =>
    setLineas((prev) => prev.map((l) => (l.idVariante === idVariante ? { ...l, cantidad: Number(cantidad) } : l)));

  const quitarLinea = (idVariante) =>
    setLineas((prev) => prev.filter((l) => l.idVariante !== idVariante));

  const setPago = (i, campo, valor) =>
    setPagos((prev) => prev.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p)));
  const agregarPago = () => setPagos((prev) => [...prev, { medioPago: 'EFECTIVO', monto: '' }]);
  const quitarPago = (i) => setPagos((prev) => prev.filter((_, idx) => idx !== i));
  const pagarTotalEfectivo = () => setPagos([{ medioPago: 'EFECTIVO', monto: String(total) }]);

  const puedeConfirmar =
    lineas.length > 0 &&
    centavos(totalPagos) === centavos(total) &&
    total > 0 &&
    (!hayCuentaCorriente || cliente);

  const confirmar = async () => {
    setError(null);
    if (!puedeConfirmar) {
      if (hayCuentaCorriente && !cliente) setError('Para vender en cuenta corriente hay que elegir un cliente.');
      else if (centavos(totalPagos) !== centavos(total)) setError('Los pagos no coinciden con el total.');
      return;
    }
    setGuardando(true);
    try {
      const body = {
        idUsuario: ID_USUARIO_ACTUAL,
        idCliente: cliente?.idCliente ?? null,
        observacion: observacion.trim() || null,
        items: lineas.map((l) => ({ idVariante: l.idVariante, cantidad: l.cantidad })),
        pagos: pagos
          .filter((p) => Number(p.monto || 0) > 0)
          .map((p) => ({ medioPago: p.medioPago, monto: Number(p.monto) })),
      };
      const venta = await ventasApi.crear(body);
      setSnack(`Venta #${venta.idVenta} registrada`);
      // Reset
      setLineas([]);
      setPagos([{ medioPago: 'EFECTIVO', monto: '' }]);
      setObservacion('');
      setCliente(null);
      setInputCliente('');
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo registrar la venta');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }} spacing={1}>
        <Typography variant="h5">Nueva venta</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setBuscarAbierto(true)}>
          Agregar producto
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        {/* Carrito */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right" sx={{ width: 110 }}>Cantidad</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="center" sx={{ width: 50 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineas.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>Agregá productos a la venta.</TableCell></TableRow>
                  ) : (
                    lineas.map((l) => (
                      <TableRow key={l.idVariante}>
                        <TableCell>{l.descripcion}</TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={l.cantidad}
                            onChange={(e) => setCantidad(l.idVariante, e.target.value)}
                            inputProps={{ min: 0, step: 'any' }}
                            sx={{ width: 90 }}
                          />
                        </TableCell>
                        <TableCell align="right">{formatMoneda(l.precioVenta)}</TableCell>
                        <TableCell align="right">{formatMoneda(l.precioVenta * l.cantidad)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Quitar">
                            <IconButton size="small" color="error" onClick={() => quitarLinea(l.idVariante)}><DeleteIcon fontSize="small" /></IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <TextField
            label="Observacion (opcional)"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
        </Grid>

        {/* Panel derecho: cliente + pagos + total */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Autocomplete
              options={opcionesCliente}
              getOptionLabel={(o) => o?.nombre ?? ''}
              isOptionEqualToValue={(a, b) => a.idCliente === b.idCliente}
              value={cliente}
              onChange={(_, v) => setCliente(v)}
              inputValue={inputCliente}
              onInputChange={(_, v) => setInputCliente(v)}
              renderInput={(params) => (
                <TextField {...params} label="Cliente (opcional)" size="small" placeholder="Consumidor final" />
              )}
              noOptionsText="Escribí para buscar…"
            />

            <Divider sx={{ my: 2 }}><Typography variant="overline">Pagos</Typography></Divider>

            <Stack spacing={1}>
              {pagos.map((p, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="center">
                  <TextField
                    select size="small" label="Medio" value={p.medioPago}
                    onChange={(e) => setPago(i, 'medioPago', e.target.value)}
                    sx={{ flex: 1 }}
                  >
                    {MEDIOS_PAGO.map((m) => (
                      <MenuItem key={m.valor} value={m.valor}>{m.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    type="number" size="small" label="Monto" value={p.monto}
                    onChange={(e) => setPago(i, 'monto', e.target.value)}
                    inputProps={{ min: 0, step: '0.01' }}
                    sx={{ width: 110 }}
                  />
                  <IconButton size="small" color="error" onClick={() => quitarPago(i)} disabled={pagos.length === 1}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button size="small" onClick={agregarPago}>+ Pago</Button>
              <Button size="small" onClick={pagarTotalEfectivo} disabled={total <= 0}>Efectivo por el total</Button>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={0.5}>
              <Row label="Total" value={formatMoneda(total)} bold />
              <Row label="Pagos" value={formatMoneda(totalPagos)} />
              <Row
                label="Diferencia"
                value={formatMoneda(totalPagos - total)}
                color={centavos(totalPagos) === centavos(total) ? 'success.main' : 'error.main'}
              />
            </Stack>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <PointOfSaleIcon />}
              onClick={confirmar}
              disabled={!puedeConfirmar || guardando}
              sx={{ mt: 2 }}
            >
              Confirmar venta
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <BuscarProductoDialog
        open={buscarAbierto}
        onClose={() => setBuscarAbierto(false)}
        onAgregar={agregarLinea}
      />

      <Snackbar
        open={!!snack}
        autoHideDuration={3500}
        onClose={() => setSnack('')}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

function Row({ label, value, bold, color }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" fontWeight={bold ? 700 : 400}>{label}</Typography>
      <Typography variant="body2" fontWeight={bold ? 700 : 400} color={color}>{value}</Typography>
    </Stack>
  );
}
