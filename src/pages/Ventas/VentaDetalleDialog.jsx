import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Stack, Chip, Divider, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Alert, Box, TextField,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

import ventasApi from '../../api/ventas.js';
import { formatMoneda, formatNumero, formatFechaHora } from '../../utils/formato.js';
import { ID_USUARIO_ACTUAL, MEDIOS_PAGO } from '../../config/app.js';

const labelMedio = (v) => MEDIOS_PAGO.find((m) => m.valor === v)?.label ?? v;

export default function VentaDetalleDialog({ open, idVenta, onClose, onAnulada }) {
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [anulando, setAnulando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [modoAnular, setModoAnular] = useState(false);

  useEffect(() => {
    if (!open || idVenta == null) return;
    let vivo = true;
    setLoading(true);
    setError(null);
    setVenta(null);
    setModoAnular(false);
    setMotivo('');
    ventasApi
      .obtener(idVenta)
      .then((data) => vivo && setVenta(data))
      .catch((err) => vivo && setError(err.mensaje ?? 'No se pudo cargar la venta'))
      .finally(() => vivo && setLoading(false));
    return () => { vivo = false; };
  }, [open, idVenta]);

  const anular = async () => {
    setAnulando(true);
    setError(null);
    try {
      await ventasApi.anular(idVenta, { idUsuario: ID_USUARIO_ACTUAL, motivo: motivo.trim() || null });
      onAnulada?.();
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo anular la venta');
    } finally {
      setAnulando(false);
    }
  };

  return (
    <Dialog open={open} onClose={anulando ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {venta ? `Venta #${venta.idVenta}` : 'Detalle de venta'}
      </DialogTitle>
      <DialogContent dividers>
        {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {venta && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={formatFechaHora(venta.fecha)} size="small" />
              <Chip label={`Vendedor: ${venta.usuario ?? '—'}`} size="small" variant="outlined" />
              <Chip label={`Cliente: ${venta.cliente ?? 'Consumidor final'}`} size="small" variant="outlined" />
              {venta.anulada && <Chip label="ANULADA" size="small" color="error" />}
            </Stack>

            {venta.anulada && (
              <Alert severity="warning">
                Anulada el {formatFechaHora(venta.fechaAnulacion)}
                {venta.motivoAnulacion ? ` — ${venta.motivoAnulacion}` : ''}
              </Alert>
            )}

            {venta.observacion && (
              <Typography variant="body2" color="text.secondary">Obs.: {venta.observacion}</Typography>
            )}

            <Divider textAlign="left"><Typography variant="overline">Items</Typography></Divider>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(venta.items ?? []).map((it) => (
                  <TableRow key={it.idVariante}>
                    <TableCell>{it.descripcion}</TableCell>
                    <TableCell align="right">{formatNumero(it.cantidad)}</TableCell>
                    <TableCell align="right">{formatMoneda(it.precioUnitario)}</TableCell>
                    <TableCell align="right">{formatMoneda(it.subtotal)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right"><strong>Total</strong></TableCell>
                  <TableCell align="right"><strong>{formatMoneda(venta.total)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Divider textAlign="left"><Typography variant="overline">Pagos</Typography></Divider>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {(venta.pagos ?? []).map((p, i) => (
                <Chip key={i} label={`${labelMedio(p.medioPago)}: ${formatMoneda(p.monto)}`} size="small" />
              ))}
            </Stack>

            {modoAnular && !venta.anulada && (
              <TextField
                label="Motivo de anulación (opcional)"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                fullWidth
                size="small"
                multiline
                rows={2}
              />
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={anulando}>Cerrar</Button>
        {venta && !venta.anulada && !modoAnular && (
          <Button color="error" startIcon={<BlockIcon />} onClick={() => setModoAnular(true)}>
            Anular venta
          </Button>
        )}
        {venta && !venta.anulada && modoAnular && (
          <Button
            variant="contained"
            color="error"
            onClick={anular}
            disabled={anulando}
            startIcon={anulando ? <CircularProgress size={16} color="inherit" /> : <BlockIcon />}
          >
            Confirmar anulación
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
