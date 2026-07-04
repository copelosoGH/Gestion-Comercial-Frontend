import { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Stack, Button, CircularProgress, Alert, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';

import reportesApi from '../../api/reportes.js';
import { formatMoneda, formatNumero } from '../../utils/formato.js';

const money = (v) => formatMoneda(v);
const num = (v) => formatNumero(v);
const pct = (v) => (v == null ? '-' : formatNumero(v) + ' %');

// Definicion de cada reporte: recurso backend, columnas, filtros y fetch.
const REPORTES = [
  {
    clave: 'mas-vendidos', label: 'Mas vendidos', archivo: 'mas-vendidos.xlsx',
    filtros: ['fechas'],
    columnas: [
      { t: 'Producto', k: 'producto' },
      { t: 'Variante', k: 'descripcion' },
      { t: 'Rubro', k: 'rubro' },
      { t: 'Cant. vendida', k: 'cantidadVendida', a: 'right', f: num },
      { t: 'Monto vendido', k: 'montoVendido', a: 'right', f: money },
    ],
    fetch: (p) => reportesApi.masVendidos(p),
  },
  {
    clave: 'margenes', label: 'Margenes', archivo: 'margenes.xlsx',
    filtros: ['busqueda'],
    columnas: [
      { t: 'Producto', k: 'producto' },
      { t: 'Variante', k: 'descripcion' },
      { t: 'Rubro', k: 'rubro' },
      { t: 'Costo', k: 'precioCosto', a: 'right', f: money },
      { t: 'Precio venta', k: 'precioVenta', a: 'right', f: money },
      { t: 'Ganancia', k: 'gananciaUnitaria', a: 'right', f: money },
      { t: 'Margen', k: 'margenPorcentaje', a: 'right', f: pct },
    ],
    fetch: (p) => reportesApi.margenes(p),
  },
  {
    clave: 'stock', label: 'Stock', archivo: 'stock.xlsx',
    filtros: ['busqueda'],
    columnas: [
      { t: 'Codigo', k: 'codigoBarras' },
      { t: 'Producto', k: 'producto' },
      { t: 'Variante', k: 'descripcion' },
      { t: 'Rubro', k: 'rubro' },
      { t: 'Local', k: 'stockLocal', a: 'right', f: num },
      { t: 'Deposito', k: 'stockDeposito', a: 'right', f: num },
      { t: 'Total', k: 'stockTotal', a: 'right', f: num },
      { t: 'Costo', k: 'precioCosto', a: 'right', f: money },
      { t: 'Valor stock', k: 'valorStock', a: 'right', f: money },
    ],
    fetch: (p) => reportesApi.stock(p),
  },
  {
    clave: 'reposicion', label: 'Reposicion', archivo: 'reposicion.xlsx',
    filtros: [],
    columnas: [
      { t: 'Producto', k: 'producto' },
      { t: 'Variante', k: 'descripcion' },
      { t: 'Stock total', k: 'stockTotal', a: 'right', f: num },
      { t: 'Minimo', k: 'stockMinimoTotal', a: 'right', f: num },
    ],
    fetch: (p) => reportesApi.reposicion(p),
  },
];

export default function Reportes() {
  const [tab, setTab] = useState(0);
  const rep = REPORTES[tab];

  const [busqueda, setBusqueda] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportando, setExportando] = useState(false);

  const paramsActuales = useCallback(() => {
    const p = {};
    if (rep.filtros.includes('busqueda') && busqueda.trim()) p.busqueda = busqueda.trim();
    if (rep.filtros.includes('fechas')) {
      if (desde) p.desde = desde;
      if (hasta) p.hasta = hasta;
    }
    return p;
  }, [rep, busqueda, desde, hasta]);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await rep.fetch(paramsActuales()));
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo cargar el reporte');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [rep, paramsActuales]);

  // Recargar al cambiar de tab. (Los filtros se aplican con el boton Buscar.)
  useEffect(() => {
    setBusqueda(''); setDesde(''); setHasta('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => { cargar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tab]);

  const exportar = async () => {
    setExportando(true);
    setError(null);
    try {
      await reportesApi.descargarExcel(rep.clave, paramsActuales(), rep.archivo);
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo exportar');
    } finally {
      setExportando(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Reportes</Typography>

      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          {REPORTES.map((r) => <Tab key={r.clave} label={r.label} />)}
        </Tabs>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2 }} alignItems={{ md: 'center' }}>
          {rep.filtros.includes('busqueda') && (
            <TextField
              size="small" placeholder="Buscar..." value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && cargar()}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
              sx={{ minWidth: 240 }}
            />
          )}
          {rep.filtros.includes('fechas') && (
            <>
              <TextField size="small" label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField size="small" label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} InputLabelProps={{ shrink: true }} />
            </>
          )}
          {rep.filtros.length > 0 && (
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={cargar} disabled={loading}>Buscar</Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" startIcon={exportando ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />} onClick={exportar} disabled={exportando || loading}>
            Exportar Excel
          </Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined">
        <TableContainer sx={{ maxHeight: '65vh' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {rep.columnas.map((c) => <TableCell key={c.k} align={c.a ?? 'left'}>{c.t}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={rep.columnas.length} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={rep.columnas.length} align="center" sx={{ py: 6, color: 'text.secondary' }}>Sin datos para este reporte.</TableCell></TableRow>
              ) : (
                rows.map((row, i) => (
                  <TableRow key={row.idVariante ?? i} hover>
                    {rep.columnas.map((c) => (
                      <TableCell key={c.k} align={c.a ?? 'left'}>
                        {c.f ? c.f(row[c.k]) : (row[c.k] ?? '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {!loading && rows.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {rows.length} fila(s)
        </Typography>
      )}
    </Box>
  );
}
