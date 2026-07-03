import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Stack, Chip, Divider, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Alert, Box,
} from '@mui/material';

import cuentaCorrienteApi from '../../api/cuentaCorriente.js';
import { formatMoneda, formatFechaHora } from '../../utils/formato.js';
import { MEDIOS_PAGO } from '../../config/app.js';

const labelMedio = (v) => MEDIOS_PAGO.find((m) => m.valor === v)?.label ?? v;

export default function EstadoCuentaDialog({ open, idCliente, onClose }) {
  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || idCliente == null) return;
    let vivo = true;
    setLoading(true);
    setError(null);
    setEstado(null);
    cuentaCorrienteApi
      .estadoCuenta(idCliente)
      .then((data) => vivo && setEstado(data))
      .catch((err) => vivo && setError(err.mensaje ?? 'No se pudo cargar el estado de cuenta'))
      .finally(() => vivo && setLoading(false));
    return () => { vivo = false; };
  }, [open, idCliente]);

  const cli = estado?.cliente;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{cli ? `Estado de cuenta — ${cli.nombre}` : 'Estado de cuenta'}</DialogTitle>
      <DialogContent dividers>
        {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}
        {error && <Alert severity="error">{error}</Alert>}

        {estado && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`Saldo: ${formatMoneda(cli.saldo)}`} color={cli.saldo > 0 ? 'error' : 'success'} />
              {cli.telefono && <Chip label={cli.telefono} size="small" variant="outlined" />}
              {cli.dniCuit && <Chip label={cli.dniCuit} size="small" variant="outlined" />}
            </Stack>

            <Divider textAlign="left"><Typography variant="overline">Remitos pendientes</Typography></Divider>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Remito</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="right">Pendiente</TableCell>
                  <TableCell align="center">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(estado.remitosPendientes ?? []).length === 0 ? (
                  <TableRow><TableCell colSpan={5} sx={{ color: 'text.secondary' }}>Sin remitos pendientes.</TableCell></TableRow>
                ) : (
                  estado.remitosPendientes.map((r) => (
                    <TableRow key={r.idRemito}>
                      <TableCell>{r.numeroRemito ?? `#${r.idRemito}`}</TableCell>
                      <TableCell>{formatFechaHora(r.fecha)}</TableCell>
                      <TableCell align="right">{formatMoneda(r.montoTotal)}</TableCell>
                      <TableCell align="right">{formatMoneda(r.saldoPendiente)}</TableCell>
                      <TableCell align="center"><Chip size="small" label={r.estado} variant="outlined" /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <Divider textAlign="left"><Typography variant="overline">Pagos recientes</Typography></Divider>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Medio</TableCell>
                  <TableCell align="right">Monto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(estado.pagosRecientes ?? []).length === 0 ? (
                  <TableRow><TableCell colSpan={3} sx={{ color: 'text.secondary' }}>Sin pagos registrados.</TableCell></TableRow>
                ) : (
                  estado.pagosRecientes.map((p) => (
                    <TableRow key={p.idPago}>
                      <TableCell>{formatFechaHora(p.fecha)}</TableCell>
                      <TableCell>{labelMedio(p.medioPago)}</TableCell>
                      <TableCell align="right">{formatMoneda(p.monto)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
