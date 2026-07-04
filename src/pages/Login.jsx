import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, Stack, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { useAuth } from '../auth/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from ?? '/';

  const [usuarioLogin, setUsuarioLogin] = useState('');
  const [password, setPassword] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await login(usuarioLogin.trim(), password);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 380 }}>
        <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <Inventory2Icon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h5" fontWeight={700}>Gestión Comercial</Typography>
          <Typography variant="body2" color="text.secondary">Iniciá sesión para continuar</Typography>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={enviar}>
          <Stack spacing={2}>
            <TextField
              label="Usuario"
              value={usuarioLogin}
              onChange={(e) => setUsuarioLogin(e.target.value)}
              fullWidth
              autoFocus
              autoComplete="username"
            />
            <TextField
              label="Contraseña"
              type={verPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setVerPass((v) => !v)} edge="end" tabIndex={-1}>
                      {verPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={cargando || !usuarioLogin.trim() || !password}
              startIcon={cargando ? <CircularProgress size={18} color="inherit" /> : null}
            >
              Ingresar
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
