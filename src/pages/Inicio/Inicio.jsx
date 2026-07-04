import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Chip, Stack, CircularProgress, Divider, Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';

import healthApi from '../../api/health.js';
import ventasApi from '../../api/ventas.js';
import cuentaCorrienteApi from '../../api/cuentaCorriente.js';
import stockApi from '../../api/stock.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { formatMoneda, formatNumero } from '../../utils/formato.js';

function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function Metrica({ icon, titulo, valor, sub, color, onClick }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%', cursor: onClick ? 'pointer' : 'default', '&:hover': onClick ? { borderColor: 'primary.main' } : {} }} onClick={onClick}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ color: color ?? 'primary.main', display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant="body2" color="text.secondary">{titulo}</Typography>
          <Typography variant="h6" fontWeight={700}>{valor}</Typography>
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
      </Stack>
    </Paper>
  );
}

export default function Inicio() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [estado, setEstado] = useState('cargando');
  const [ventasHoy, setVentasHoy] = useState(null);
  const [deudores, setDeudores] = useState(null);
  const [alertas, setAlertas] = useState(null);

  useEffect(() => {
    let vivo = true;
    healthApi.check().then(() => vivo && setEstado('ok')).catch(() => vivo && setEstado('error'));

    const hoy = hoyISO();
    ventasApi.listar({ desde: hoy, hasta: hoy, limite: 100 })
      .then((d) => vivo && setVentasHoy({
        cantidad: d.paginacion?.total ?? (d.items?.length ?? 0),
        total: (d.items ?? []).reduce((a, v) => a + (v.anulada ? 0 : Number(v.total || 0)), 0),
      }))
      .catch(() => vivo && setVentasHoy({ error: true }));

    cuentaCorrienteApi.deudores()
      .then((data) => {
        const items = Array.isArray(data) ? data : (data.items ?? []);
        vivo && setDeudores({ cantidad: items.length, total: items.reduce((a, c) => a + Number(c.saldo || 0), 0) });
      })
      .catch(() => vivo && setDeudores({ error: true }));

    stockApi.alertas()
      .then((r) => vivo && setAlertas({ reposicion: (r.reposicion ?? []).length, gondola: (r.gondola ?? []).length }))
      .catch(() => vivo && setAlertas({ error: true }));

    return () => { vivo = false; };
  }, []);

  const val = (obj, fn) => {
    if (obj == null) return <CircularProgress size={18} />;
    if (obj.error) return '—';
    return fn(obj);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
        <Typography variant="h5">Hola{usuario?.nombre ? ', ' + usuario.nombre.split(' ')[0] : ''}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">Backend:</Typography>
          {estado === 'cargando' && <CircularProgress size={16} />}
          {estado === 'ok' && <Chip icon={<CheckCircleIcon />} label="Conectado" color="success" size="small" />}
          {estado === 'error' && <Chip icon={<ErrorIcon />} label="Sin conexion" color="error" size="small" />}
        </Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Resumen de hoy</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Metrica
            icon={<PointOfSaleIcon fontSize="large" />}
            titulo="Ventas de hoy"
            valor={val(ventasHoy, (v) => formatMoneda(v.total))}
            sub={val(ventasHoy, (v) => `${formatNumero(v.cantidad)} venta(s)`)}
            onClick={() => navigate('/ventas')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Metrica
            icon={<AccountBalanceWalletIcon fontSize="large" />}
            titulo="Deuda en cuenta corriente"
            valor={val(deudores, (d) => formatMoneda(d.total))}
            sub={val(deudores, (d) => `${formatNumero(d.cantidad)} deudor(es)`)}
            color="error.main"
            onClick={() => navigate('/cuenta-corriente/deudores')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Metrica
            icon={<WarningAmberIcon fontSize="large" />}
            titulo="Alertas de stock"
            valor={val(alertas, (a) => formatNumero(a.reposicion))}
            sub={val(alertas, (a) => `por reponer · ${formatNumero(a.gondola)} en gondola`)}
            color="warning.main"
            onClick={() => navigate('/stock/alertas')}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Accesos rapidos</Typography>
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/ventas/nueva')}>Nueva venta</Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/compras/nueva')}>Nueva compra</Button>
        <Button variant="outlined" onClick={() => navigate('/productos')}>Productos</Button>
        <Button variant="outlined" onClick={() => navigate('/reportes')}>Reportes</Button>
      </Stack>
    </Box>
  );
}
