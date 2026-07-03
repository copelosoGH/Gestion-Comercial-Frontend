import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        404
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        La página que buscás no existe.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
        Volver al inicio
      </Button>
    </Box>
  );
}
