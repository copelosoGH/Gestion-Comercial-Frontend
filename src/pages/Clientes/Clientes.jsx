import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, InputAdornment, Stack, Chip, IconButton,
  Tooltip, TablePagination, CircularProgress, Alert, Button, FormControlLabel,
  Switch, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import useClientes from '../../hooks/useClientes.js';
import { formatMoneda } from '../../utils/formato.js';
import ClienteFormDialog from './ClienteFormDialog.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import clientesApi from '../../api/clientes.js';

export default function Clientes() {
  const { items, paginacion, loading, error, params, setFiltro, setPagina, recargar } = useClientes();

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

  // Dialogos y feedback
  const [formAbierto, setFormAbierto] = useState(false);
  const [clienteEdit, setClienteEdit] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);
  const [snack, setSnack] = useState('');

  const abrirNuevo = () => { setClienteEdit(null); setFormAbierto(true); };
  const abrirEdicion = (c) => { setClienteEdit(c); setFormAbierto(true); };

  const confirmarBaja = async () => {
    setBorrando(true);
    try {
      await clientesApi.darDeBaja(aBorrar.idCliente);
      setSnack('Cliente dado de baja');
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
        <Typography variant="h5">Clientes</Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={abrirNuevo}>
          Nuevo cliente
        </Button>
      </Stack>

      {/* Filtros */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre, DNI/CUIT..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
          />
          <FormControlLabel
            control={<Switch checked={params.conDeuda} onChange={(e) => setFiltro({ conDeuda: e.target.checked })} />}
            label="Con deuda"
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
                <TableCell>DNI / CUIT</TableCell>
                <TableCell>Telefono</TableCell>
                <TableCell align="right">Saldo</TableCell>
                <TableCell align="right">Limite</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No se encontraron clientes.</TableCell></TableRow>
              ) : (
                items.map((c) => (
                  <TableRow key={c.idCliente} hover sx={{ opacity: c.activo === false ? 0.55 : 1 }}>
                    <TableCell>{c.idCliente}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>{c.nombre}</span>
                        {c.activo === false && <Chip label="Inactivo" size="small" variant="outlined" />}
                      </Stack>
                    </TableCell>
                    <TableCell>{c.dniCuit ?? '-'}</TableCell>
                    <TableCell>{c.telefono ?? '-'}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color={c.saldo > 0 ? 'error.main' : 'text.primary'} fontWeight={c.saldo > 0 ? 700 : 400}>
                        {formatMoneda(c.saldo)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{c.limiteCredito ? formatMoneda(c.limiteCredito) : '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => abrirEdicion(c)}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Dar de baja">
                        <span>
                          <IconButton size="small" color="error" onClick={() => setABorrar(c)} disabled={c.activo === false}>
                            <PersonOffIcon fontSize="small" />
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

      <ClienteFormDialog
        open={formAbierto}
        cliente={clienteEdit}
        onClose={() => setFormAbierto(false)}
        onGuardado={(msg) => { setFormAbierto(false); setSnack(msg); recargar(); }}
      />

      <ConfirmDialog
        open={aBorrar != null}
        titulo="Dar de baja cliente"
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
