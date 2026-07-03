import { Box, Typography, Paper, Chip, Stack } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

/**
 * Página placeholder reutilizable para el scaffold.
 * Cada pantalla real irá reemplazando su placeholder por el contenido definitivo.
 *
 * Props:
 *  - title: título de la pantalla
 *  - endpoint: string opcional con el endpoint del backend que consumirá
 *  - descripcion: texto opcional
 */
export default function PlaceholderPage({ title, endpoint, descripcion }) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      <Paper variant="outlined" sx={{ p: 4, mt: 2 }}>
        <Stack spacing={2} alignItems="flex-start">
          <ConstructionIcon color="disabled" sx={{ fontSize: 48 }} />
          <Typography color="text.secondary">
            {descripcion ?? 'Pantalla en construcción. Este es el andamiaje: acá irá el contenido real.'}
          </Typography>
          {endpoint && (
            <Chip
              label={`API: ${endpoint}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontFamily: 'monospace' }}
            />
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
