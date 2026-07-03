import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Stack, Chip, Divider, Typography, Grid, CircularProgress, Alert, Box,
  Accordion, AccordionSummary, AccordionDetails, Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';

import productosApi from '../../api/productos.js';

const campoNumero = (v) => (v === '' || v == null ? '' : String(v));

/** Convierte el producto del backend al estado editable del formulario. */
function aFormulario(p) {
  return {
    descripcion: p.descripcion ?? '',
    variantes: (p.variantes ?? []).map((v) => ({
      idVariante: v.idVariante,
      descripcion: v.descripcion ?? '',
      fragancia: v.fragancia ?? '',
      dimension: v.dimension ?? '',
      presentacion: v.presentacion ?? '',
      simulaA: v.simulaA ?? '',
      codigoBarras: v.codigoBarras ?? '',
      precioCosto: campoNumero(v.precioCosto),
      precioVenta: campoNumero(v.precioVenta),
      stockMinimoTotal: campoNumero(v.stockMinimoTotal),
      unidadVenta: v.unidadVenta ?? '',
      unidadesPorCaja: campoNumero(v.unidadesPorCaja),
    })),
  };
}

export default function ProductoEditDialog({ open, idProducto, onClose, onGuardado }) {
  const [producto, setProducto] = useState(null); // producto original (para ids de clasificación)
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!open || idProducto == null) return;
    let vivo = true;
    setLoading(true);
    setError(null);
    setProducto(null);
    setForm(null);
    productosApi
      .obtener(idProducto)
      .then((data) => {
        if (!vivo) return;
        setProducto(data);
        setForm(aFormulario(data));
      })
      .catch((err) => vivo && setError(err.mensaje ?? 'No se pudo cargar el producto'))
      .finally(() => vivo && setLoading(false));
    return () => { vivo = false; };
  }, [open, idProducto]);

  const setVariante = (i, campo, valor) =>
    setForm((prev) => {
      const variantes = [...prev.variantes];
      variantes[i] = { ...variantes[i], [campo]: valor };
      return { ...prev, variantes };
    });

  const guardar = async () => {
    if (!form.descripcion.trim()) {
      setError('La descripción del producto es obligatoria.');
      return;
    }
    setGuardando(true);
    setError(null);

    // Reconstruimos el body respetando el contrato del PUT. La clasificación
    // (rubro/subrubro/marca) se manda igual a la actual porque no hay endpoint
    // de catálogo para cambiarla desde acá.
    const body = {
      descripcion: form.descripcion.trim(),
      idRubro: producto.idRubro,
      idSubrubro: producto.idSubrubro ?? null,
      idMarca: producto.idMarca ?? null,
      variantes: form.variantes.map((v) => ({
        idVariante: v.idVariante,
        descripcion: v.descripcion.trim(),
        fragancia: v.fragancia.trim() || null,
        dimension: v.dimension.trim() || null,
        presentacion: v.presentacion.trim() || null,
        simulaA: v.simulaA.trim() || null,
        codigoBarras: v.codigoBarras.trim() || null,
        precioCosto: Number(v.precioCosto || 0),
        precioVenta: Number(v.precioVenta || 0),
        stockMinimoTotal: Number(v.stockMinimoTotal || 0),
        unidadVenta: v.unidadVenta.trim() || 'unidad',
        unidadesPorCaja: parseInt(v.unidadesPorCaja || 1, 10),
      })),
    };

    try {
      await productosApi.actualizar(idProducto, body);
      setOk(true);
      onGuardado?.();
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={guardando ? undefined : onClose} maxWidth="md" fullWidth>
        <DialogTitle>Editar producto</DialogTitle>
        <DialogContent dividers>
          {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {form && producto && (
            <Stack spacing={2}>
              <TextField
                label="Descripción del producto"
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                fullWidth
                size="small"
              />

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Rubro: ${producto.rubro ?? '—'}`} size="small" />
                <Chip label={`Subrubro: ${producto.subrubro ?? '—'}`} size="small" variant="outlined" />
                <Chip label={`Marca: ${producto.marca ?? '—'}`} size="small" variant="outlined" />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                La clasificación (rubro/subrubro/marca) no se puede cambiar acá todavía:
                el backend aún no expone endpoints de catálogo.
              </Typography>

              <Divider textAlign="left">
                <Typography variant="overline">Variantes</Typography>
              </Divider>

              {form.variantes.map((v, i) => (
                <Accordion key={v.idVariante} defaultExpanded={form.variantes.length === 1} disableGutters variant="outlined">
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{v.descripcion || `Variante ${v.idVariante}`}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField label="Descripción" value={v.descripcion} onChange={(e) => setVariante(i, 'descripcion', e.target.value)} fullWidth size="small" />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField label="Precio venta" type="number" value={v.precioVenta} onChange={(e) => setVariante(i, 'precioVenta', e.target.value)} fullWidth size="small" inputProps={{ min: 0, step: '0.01' }} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField label="Costo" type="number" value={v.precioCosto} onChange={(e) => setVariante(i, 'precioCosto', e.target.value)} fullWidth size="small" inputProps={{ min: 0, step: '0.01' }} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField label="Stock mínimo" type="number" value={v.stockMinimoTotal} onChange={(e) => setVariante(i, 'stockMinimoTotal', e.target.value)} fullWidth size="small" inputProps={{ min: 0, step: '0.01' }} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField label="Código de barras" value={v.codigoBarras} onChange={(e) => setVariante(i, 'codigoBarras', e.target.value)} fullWidth size="small" />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField label="Unidad de venta" value={v.unidadVenta} onChange={(e) => setVariante(i, 'unidadVenta', e.target.value)} fullWidth size="small" />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField label="Unidades por caja" type="number" value={v.unidadesPorCaja} onChange={(e) => setVariante(i, 'unidadesPorCaja', e.target.value)} fullWidth size="small" inputProps={{ min: 1, step: 1 }} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField label="Fragancia" value={v.fragancia} onChange={(e) => setVariante(i, 'fragancia', e.target.value)} fullWidth size="small" />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField label="Dimensión" value={v.dimension} onChange={(e) => setVariante(i, 'dimension', e.target.value)} fullWidth size="small" />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField label="Presentación" value={v.presentacion} onChange={(e) => setVariante(i, 'presentacion', e.target.value)} fullWidth size="small" />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField label="Simula a" value={v.simulaA} onChange={(e) => setVariante(i, 'simulaA', e.target.value)} fullWidth size="small" />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={guardando}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={guardar}
            disabled={guardando || loading || !form}
          >
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={ok}
        autoHideDuration={3000}
        onClose={() => setOk(false)}
        message="Producto actualizado"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
