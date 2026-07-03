import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, InputAdornment, Stack, Chip, IconButton,
  Tooltip, TablePagination, CircularProgress, Alert, Button, FormControlLabel,
  Switch, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import useProveedores from '../../hooks/useProveedores.js';
import ProveedorFormDialog from './ProveedorFormDialog.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import proveedoresApi from '../../api/proveedores.js';

export default function Proveedores() {
  const { items, paginacion, loading, error, params, setFiltro, setPagina, recargar } = useProveedores();

  // Busqueda con debounce
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

  const [formAbierto, setFormAbierto] = useState(false);
  const [provEdit, setProvEdit] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);
  const [snack, setSnack] = useState('');

  const abrirNuevo = () => { setProvEdit(null); setFormAbierto(true); };
  const abrirEdicion = (p) => { setProvEdit(p); setFormAbierto(true); };

  const confirmarBaja = async () => {
    setBorrando(true);
    try {
      await proveedoresApi.darDeBaja(aBorrar.idProveedor);
      setSnack('Proveedor dado de baja');
      setABorrar(null);
      recargar();
    } catch (err) {
      setSnack(err.mensaje ?? 'No se pudo dar de baja');
    } finally {
      setBorrando(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }} spacing={1}>
        <Typography variant="h5">Proveedores</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}>
          Nuevo proveedor
        </Button>
      </Stack>

      {/* Filtros */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre o email..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
          />
          <FormControlLabel
            control={<Switch checked={params.incluirInactivos} onChange={(e) => setFiltro({ incluirInactivos: e.target.checked })} />}
            label="Incluir inactivos"
          />
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Telefono</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Direccion</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>No se encontraron proveedores.</TableCell></TableRow>
              ) : (
                items.map((p) => (
                  <TableRow key={p.idProveedor} hover sx={{ opacity: p.activo === false ? 0.55 : 1 }}>
                    <TableCell>{p.idProveedor}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>{p.nombre}</span>
                        {p.activo === false && <Chip label="Inactivo" size="small" variant="outlined" />}
                      </Stack>
                    </TableCell>
                    <TableCell>{p.telefono ?? '-'}</TableCell>
                    <TableCell>{p.email ?? '-'}</TableCell>
                    <TableCell>{p.direccion ?? '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => abrirEdicion(p)}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Dar de baja">
                        <span>
                          <IconButton size="small" color="error" onClick={() => setABorrar(p)} disabled={p.activo === false}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
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

      <ProveedorFormDialog
        open={formAbierto}
        proveedor={provEdit}
        onClose={() => setFormAbierto(false)}
        onGuardado={(msg) => { setFormAbierto(false); setSnack(msg); recargar(); }}
      />

      <ConfirmDialog
        open={aBorrar != null}
        titulo="Dar de baja proveedor"
        mensaje={aBorrar ? 'Dar de baja a "' + aBorrar.nombre + '"? Es una baja logica: se puede volver a ver con "Incluir inactivos".' : ''}
        textoConfirmar="Dar de baja"
        procesando={borrando}
        onClose={() => setABorrar(null)}
        onConfirm={confirmarBaja}
      />

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack('')}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
