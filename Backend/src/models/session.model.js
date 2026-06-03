import { v4 as uuidv4 } from 'uuid'
import { getPool } from '../config/db.js'
import { hashToken } from '../utils/crypto.js'

export async function crearSesion({ usuarioId, refreshToken, userAgent, ipAddress, expiraEn }) {
    const id = uuidv4()
    const refreshTokenHash = hashToken(refreshToken)
    await getPool().query(
        `INSERT INTO sesiones_activas (id, usuario_id, refresh_token_hash, user_agent, ip_address, expira_en)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, usuarioId, refreshTokenHash, userAgent || '', ipAddress || '', expiraEn]
    )
    return id
}

export async function buscarSesionPorRefreshToken(refreshToken) {
    const refreshTokenHash = hashToken(refreshToken)
    const [rows] = await getPool().query(
        `SELECT * FROM sesiones_activas
         WHERE refresh_token_hash = ? AND revocada_en IS NULL AND expira_en > NOW()`,
        [refreshTokenHash]
    )
    return rows[0] || null
}

export async function revocarSesion(refreshToken) {
    const refreshTokenHash = hashToken(refreshToken)
    await getPool().query(
        'UPDATE sesiones_activas SET revocada_en = NOW() WHERE refresh_token_hash = ?',
        [refreshTokenHash]
    )
}

export async function revocarSesionesPorUsuario(usuarioId) {
    await getPool().query(
        'UPDATE sesiones_activas SET revocada_en = NOW() WHERE usuario_id = ? AND revocada_en IS NULL',
        [usuarioId]
    )
}

export async function limpiarSesionesExpiradas() {
    await getPool().query(
        'DELETE FROM sesiones_activas WHERE expira_en < NOW()'
    )
}
