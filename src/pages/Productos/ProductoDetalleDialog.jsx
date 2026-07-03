import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Stack, Chip, Divider, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Alert, Box, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';

import productosApi from '../../api/productos.js';
import { formatMoneda, formatNumero } from '../../utils/formato.js';

export default function ProductoDetalleDialog({ open, idProducto, onClose, onEditar }) {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || idProducto == null) return;
    let vivo = true;
    setLoading(true);
    setError(null);
    setProducto(null);
    productosApi
      .obtener(idProducto)
      .then((data) => vivo && setProducto(data))
      .catch((err) => vivo && setError(err.mensaje ?? 'No se pudo cargar el producto'))
      .finally(() => vivo && setLoading(false));
    return () => { vivo = false; };
  }, [open, idProducto]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {producto ? producto.descripcion : 'Detalle del producto'}
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}

        {producto && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`Rubro: ${producto.rubro ?? '—'}`} size="small" />
              <Chip label={`Subrubro: ${producto.subrubro ?? '—'}`} size="small" variant="outlined" />
              <Chip label={`Marca: ${producto.marca ?? '—'}`} size="small" variant="outlined" />
            </Stack>

            <Divider textAlign="left">
              <Typography variant="overline">
                Variantes ({producto.variantes?.length ?? 0})
              </Typography>
            </Divider>

            {(producto.variantes ?? []).map((v) => (
              <Accordion key={v.idVariante} disableGutters variant="outlined">
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 2 }} justifyContent="space-between">
                    <Typography sx={{ flex: 1 }}>{v.descripcion}</Typography>
                    <Chip label={`Stock: ${formatNumero(v.stockTotal)}`} size="small" color={v.stockTotal <= v.stockMinimoTotal ? 'warning' : 'default'} />
                    <Chip label={formatMoneda(v.precioVenta)} size="small" color={v.precioVenta === 0 ? 'warning' : 'primary'} variant="outlined" />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                    {v.codigoBarras && <Chip size="small" label={`Cód: ${v.codigoBarras}`} />}
                    {v.fragancia && <Chip size="small" label={`Fragancia: ${v.fragancia}`} />}
                    {v.dimension && <Chip size="small" label={`Dim.: ${v.dimension}`} />}
                    {v.presentacion && <Chip size="small" label={`Present.: ${v.presentacion}`} />}
                    {v.simulaA && <Chip size="small" label={`Simula: ${v.simulaA}`} />}
                    <Chip size="small" label={`Costo: ${formatMoneda(v.precioCosto)}`} />
                    <Chip size="small" label={`Unidad: ${v.unidadVenta}`} />
                    <Chip size="small" label={`U./caja: ${v.unidadesPorCaja}`} />
                    <Chip size="small" label={`Stock mín.: ${formatNumero(v.stockMinimoTotal)}`} />
                  </Stack>

                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ubicación</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                        <TableCell align="right">Stock mínimo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(v.existencias ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} sx={{ color: 'text.secondary' }}>Sin existencias registradas.</TableCell>
                        </TableRow>
                      ) : (
                        v.existencias.map((e) => (
                          <TableRow key={e.idUbicacion}>
                            <TableCell>{e.ubicacion}</TableCell>
                            <TableCell align="right">{formatNumero(e.cantidad)}</TableCell>
                            <TableCell align="right">{formatNumero(e.stockMinimo)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        {producto && (
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => onEditar(producto.idProducto)}>
            Editar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
