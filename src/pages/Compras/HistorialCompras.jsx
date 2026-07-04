import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Stack, Chip, IconButton, Tooltip,
  TablePagination, CircularProgress, Alert, Button, FormControlLabel, Switch,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';

import useReposiciones from '../../hooks/useReposiciones.js';
import { formatMoneda, formatFechaHora } from '../../utils/formato.js';
import CompraDetalleDialog from './CompraDetalleDialog.jsx';

export default function HistorialCompras() {
  const { items, paginacion, loading, error, params, setFiltro, setPagina, recargar } = useReposiciones();
  const [detalleId, setDetalleId] = useState(null);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }} spacing={1}>
        <Typography variant="h5">Historial de compras</Typography>
        <Button startIcon={<RefreshIcon />} onClick={recargar} disabled={loading}>Actualizar</Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField label="Desde" type="date" size="small" value={params.desde} onChange={(e) => setFiltro({ desde: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField label="Hasta" type="date" size="small" value={params.hasta} onChange={(e) => setFiltro({ hasta: e.target.value })} InputLabelProps={{ shrink: true }} />
          <FormControlLabel control={<Switch checked={params.incluirAnuladas} onChange={(e) => setFiltro({ incluirAnuladas: e.target.checked })} />} label="Incluir anuladas" />
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell>Factura</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No se encontraron compras.</TableCell></TableRow>
              ) : (
                items.map((c) => (
                  <TableRow key={c.idReposicion} hover sx={{ opacity: c.anulada ? 0.55 : 1 }}>
                    <TableCell>{c.idReposicion}</TableCell>
                    <TableCell>{formatFechaHora(c.fecha)}</TableCell>
                    <TableCell>{c.proveedor ?? '-'}</TableCell>
                    <TableCell>{c.numeroFactura ?? '-'}</TableCell>
                    <TableCell align="right">{formatMoneda(c.total)}</TableCell>
                    <TableCell align="center">
                      {c.anulada
                        ? <Chip label="Anulada" size="small" color="error" variant="outlined" />
                        : <Chip label="OK" size="small" color="success" variant="outlined" />}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalle"><IconButton size="small" onClick={() => setDetalleId(c.idReposicion)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={paginacion.total}
          page={Math.max(0, paginacion.pagina - 1)}
          onPageChange={(_, np) => setPagina(np + 1)}
          rowsPerPage={params.limite}
          onRowsPerPageChange={(e) => setFiltro({ limite: parseInt(e.target.value, 10) })}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Por pagina:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      <CompraDetalleDialog
        open={detalleId != null}
        idReposicion={detalleId}
        onClose={() => setDetalleId(null)}
        onAnulada={() => { setDetalleId(null); recargar(); }}
      />
    </Box>
  );
}
