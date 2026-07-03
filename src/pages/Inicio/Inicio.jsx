import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Paper, Chip, Stack, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import healthApi from '../../api/health.js';

const accesos = [
  { titulo: 'Nueva venta', desc: 'Registrar una venta', path: '/ventas/nueva' },
  { titulo: 'Productos', desc: 'Catálogo y variantes', path: '/productos' },
  { titulo: 'Stock', desc: 'Existencias y alertas', path: '/stock' },
  { titulo: 'Cuenta corriente', desc: 'Deudores y pagos', path: '/cuenta-corriente/deudores' },
];

/** Pantalla de inicio: estado del backend + accesos rápidos. */
export default function Inicio() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState('cargando'); // cargando | ok | error

  useEffect(() => {
    let vivo = true;
    healthApi
      .check()
      .then(() => vivo && setEstado('ok'))
      .catch(() => vivo && setEstado('error'));
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Inicio
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Estado del backend:
        </Typography>
        {estado === 'cargando' && <CircularProgress size={16} />}
        {estado === 'ok' && (
          <Chip icon={<CheckCircleIcon />} label="Conectado" color="success" size="small" />
        )}
        {estado === 'error' && (
          <Chip icon={<ErrorIcon />} label="Sin conexión" color="error" size="small" />
        )}
      </Stack>

      <Grid container spacing={2}>
        {accesos.map((a) => (
          <Grid item xs={12} sm={6} md={3} key={a.path}>
            <Paper
              variant="outlined"
              sx={{ p: 3, height: '100%', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
              onClick={() => navigate(a.path)}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                {a.titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {a.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
