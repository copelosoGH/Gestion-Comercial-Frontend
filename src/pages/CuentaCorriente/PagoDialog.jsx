import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Autocomplete, Alert, CircularProgress, Stack, Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import cuentaCorrienteApi from '../../api/cuentaCorriente.js';
import clientesApi from '../../api/clientes.js';
import { getIdUsuarioActual, MEDIOS_PAGO } from '../../config/app.js';
import { formatMoneda } from '../../utils/formato.js';

// Medios validos para un cobro real (cuenta corriente NO es medio de cobro).
const MEDIOS_COBRO = MEDIOS_PAGO.filter((m) => m.valor !== 'CUENTA_CORRIENTE');

/**
 * Diálogo para registrar un pago de cuenta corriente (aplica FIFO en el backend).
 * Props:
 *  - open, onClose, onGuardado(mensaje)
 *  - clientePreset: cliente ya elegido (desde Deudores) | null (buscar)
 */
export default function PagoDialog({ open, onClose, onGuardado, clientePreset = null }) {
  const [cliente, setCliente] = useState(null);
  const [opciones, setOpciones] = useState([]);
  const [inputCliente, setInputCliente] = useState('');
  const [monto, setMonto] = useState('');
  const [medioPago, setMedioPago] = useState('EFECTIVO');
  const [observacion, setObservacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setCliente(clientePreset);
    setInputCliente(clientePreset?.nombre ?? '');
    setMonto('');
    setMedioPago('EFECTIVO');
    setObservacion('');
  }, [open, clientePreset]);

  useEffect(() => {
    if (clientePreset || inputCliente.trim().length < 1) { setOpciones([]); return; }
    const t = setTimeout(async () => {
      try {
        const data = await clientesApi.listar({ busqueda: inputCliente.trim(), conDeuda: true, limite: 10 });
        setOpciones(data.items ?? []);
      } catch { setOpciones([]); }
    }, 350);
    return () => clearTimeout(t);
  }, [inputCliente, clientePreset]);

  const guardar = async () => {
    setError(null);
    if (!cliente) { setError('Elegí un cliente.'); return; }
    if (!(Number(monto) > 0)) { setError('El monto debe ser mayor a 0.'); return; }
    setGuardando(true);
    try {
      await cuentaCorrienteApi.registrarPago({
        idUsuario: getIdUsuarioActual(),
        idCliente: cliente.idCliente,
        monto: Number(monto),
        medioPago,
        observacion: observacion.trim() || null,
      });
      onGuardado?.('Pago registrado');
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo registrar el pago');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={guardando ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar pago de cuenta corriente</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2} sx={{ mt: 1 }}>
          {clientePreset ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={clientePreset.nombre} color="primary" />
              {clientePreset.saldo != null && (
                <Chip label={`Saldo: ${formatMoneda(clientePreset.saldo)}`} color="error" variant="outlined" />
              )}
            </Stack>
          ) : (
            <Autocomplete
              options={opciones}
              getOptionLabel={(o) => o?.nombre ?? ''}
              isOptionEqualToValue={(a, b) => a.idCliente === b.idCliente}
              value={cliente}
              onChange={(_, v) => setCliente(v)}
              inputValue={inputCliente}
              onInputChange={(_, v) => setInputCliente(v)}
              renderInput={(params) => <TextField {...params} label="Cliente" size="small" />}
              noOptionsText="Escribí para buscar…"
            />
          )}

          <TextField label="Monto" type="number" value={monto} onChange={(e) => setMonto(e.target.value)} size="small" inputProps={{ min: 0, step: '0.01' }} autoFocus />
          <TextField select label="Medio de pago" value={medioPago} onChange={(e) => setMedioPago(e.target.value)} size="small">
            {MEDIOS_COBRO.map((m) => <MenuItem key={m.valor} value={m.valor}>{m.label}</MenuItem>)}
          </TextField>
          <TextField label="Observación (opcional)" value={observacion} onChange={(e) => setObservacion(e.target.value)} size="small" multiline rows={2} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={guardando}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={guardar}
          disabled={guardando}
          startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
        >
          Registrar pago
        </Button>
      </DialogActions>
    </Dialog>
  );
}
