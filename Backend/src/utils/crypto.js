import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { JWT_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } from '../config/env.js'

// ============================================================
//   🛠 FASE 2 (futuro): Migrar a RS256 (asimetrico)
//   Actual:   HS256 (simetrico) — cualquiera con JWT_SECRET
//             puede firmar y verificar tokens.
//   Futuro:   RS256 con par RSA-2048
//             - Clave PRIVADA en servidor (Backend/src/security/)
//             - Clave PUBLICA distribuida a clientes
//             - Libreria: node-jose o jsonwebtoken con {algorithm: 'RS256'}
//             - Generacion: openssl genrsa -out private.pem 2048
//                           openssl rsa -in private.pem -pubout -out public.pem
// ============================================================

export function generarAccessToken(usuario) {
    // FASE 2: Reemplazar JWT_SECRET por clave privada RSA
    return jwt.sign(
        { id: usuario.id, email: usuario.email, nombre: usuario.nombre, tipo: 'access' },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRATION }
    )
}

export function generarRefreshToken(usuario) {
    // FASE 2: Usar JWT_REFRESH_SECRET o clave separada para refresh
    return jwt.sign(
        { id: usuario.id, email: usuario.email, tipo: 'refresh' },
        JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRATION }
    )
}

export function verificarAccessToken(token) {
    // FASE 2: jwt.verify(token, publicKeyRSA, { algorithms: ['RS256'] })
    return jwt.verify(token, JWT_SECRET)
}

export function verificarRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET)
}

export function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex')
}

export async function hashPassword(password) {
    return bcrypt.hash(password, 10)
}

export async function compararPassword(password, hash) {
    return bcrypt.compare(password, hash)
}
