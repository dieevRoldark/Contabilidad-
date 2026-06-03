import { v4 as uuidv4 } from 'uuid'
import { hashPassword, compararPassword, generarAccessToken, generarRefreshToken, verificarRefreshToken, hashToken } from '../utils/crypto.js'
import * as userModel from '../models/user.model.js'
import * as sessionModel from '../models/session.model.js'
import { getPool } from '../config/db.js'
import { MAX_LOGIN_ATTEMPTS, LOGIN_BLOCK_MINUTES } from '../config/env.js'
import { mysqlDatetime } from '../utils/fecha.js'
import { withTransaction } from '../utils/transaction.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

export async function login(email, password, metadata = {}) {
    const emailNormalizado = email.trim().toLowerCase()

    if (!EMAIL_REGEX.test(emailNormalizado)) {
        return { ok: false, motivo: 'EMAIL_INVALIDO', mensaje: 'Ingresa un correo valido.' }
    }

    const usuario = await userModel.buscarPorEmail(emailNormalizado)

    if (!usuario) {
        return { ok: false, motivo: 'NO_REGISTRADO', mensaje: 'Este correo no esta registrado.' }
    }

     if (usuario.bloqueado_hasta) {
         const bloqueadoHasta = new Date(usuario.bloqueado_hasta)
         if (bloqueadoHasta > new Date()) {
             const minutosRestantes = Math.ceil((bloqueadoHasta - new Date()) / 60000)
             return {
                 ok: false,
                 motivo: 'BLOQUEADO',
                 mensaje: `Cuenta bloqueada. Intenta de nuevo en ${minutosRestantes} minuto(s).`,
                 minutosRestantes
             }
         }
         await userModel.resetearIntentosFallidos(emailNormalizado)
     }

    const coincide = await compararPassword(password, usuario.password_hash)

    if (!coincide) {
        await userModel.incrementarIntentosFallidos(emailNormalizado)
        const [row] = await getPool().query('SELECT intentos_fallidos FROM usuarios WHERE email = ?', [emailNormalizado])
        const intentos = row[0].intentos_fallidos

        if (intentos >= MAX_LOGIN_ATTEMPTS) {
            const bloqueadoHasta = new Date(Date.now() + LOGIN_BLOCK_MINUTES * 60 * 1000)
            await userModel.bloquearUsuario(emailNormalizado, bloqueadoHasta)
            return {
                ok: false,
                motivo: 'BLOQUEADO',
                mensaje: `Demasiados intentos fallidos. Cuenta bloqueada por ${LOGIN_BLOCK_MINUTES} minutos.`,
                minutosRestantes: LOGIN_BLOCK_MINUTES
            }
        }

        return {
            ok: false,
            motivo: 'PASSWORD_INVALIDA',
            mensaje: 'La contrasena no coincide con este correo.',
            intentosRestantes: MAX_LOGIN_ATTEMPTS - intentos
        }
    }

    await userModel.resetearIntentosFallidos(emailNormalizado)

     const accessToken = generarAccessToken(usuario)
     const refreshToken = generarRefreshToken(usuario)

     const expiraEn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
     await sessionModel.crearSesion({
         usuarioId: usuario.id,
         refreshToken,
         userAgent: metadata.userAgent || '',
         ipAddress: metadata.ipAddress || '',
         expiraEn: mysqlDatetime()
     })

    return {
        ok: true,
        accessToken,
        refreshToken,
        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
    }
}

export async function registrar({ nombre, email, password }) {
    const emailNormalizado = email.trim().toLowerCase()

    const existente = await userModel.buscarPorEmail(emailNormalizado)

    if (existente) {
        return { ok: false, mensaje: 'Este correo ya esta registrado.' }
    }

    const passwordHash = await hashPassword(password)
    const id = uuidv4()
    const accessToken = generarAccessToken({ id, nombre: nombre.trim(), email: emailNormalizado })
    const refreshToken = generarRefreshToken({ id, nombre: nombre.trim(), email: emailNormalizado })

    await withTransaction(async (conn) => {
        await conn.query(
            'INSERT INTO usuarios (id, nombre, email, password_hash, creado_en) VALUES (?, ?, ?, ?, ?)',
            [id, nombre.trim(), emailNormalizado, passwordHash, mysqlDatetime()]
        )

        await conn.query(
            'INSERT INTO perfiles (user_id, personal, negocio, foto) VALUES (?, ?, ?, ?)',
            [
                id,
                JSON.stringify({ nombre: nombre.trim(), telefono: '', email: emailNormalizado, direccion: '' }),
                JSON.stringify({}),
                null
            ]
        )

         const refreshTokenHash = hashToken(refreshToken)
         const sesionId = uuidv4()

         await conn.query(
             'INSERT INTO sesiones_activas (id, usuario_id, refresh_token_hash, user_agent, ip_address, expira_en) VALUES (?, ?, ?, ?, ?, ?)',
             [sesionId, id, refreshTokenHash, '', '', mysqlDatetime()]
         )
    })

    return {
        ok: true,
        accessToken,
        refreshToken,
        usuario: { id, nombre: nombre.trim(), email: emailNormalizado }
    }
}

export async function refreshAccessToken(refreshToken) {
    try {
        const payload = verificarRefreshToken(refreshToken)
        const sesion = await sessionModel.buscarSesionPorRefreshToken(refreshToken)

        if (!sesion) {
            return { ok: false, mensaje: 'Sesion no valida o expirada.' }
        }

        const usuario = await userModel.buscarPorId(payload.id)
        if (!usuario) {
            return { ok: false, mensaje: 'Usuario no encontrado.' }
        }

        const accessToken = generarAccessToken(usuario)

        return {
            ok: true,
            accessToken,
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
        }
    } catch {
        return { ok: false, mensaje: 'Refresh token invalido o expirado.' }
    }
}

export async function cerrarSesion(refreshToken) {
    await sessionModel.revocarSesion(refreshToken)
    return { ok: true }
}
