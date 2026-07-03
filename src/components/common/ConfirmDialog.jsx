import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress,
} from '@mui/material';

/**
 * Diálogo de confirmación reutilizable (borrados, acciones irreversibles).
 *
 * Props:
 *  - open, onClose, onConfirm
 *  - titulo, mensaje
 *  - textoConfirmar (default "Confirmar"), color (default "error")
 *  - procesando: muestra spinner y deshabilita
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  titulo = 'Confirmar',
  mensaje = '¿Seguro que querés continuar?',
  textoConfirmar = 'Confirmar',
  color = 'error',
  procesando = false,
}) {
  return (
    <Dialog open={open} onClose={procesando ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <DialogContentText>{mensaje}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={procesando}>Cancelar</Button>
        <Button
          variant="contained"
          color={color}
          onClick={onConfirm}
          disabled={procesando}
          startIcon={procesando ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {textoConfirmar}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
