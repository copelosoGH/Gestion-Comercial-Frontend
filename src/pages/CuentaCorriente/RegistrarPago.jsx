import { useState } from 'react';
import { Box, Typography, Paper, Button, Stack, Snackbar } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';

import PagoDialog from './PagoDialog.jsx';

export default function RegistrarPago() {
  const [abierto, setAbierto] = useState(false);
  const [snack, setSnack] = useState('');

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Registrar pago</Typography>
      <Paper variant="outlined" sx={{ p: 4, mt: 2 }}>
        <Stack spacing={2} alignItems="flex-start">
          <Typography color="text.secondary">
            Registra un cobro de cuenta corriente. El backend lo aplica a los remitos pendientes en orden FIFO (los mas antiguos primero).
          </Typography>
          <Button variant="contained" size="large" startIcon={<PaymentsIcon />} onClick={() => setAbierto(true)}>
            Nuevo pago
          </Button>
        </Stack>
      </Paper>

      <PagoDialog
        open={abierto}
        onClose={() => setAbierto(false)}
        onGuardado={(msg) => { setAbierto(false); setSnack(msg); }}
      />

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
