import { getPool } from '../config/db.js'
import { mysqlDatetime } from '../utils/fecha.js'

export async function buscarPorEmail(email) {
    const [rows] = await getPool().query('SELECT * FROM usuarios WHERE email = ?', [email])
    return rows[0] || null
}

export async function buscarPorId(id) {
    const [rows] = await getPool().query('SELECT id, nombre, email, creado_en, intentos_fallidos, bloqueado_hasta FROM usuarios WHERE id = ?', [id])
    return rows[0] || null
}

export async function crear({ id, nombre, email, passwordHash }) {
    await getPool().query(
        'INSERT INTO usuarios (id, nombre, email, password_hash, creado_en) VALUES (?, ?, ?, ?, ?)',
        [id, nombre, email, passwordHash, mysqlDatetime()]
    )
    return buscarPorId(id)
}

export async function incrementarIntentosFallidos(email) {
    await getPool().query(
        `UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1 WHERE email = ?`,
        [email]
    )
}

export async function bloquearUsuario(email, bloqueadoHasta) {
    await getPool().query(
        'UPDATE usuarios SET bloqueado_hasta = ? WHERE email = ?',
        [bloqueadoHasta, email]
    )
}

export async function resetearIntentosFallidos(email) {
    await getPool().query(
        'UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE email = ?',
        [email]
    )
}
