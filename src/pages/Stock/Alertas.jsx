import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, Tab, Chip, CircularProgress, Alert, Button, Stack,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import stockApi from '../../api/stock.js';
import { formatNumero } from '../../utils/formato.js';

export default function Alertas() {
  const [data, setData] = useState({ reposicion: [], gondola: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);

  const cargar = () => {
    setLoading(true);
    setError(null);
    stockApi
      .alertas()
      .then((res) => setData({ reposicion: res.reposicion ?? [], gondola: res.gondola ?? [] }))
      .catch((err) => setError(err.mensaje ?? 'No se pudieron cargar las alertas'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Alertas de stock</Typography>
        <Button startIcon={<RefreshIcon />} onClick={cargar} disabled={loading}>Actualizar</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={'Reposicion (' + data.reposicion.length + ')'} />
          <Tab label={'Gondola (' + data.gondola.length + ')'} />
        </Tabs>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
        ) : tab === 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>Variante</TableCell>
                  <TableCell align="right">Stock total</TableCell>
                  <TableCell align="right">Minimo</TableCell>
                  <TableCell align="center">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.reposicion.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>No hay productos por reponer.</TableCell></TableRow>
                ) : (
                  data.reposicion.map((r) => (
                    <TableRow key={r.idVariante} hover>
                      <TableCell>{r.producto}</TableCell>
                      <TableCell>{r.descripcion}</TableCell>
                      <TableCell align="right">{formatNumero(r.stockTotal)}</TableCell>
                      <TableCell align="right">{formatNumero(r.stockMinimoTotal)}</TableCell>
                      <TableCell align="center">
                        <Chip icon={<WarningAmberIcon />} size="small" color={r.stockTotal <= 0 ? 'error' : 'warning'}
                          label={r.stockTotal <= 0 ? 'Sin stock' : 'Bajo minimo'} variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>Variante</TableCell>
                  <TableCell align="right">Stock local</TableCell>
                  <TableCell align="right">Minimo local</TableCell>
                  <TableCell align="right">En deposito</TableCell>
                  <TableCell align="center">Accion sugerida</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.gondola.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>No hay alertas de gondola.</TableCell></TableRow>
                ) : (
                  data.gondola.map((g) => (
                    <TableRow key={g.idVariante} hover>
                      <TableCell>{g.producto}</TableCell>
                      <TableCell>{g.descripcion}</TableCell>
                      <TableCell align="right">{formatNumero(g.stockLocal)}</TableCell>
                      <TableCell align="right">{formatNumero(g.minimoLocal)}</TableCell>
                      <TableCell align="right">{formatNumero(g.stockDeposito)}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" color={g.stockDeposito > 0 ? 'info' : 'default'} variant="outlined"
                          label={g.stockDeposito > 0 ? 'Mover a gondola' : 'Reponer'} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Reposicion: variantes con stock total en o por debajo del minimo. Gondola: stock del local por debajo de su minimo (revisar si hay en deposito para mover).
      </Typography>
    </Box>
  );
}
