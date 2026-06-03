import * as authService from '../services/auth.service.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'
import { AppError } from '../utils/AppError.js'

const ACCESS_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000
}

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
}

const CLEAR_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
}

function setAuthCookies(res, accessToken, refreshToken) {
    if (accessToken) {
        res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS)
    }
    if (refreshToken) {
        res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
    }
}

function clearAuthCookies(res) {
    res.clearCookie('accessToken', CLEAR_COOKIE_OPTIONS)
    res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS)
}

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const resultado = await authService.login(email, password, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || ''
    })

    if (!resultado.ok) {
        return res.status(401).json(resultado)
    }

    setAuthCookies(res, resultado.accessToken, resultado.refreshToken)

    return res.json({
        ok: true,
        usuario: resultado.usuario
    })
})

export const register = asyncHandler(async (req, res) => {
    const { nombre, email, password } = req.body

    const resultado = await authService.registrar({ nombre, email, password })

    if (!resultado.ok) {
        return res.status(400).json(resultado)
    }

    setAuthCookies(res, resultado.accessToken, resultado.refreshToken)

    return res.status(201).json({
        ok: true,
        usuario: resultado.usuario
    })
})

export const refresh = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
        throw new AppError('Refresh token requerido.', 400)
    }

    const resultado = await authService.refreshAccessToken(refreshToken)

    if (!resultado.ok) {
        clearAuthCookies(res)
        return res.status(401).json(resultado)
    }

    setAuthCookies(res, resultado.accessToken, null)

    return res.json({
        ok: true,
        usuario: resultado.usuario
    })
})

export const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken

    if (refreshToken) {
        await authService.cerrarSesion(refreshToken)
    }

    clearAuthCookies(res)
    return res.json({ ok: true, mensaje: 'Sesion cerrada correctamente.' })
})

export function me(req, res) {
    return res.json({ usuario: req.usuario })
}
