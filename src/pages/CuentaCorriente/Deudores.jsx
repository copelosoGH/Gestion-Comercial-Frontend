import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Stack, IconButton, Tooltip, CircularProgress, Alert,
  Button, Snackbar, Chip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentsIcon from '@mui/icons-material/Payments';

import cuentaCorrienteApi from '../../api/cuentaCorriente.js';
import { formatMoneda } from '../../utils/formato.js';
import EstadoCuentaDialog from './EstadoCuentaDialog.jsx';
import PagoDialog from './PagoDialog.jsx';

export default function Deudores() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estadoId, setEstadoId] = useState(null);
  const [pagoCliente, setPagoCliente] = useState(null);
  const [snack, setSnack] = useState('');

  const cargar = () => {
    setLoading(true);
    setError(null);
    cuentaCorrienteApi
      .deudores()
      .then((data) => setItems(Array.isArray(data) ? data : (data.items ?? [])))
      .catch((err) => setError(err.mensaje ?? 'No se pudieron cargar los deudores'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const totalDeuda = items.reduce((acc, c) => acc + Number(c.saldo || 0), 0);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Deudores</Typography>
        <Button startIcon={<RefreshIcon />} onClick={cargar} disabled={loading}>Actualizar</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Telefono</TableCell>
                <TableCell align="right">Saldo</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>No hay clientes con deuda.</TableCell></TableRow>
              ) : (
                items.map((c) => (
                  <TableRow key={c.idCliente} hover>
                    <TableCell>{c.idCliente}</TableCell>
                    <TableCell>{c.nombre}</TableCell>
                    <TableCell>{c.telefono ?? '-'}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="error.main" fontWeight={700}>{formatMoneda(c.saldo)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Estado de cuenta">
                        <IconButton size="small" onClick={() => setEstadoId(c.idCliente)}><VisibilityIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Registrar pago">
                        <IconButton size="small" color="primary" onClick={() => setPagoCliente(c)}><PaymentsIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {items.length > 0 && (
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Chip color="error" variant="outlined" label={'Deuda total: ' + formatMoneda(totalDeuda)} />
        </Stack>
      )}

      <EstadoCuentaDialog open={estadoId != null} idCliente={estadoId} onClose={() => setEstadoId(null)} />

      <PagoDialog
        open={pagoCliente != null}
        clientePreset={pagoCliente}
        onClose={() => setPagoCliente(null)}
        onGuardado={(msg) => { setPagoCliente(null); setSnack(msg); cargar(); }}
      />

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
