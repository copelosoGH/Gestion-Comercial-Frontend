/**
 * Manejo de la sesión en el navegador (token + datos del usuario).
 * Se guarda en localStorage. Lo usan tanto la capa de axios como el AuthContext.
 */
const TOKEN_KEY = 'gc_token';
const USER_KEY = 'gc_usuario';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

/** id del usuario logueado (el backend lo exige en el body de ventas/compras/etc.). */
export function getIdUsuarioActual() {
  return getUsuario()?.idUsuario ?? null;
}

export function setSession(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
