import { esEmailValido } from './utils.js'
import { API_BASE } from './config.js'
import {
    establecerSesion,
    estaAutenticado as sesionEstaAutenticado,
    limpiarSesion,
    obtenerUsuario as sesionObtenerUsuario,
    guardarEmailPendiente,
    obtenerEmailPendiente,
    limpiarEmailPendiente
} from '../store/sessionStore.js'

export { esEmailValido }

export function validarPassword(password) {
    if (password.length < 8) {
        return { ok: false, mensaje: 'La contrasena debe tener al menos 8 caracteres.' }
    }

    if (!/[A-Z]/.test(password)) {
        return { ok: false, mensaje: 'La contrasena debe tener al menos una mayuscula.' }
    }

    if (!/[a-z]/.test(password)) {
        return { ok: false, mensaje: 'La contrasena debe tener al menos una minuscula.' }
    }

    if (!/\d/.test(password)) {
        return { ok: false, mensaje: 'La contrasena debe tener al menos un numero.' }
    }

    return { ok: true }
}

export function estaAutenticado() {
    return sesionEstaAutenticado()
}

export function obtenerUsuario() {
    return sesionObtenerUsuario()
}

export async function verificarSesion() {
    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        if (res.ok) {
            const data = await res.json()
            establecerSesion(data.usuario)
            return true
        }
    } catch {
    }

    limpiarSesion()
    return false
}

function normalizarEmail(email) {
    return email.trim().toLowerCase()
}

export async function login(email, password) {
    const emailNormalizado = normalizarEmail(email)

    if (!esEmailValido(emailNormalizado)) {
        return { ok: false, motivo: 'EMAIL_INVALIDO', mensaje: 'Ingresa un correo valido.' }
    }

    const validacionPass = validarPassword(password)

    if (!validacionPass.ok) {
        return { ok: false, motivo: 'PASSWORD_DEBIL', mensaje: validacionPass.mensaje }
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailNormalizado, password })
        })

        if (!response.ok) {
            const data = await response.json().catch(() => ({ error: 'Error del servidor' }))

            if (data.motivo === 'NO_REGISTRADO') {
                return { ok: false, motivo: 'NO_REGISTRADO', mensaje: data.mensaje || 'Este correo no esta registrado.' }
            }

            return { ok: false, motivo: 'ERROR', mensaje: data.mensaje || data.error || 'Error al iniciar sesion.' }
        }

        const data = await response.json()
        establecerSesion(data.usuario)
        return { ok: true, usuario: data.usuario }
    } catch (error) {
        console.error('Error de red al iniciar sesion:', error)
        return { ok: false, motivo: 'RED', mensaje: 'No se pudo conectar con el servidor.' }
    }
}

export async function registrar({ nombre, email, password }) {
    const emailNormalizado = normalizarEmail(email)

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre.trim(), email: emailNormalizado, password })
        })

        if (!response.ok) {
            const data = await response.json().catch(() => ({ error: 'Error del servidor' }))
            return { ok: false, mensaje: data.mensaje || data.error || 'Error al registrar.' }
        }

        const data = await response.json()
        establecerSesion(data.usuario)
        return { ok: true, usuario: data.usuario }
    } catch (error) {
        console.error('Error de red al registrar:', error)
        return { ok: false, mensaje: 'No se pudo conectar con el servidor.' }
    }
}

export async function cerrarSesion() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
    } catch {
    }

    limpiarSesion()
}

export function guardarEmailRegistroPendiente(email) {
    guardarEmailPendiente(email)
}

export function obtenerEmailRegistroPendiente() {
    return obtenerEmailPendiente()
}

export function limpiarRegistroPendiente() {
    limpiarEmailPendiente()
}
