import { getPool } from '../config/db.js'

export async function obtener(userId) {
    const [rows] = await getPool().query('SELECT * FROM perfiles WHERE user_id = ?', [userId])

    if (rows.length === 0) {
        return null
    }

    const row = rows[0]

    const personal = (() => {
        try { return JSON.parse(row.personal) } catch { return {} }
    })()
    const negocio = (() => {
        try { return JSON.parse(row.negocio) } catch { return {} }
    })()

    return { personal, negocio, foto: row.foto || null }
}

export async function guardar(userId, datos) {
    const connection = await getPool().getConnection()

    try {
        await connection.beginTransaction()

        const [existentes] = await connection.query('SELECT * FROM perfiles WHERE user_id = ? FOR UPDATE', [userId])
        const existe = existentes.length > 0

        if (!existe) {
            const personalJson = datos.personal ? JSON.stringify(datos.personal) : '{}'
            const negocioJson = datos.negocio ? JSON.stringify(datos.negocio) : '{}'

            await connection.query(
                'INSERT INTO perfiles (user_id, personal, negocio, foto) VALUES (?, ?, ?, ?)',
                [userId, personalJson, negocioJson, datos.foto ?? null]
            )

            await connection.commit()
            return obtener(userId)
        }

        if (datos.personal) {
            const personalActual = (() => {
                try { return JSON.parse(existentes[0].personal) } catch { return {} }
            })()
            const personalActualizado = { ...personalActual, ...datos.personal }
            await connection.query('UPDATE perfiles SET personal = ? WHERE user_id = ?', [JSON.stringify(personalActualizado), userId])
        }

        if (datos.negocio) {
            const negocioActual = (() => {
                try { return JSON.parse(existentes[0].negocio) } catch { return {} }
            })()
            const negocioActualizado = { ...negocioActual, ...datos.negocio }
            await connection.query('UPDATE perfiles SET negocio = ? WHERE user_id = ?', [JSON.stringify(negocioActualizado), userId])
        }

        if (datos.foto !== undefined) {
            await connection.query('UPDATE perfiles SET foto = ? WHERE user_id = ?', [datos.foto, userId])
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
