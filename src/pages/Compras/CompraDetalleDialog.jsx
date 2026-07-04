import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Stack, Chip, Divider, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Alert, Box, TextField,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

import reposicionesApi from '../../api/reposiciones.js';
import { formatMoneda, formatNumero, formatFechaHora } from '../../utils/formato.js';
import { getIdUsuarioActual } from '../../config/app.js';

export default function CompraDetalleDialog({ open, idReposicion, onClose, onAnulada }) {
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [anulando, setAnulando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [modoAnular, setModoAnular] = useState(false);

  useEffect(() => {
    if (!open || idReposicion == null) return;
    let vivo = true;
    setLoading(true); setError(null); setCompra(null); setModoAnular(false); setMotivo('');
    reposicionesApi
      .obtener(idReposicion)
      .then((data) => vivo && setCompra(data))
      .catch((err) => vivo && setError(err.mensaje ?? 'No se pudo cargar la compra'))
      .finally(() => vivo && setLoading(false));
    return () => { vivo = false; };
  }, [open, idReposicion]);

  const anular = async () => {
    setAnulando(true); setError(null);
    try {
      await reposicionesApi.anular(idReposicion, { idUsuario: getIdUsuarioActual(), motivo: motivo.trim() || null });
      onAnulada?.();
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo anular la compra');
    } finally {
      setAnulando(false);
    }
  };

  return (
    <Dialog open={open} onClose={anulando ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>{compra ? `Compra #${compra.idReposicion}` : 'Detalle de compra'}</DialogTitle>
      <DialogContent dividers>
        {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {compra && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={formatFechaHora(compra.fecha)} size="small" />
              <Chip label={`Proveedor: ${compra.proveedor ?? '—'}`} size="small" variant="outlined" />
              {compra.ubicacion && <Chip label={`Ubicación: ${compra.ubicacion}`} size="small" variant="outlined" />}
              {compra.numeroFactura && <Chip label={`Factura: ${compra.numeroFactura}`} size="small" variant="outlined" />}
              {compra.anulada && <Chip label="ANULADA" size="small" color="error" />}
            </Stack>

            {compra.anulada && (
              <Alert severity="warning">
                Anulada el {formatFechaHora(compra.fechaAnulacion)}
                {compra.motivoAnulacion ? ` — ${compra.motivoAnulacion}` : ''}
              </Alert>
            )}

            {compra.observacion && <Typography variant="body2" color="text.secondary">Obs.: {compra.observacion}</Typography>}

            <Divider textAlign="left"><Typography variant="overline">Items</Typography></Divider>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Variante</TableCell>
                  <TableCell align="right">Cajas</TableCell>
                  <TableCell align="right">U./caja</TableCell>
                  <TableCell align="right">Unidades</TableCell>
                  <TableCell align="right">Costo unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(compra.items ?? []).map((it) => (
                  <TableRow key={it.idVariante}>
                    <TableCell>{it.descripcion}</TableCell>
                    <TableCell align="right">{formatNumero(it.cantidadCajas)}</TableCell>
                    <TableCell align="right">{formatNumero(it.unidadesPorCaja)}</TableCell>
                    <TableCell align="right">{formatNumero(it.cantidadTotalUnidades)}</TableCell>
                    <TableCell align="right">{formatMoneda(it.costoUnitario)}</TableCell>
                    <TableCell align="right">{formatMoneda(it.subtotal)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} align="right"><strong>Total</strong></TableCell>
                  <TableCell align="right"><strong>{formatMoneda(compra.total)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {modoAnular && !compra.anulada && (
              <TextField label="Motivo de anulación (opcional)" value={motivo} onChange={(e) => setMotivo(e.target.value)} fullWidth size="small" multiline rows={2} />
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={anulando}>Cerrar</Button>
        {compra && !compra.anulada && !modoAnular && (
          <Button color="error" startIcon={<BlockIcon />} onClick={() => setModoAnular(true)}>Anular compra</Button>
        )}
        {compra && !compra.anulada && modoAnular && (
          <Button variant="contained" color="error" onClick={anular} disabled={anulando}
            startIcon={anulando ? <CircularProgress size={16} color="inherit" /> : <BlockIcon />}>
            Confirmar anulación
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
