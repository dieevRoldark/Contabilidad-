import { v4 as uuidv4 } from 'uuid'
import { getPool } from '../../config/db.js'
import { mysqlDatetime } from '../../utils/fecha.js'

export function crearCrudService(config) {
    const { tabla, alias, columnas, campoUnico, validar } = config

    const nombresColumnas = columnas.map(c => c.columna)
    const marcadores = nombresColumnas.map(() => '?').join(', ')
    const asignacionesUpdate = nombresColumnas.map(c => `${c} = ?`).join(', ')
    const columnasInsert = nombresColumnas.join(', ')

    function mapear(row) {
        const obj = { id: row.id, creadoEn: row.creado_en, actualizadoEn: row.actualizado_en }
        for (const col of columnas) {
            obj[col.nombre] = row[col.columna]
        }
        return obj
    }

    function construirInserts(datos) {
        return columnas.map(c => {
            const valor = datos[c.nombre]
            return valor ?? ''
        })
    }

    function construirUpdates(datos, existentes) {
        return columnas.map(c => {
            const valor = datos[c.nombre]
            return valor !== undefined ? valor : existentes[c.columna]
        })
    }

    async function obtenerTodos() {
        const [rows] = await getPool().query(`SELECT * FROM ${tabla} ORDER BY creado_en DESC`)
        return rows.map(mapear)
    }

    async function obtenerPorId(id) {
        const [rows] = await getPool().query(`SELECT * FROM ${tabla} WHERE id = ?`, [id])
        return rows.length > 0 ? mapear(rows[0]) : null
    }

    async function crear(datos) {
        if (validar) validar(datos)

        const connection = await getPool().getConnection()

        try {
            await connection.beginTransaction()

            if (campoUnico) {
                const columnaUnica = columnas.find(c => c.nombre === campoUnico)?.columna || campoUnico
                const [existentes] = await connection.query(`SELECT id FROM ${tabla} WHERE ${columnaUnica} = ? FOR UPDATE`, [datos[campoUnico]])

                if (existentes.length > 0) {
                    throw Object.assign(new Error(`Ya existe un ${alias} con este ${campoUnico}.`), { status: 409 })
                }
            }

            const id = uuidv4()
            const ahora = mysqlDatetime()

            await connection.query(
                `INSERT INTO ${tabla} (id, ${columnasInsert}, creado_en, actualizado_en) VALUES (?, ${marcadores}, ?, ?)`,
                [id, ...construirInserts(datos), ahora, ahora]
            )

            await connection.commit()
            return obtenerPorId(id)
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }

    async function actualizar(id, cambios) {
        if (validar) validar(cambios)

        const [registros] = await getPool().query(`SELECT * FROM ${tabla} WHERE id = ?`, [id])

        if (registros.length === 0) {
            throw Object.assign(new Error(`No se encontro el ${alias}.`), { status: 404 })
        }

        const existentes = registros[0]

        if (campoUnico && cambios[campoUnico]) {
            const columnaUnica = columnas.find(c => c.nombre === campoUnico)?.columna || campoUnico
            const [duplicados] = await getPool().query(
                `SELECT id FROM ${tabla} WHERE ${columnaUnica} = ? AND id != ?`,
                [cambios[campoUnico], id]
            )

            if (duplicados.length > 0) {
                throw Object.assign(new Error(`Ya existe un ${alias} con este ${campoUnico}.`), { status: 409 })
            }
        }

        const ahora = mysqlDatetime()

        await getPool().query(
            `UPDATE ${tabla} SET ${asignacionesUpdate}, actualizado_en = ? WHERE id = ?`,
            [...construirUpdates(cambios, existentes), ahora, id]
        )

        return obtenerPorId(id)
    }

    async function eliminar(id) {
        const [registros] = await getPool().query(`SELECT id FROM ${tabla} WHERE id = ?`, [id])

        if (registros.length === 0) {
            throw Object.assign(new Error(`No se encontro el ${alias}.`), { status: 404 })
        }

        await getPool().query(`DELETE FROM ${tabla} WHERE id = ?`, [id])
    }

    return { obtenerTodos, obtenerPorId, crear, actualizar, eliminar }
}
