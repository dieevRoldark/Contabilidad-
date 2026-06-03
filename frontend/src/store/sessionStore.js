const CLAVE_EMAIL_PENDIENTE = 'contabilidad.registroPendiente.email'
const CLAVE_USUARIO_LEGACY = 'contabilidad.usuarioActivo'

let _usuario = null
let _estaAutenticado = false

function limpiarStorageLegacy() {
    localStorage.removeItem(CLAVE_USUARIO_LEGACY)
    sessionStorage.removeItem(CLAVE_USUARIO_LEGACY)
}

export function obtenerUsuario() {
    return _usuario
}

export function estaAutenticado() {
    return _estaAutenticado
}

export function establecerSesion(usuario) {
    limpiarStorageLegacy()
    _usuario = usuario
    _estaAutenticado = true
}

export function limpiarSesion() {
    _usuario = null
    _estaAutenticado = false
}

export function guardarEmailPendiente(email) {
    localStorage.setItem(CLAVE_EMAIL_PENDIENTE, email.trim().toLowerCase())
}

export function obtenerEmailPendiente() {
    return localStorage.getItem(CLAVE_EMAIL_PENDIENTE) || ''
}

export function limpiarEmailPendiente() {
    localStorage.removeItem(CLAVE_EMAIL_PENDIENTE)
}

limpiarStorageLegacy()
