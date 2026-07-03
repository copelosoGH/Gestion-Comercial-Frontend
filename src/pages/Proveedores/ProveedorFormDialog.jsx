import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Grid, Alert, CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import proveedoresApi from '../../api/proveedores.js';

const VACIO = { nombre: '', telefono: '', email: '', direccion: '', observaciones: '' };

/**
 * Alta / edición de proveedor.
 * Props:
 *  - open, onClose
 *  - proveedor: null (alta) | objeto proveedor (edición)
 *  - onGuardado(mensaje)
 */
export default function ProveedorFormDialog({ open, proveedor, onClose, onGuardado }) {
  const esEdicion = !!proveedor?.idProveedor;
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      esEdicion
        ? {
            nombre: proveedor.nombre ?? '',
            telefono: proveedor.telefono ?? '',
            email: proveedor.email ?? '',
            direccion: proveedor.direccion ?? '',
            observaciones: proveedor.observaciones ?? '',
          }
        : VACIO,
    );
  }, [open, proveedor, esEdicion]);

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
      telefono: form.telefono.trim() || null,
      email: form.email.trim() || null,
      direccion: form.direccion.trim() || null,
      observaciones: form.observaciones.trim() || null,
    };

    try {
      if (esEdicion) {
        await proveedoresApi.actualizar(proveedor.idProveedor, body);
        onGuardado?.('Proveedor actualizado');
      } else {
        await proveedoresApi.crear(body);
        onGuardado?.('Proveedor creado');
      }
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo guardar el proveedor');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={guardando ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{esEdicion ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label="Nombre" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} fullWidth size="small" autoFocus required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Teléfono" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} fullWidth size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} fullWidth size="small" />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Dirección" value={form.direccion} onChange={(e) => set('direccion', e.target.value)} fullWidth size="small" />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Observaciones" value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} fullWidth size="small" multiline rows={3} />
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
