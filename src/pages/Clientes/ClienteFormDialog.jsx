import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Grid, Alert, CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import clientesApi from '../../api/clientes.js';

const VACIO = { nombre: '', dniCuit: '', telefono: '', direccion: '', limiteCredito: '' };

/**
 * Alta / edición de cliente.
 * Props:
 *  - open, onClose
 *  - cliente: null (alta) | objeto cliente (edición)
 *  - onGuardado(mensaje): callback tras guardar OK
 */
export default function ClienteFormDialog({ open, cliente, onClose, onGuardado }) {
  const esEdicion = !!cliente?.idCliente;
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      esEdicion
        ? {
            nombre: cliente.nombre ?? '',
            dniCuit: cliente.dniCuit ?? '',
            telefono: cliente.telefono ?? '',
            direccion: cliente.direccion ?? '',
            limiteCredito: cliente.limiteCredito == null ? '' : String(cliente.limiteCredito),
          }
        : VACIO,
    );
  }, [open, cliente, esEdicion]);

  const set = (campo, valor) => setForm((p) => ({ ...p, [campo]: valor }));

  const guardar = async () => {
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    setGuardando(true);
    setError(null);

    const body = {
      nombre: form.nombre.trim(),
      dniCuit: form.dniCuit.trim() || null,
      telefono: form.telefono.trim() || null,
      direccion: form.direccion.trim() || null,
      limiteCredito: form.limiteCredito === '' ? null : Number(form.limiteCredito),
    };

    try {
      if (esEdicion) {
        await clientesApi.actualizar(cliente.idCliente, body);
        onGuardado?.('Cliente actualizado');
      } else {
        await clientesApi.crear(body);
        onGuardado?.('Cliente creado');
      }
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo guardar el cliente');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={guardando ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{esEdicion ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label="Nombre" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} fullWidth size="small" autoFocus required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="DNI / CUIT" value={form.dniCuit} onChange={(e) => set('dniCuit', e.target.value)} fullWidth size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Teléfono" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} fullWidth size="small" />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Dirección" value={form.direccion} onChange={(e) => set('direccion', e.target.value)} fullWidth size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Límite de crédito" type="number" value={form.limiteCredito} onChange={(e) => set('limiteCredito', e.target.value)} fullWidth size="small" inputProps={{ min: 0, step: '0.01' }} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={guardando}>Cancelar</Button>
        <Button
          variant="contained"
          startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          onClick={guardar}
          disabled={guardando}
        >
          {esEdicion ? 'Guardar cambios' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
