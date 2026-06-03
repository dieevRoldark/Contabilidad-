import { verificarAccessToken } from '../utils/crypto.js'
import { AppError } from '../utils/AppError.js'

export function autenticar(req, res, next) {
    const token = req.cookies?.accessToken

    if (!token) {
        return res.status(401).json(new AppError('Token no proporcionado.', 401).toJSON())
    }

    try {
        const payload = verificarAccessToken(token)
        if (payload.tipo !== 'access') {
            return res.status(401).json(new AppError('Tipo de token invalido.', 401).toJSON())
        }
        req.usuario = payload
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json(new AppError('Token expirado.', 401, 'TOKEN_EXPIRADO').toJSON())
        }
        return res.status(401).json(new AppError('Token invalido.', 401).toJSON())
    }
}
