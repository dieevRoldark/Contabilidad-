import { getPool } from '../config/db.js'

export async function obtener(userId) {
    const [rows] = await getPool().query('SELECT * FROM configuraciones WHERE user_id = ?', [userId])

    if (rows.length === 0) {
        return null
    }

    const row = rows[0]

    const reportes = (() => {
        try { return JSON.parse(row.reportes) } catch { return {} }
    })()
    const notificaciones = (() => {
        try { return JSON.parse(row.notificaciones) } catch { return {} }
    })()

    return { reportes, notificaciones }
}

export async function guardar(userId, datos) {
    const connection = await getPool().getConnection()

    try {
        await connection.beginTransaction()

        const [existentes] = await connection.query('SELECT * FROM configuraciones WHERE user_id = ? FOR UPDATE', [userId])
        const existe = existentes.length > 0

        const reportesJson = datos.reportes ? JSON.stringify(datos.reportes) : '{}'
        const notificacionesJson = datos.notificaciones ? JSON.stringify(datos.notificaciones) : '{}'

        if (!existe) {
            await connection.query(
                'INSERT INTO configuraciones (user_id, reportes, notificaciones) VALUES (?, ?, ?)',
                [userId, reportesJson, notificacionesJson]
            )
        } else {
            if (datos.reportes) {
                await connection.query('UPDATE configuraciones SET reportes = ? WHERE user_id = ?', [reportesJson, userId])
            }
            if (datos.notificaciones) {
                await connection.query('UPDATE configuraciones SET notificaciones = ? WHERE user_id = ?', [notificacionesJson, userId])
            }
        }

        await connection.commit()
        return obtener(userId)
    } catch (error) {
        await connection.rollback()
        throw error
    } finally {
        connection.release()
    }
}
