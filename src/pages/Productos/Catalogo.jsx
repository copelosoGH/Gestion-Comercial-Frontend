import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, InputAdornment, MenuItem, Stack, Chip,
  IconButton, Tooltip, TablePagination, CircularProgress, Alert, Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';

import useProductos from '../../hooks/useProductos.js';
import { formatNumero, formatRangoPrecio } from '../../utils/formato.js';
import ProductoDetalleDialog from './ProductoDetalleDialog.jsx';
import ProductoEditDialog from './ProductoEditDialog.jsx';

export default function Catalogo() {
  const { items, paginacion, loading, error, params, setFiltro, setPagina, recargar } = useProductos();

  // --- Busqueda con debounce ---
  const [texto, setTexto] = useState('');
  const primeraRender = useRef(true);
  useEffect(() => {
    if (primeraRender.current) {
      primeraRender.current = false;
      return;
    }
    const t = setTimeout(() => setFiltro({ busqueda: texto }), 400);
    return () => clearTimeout(t);
  }, [texto]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Rubros para el filtro: se acumulan a partir de lo que devuelve la API
  //     (el backend no tiene endpoint para listar rubros todavia). ---
  const [rubros, setRubros] = useState([]);
  useEffect(() => {
    setRubros((prev) => {
      const mapa = new Map(prev.map((r) => [r.idRubro, r.rubro]));
      items.forEach((p) => p.idRubro && mapa.set(p.idRubro, p.rubro));
      return [...mapa.entries()]
        .map(([idRubro, rubro]) => ({ idRubro, rubro }))
        .sort((a, b) => a.rubro.localeCompare(b.rubro));
    });
  }, [items]);

  // --- Dialogos ---
  const [detalleId, setDetalleId] = useState(null);
  const [editId, setEditId] = useState(null);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        sx={{ mb: 2 }}
        spacing={1}
      >
        <Typography variant="h5">Catalogo de productos</Typography>
        <Button startIcon={<RefreshIcon />} onClick={recargar} disabled={loading}>
          Actualizar
        </Button>
      </Stack>

      {/* Filtros */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre o codigo de barras..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Rubro"
            value={params.idRubro}
            onChange={(e) => setFiltro({ idRubro: e.target.value })}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {rubros.map((r) => (
              <MenuItem key={r.idRubro} value={r.idRubro}>{r.rubro}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Descripcion</TableCell>
                <TableCell>Rubro</TableCell>
                <TableCell align="center">Variantes</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No se encontraron productos.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((p) => (
                  <TableRow key={p.idProducto} hover>
                    <TableCell>{p.idProducto}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>{p.descripcion}</span>
                        {p.tienePrecioPendiente && (
                          <Chip label="Precio pendiente" size="small" color="warning" variant="outlined" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{p.rubro}</TableCell>
                    <TableCell align="center">{p.cantidadVariantes}</TableCell>
                    <TableCell align="right">{formatNumero(p.stockTotal)}</TableCell>
                    <TableCell align="right">{formatRangoPrecio(p.precioMin, p.precioMax)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => setDetalleId(p.idProducto)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => setEditId(p.idProducto)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={paginacion.total}
          page={Math.max(0, paginacion.pagina - 1)}
          onPageChange={(_, nuevaPagina) => setPagina(nuevaPagina + 1)}
          rowsPerPage={params.limite}
          onRowsPerPageChange={(e) => setFiltro({ limite: parseInt(e.target.value, 10) })}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Por pagina:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Detalle */}
      <ProductoDetalleDialog
        open={detalleId != null}
        idProducto={detalleId}
        onClose={() => setDetalleId(null)}
        onEditar={(id) => { setDetalleId(null); setEditId(id); }}
      />

      {/* Edicion */}
      <ProductoEditDialog
        open={editId != null}
        idProducto={editId}
        onClose={() => setEditId(null)}
        onGuardado={() => { setEditId(null); recargar(); }}
      />
    </Box>
  );
}
