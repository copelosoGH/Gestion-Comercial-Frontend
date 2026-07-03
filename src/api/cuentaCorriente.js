import api from './axios.js';

/**
 * Módulo Cuenta Corriente (FIFO).
 * Endpoints: POST /cuenta-corriente/pagos, GET /cuenta-corriente/pagos/:id,
 *            GET /cuenta-corriente/clientes/:id/estado,
 *            GET /cuenta-corriente/deudores
 */
export const cuentaCorrienteApi = {
  registrarPago: (datos) =>
    api.post('/cuenta-corriente/pagos', datos).then((r) => r.data),

  obtenerPago: (id) =>
    api.get(`/cuenta-corriente/pagos/${id}`).then((r) => r.data),

  estadoCuenta: (idCliente) =>
    api
      .get(`/cuenta-corriente/clientes/${idCliente}/estado`)
      .then((r) => r.data),

  deudores: () =>
    api.get('/cuenta-corriente/deudores').then((r) => r.data),
};

export default cuentaCorrienteApi;
