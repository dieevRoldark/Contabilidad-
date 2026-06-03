import { v4 as uuidv4 } from 'uuid'
import { getPool } from '../config/db.js'
import { mysqlDatetime } from '../utils/fecha.js'
import { withTransaction } from '../utils/transaction.js'
import { calcularTotales } from '../utils/totales.js'
import * as actividadService from './actividad.service.js'

function mapearVenta(row) {
    const items = (() => {
        try { return JSON.parse(row.items) } catch { return [] }
    })()

    return {
        id: row.id,
        clienteId: row.cliente_id,
        clienteNombre: row.cliente_nombre,
        estado: row.estado,
        items,
        subtotal: row.subtotal,
        totalIva: row.total_iva,
        total: row.total,
        creadoEn: row.creado_en,
        actualizadoEn: row.actualizado_en,
    }
}

export async function obtenerTodos() {
    const [rows] = await getPool().query('SELECT * FROM ventas ORDER BY creado_en DESC')
    return rows.map(mapearVenta)
}

export async function obtenerPorId(id) {
    const [rows] = await getPool().query('SELECT * FROM ventas WHERE id = ?', [id])
    return rows.length > 0 ? mapearVenta(rows[0]) : null
}

export async function crear(datos, contexto = {}) {
    const id = uuidv4()
    const items = datos.items || []
    const totales = calcularTotales(items, { tipoIva: 'diferencia', campoIva: 'precioMasIva' })

    return withTransaction(async (conn) => {
        await conn.query(
            `INSERT INTO ventas
             (id, cliente_id, cliente_nombre, estado, items, subtotal, total_iva, total, creado_en, actualizado_en)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                datos.clienteId || 'cliente-default',
                datos.clienteNombre || 'Cliente General',
                datos.estado || 'pendiente',
                JSON.stringify(items),
                totales.subtotal,
                totales.totalIva,
                totales.total,
                mysqlDatetime(),
                mysqlDatetime(),
            ]
        )

        await actividadService.registrar({
            usuarioId: contexto.usuarioId,
            accion: 'CREAR',
            entidad: 'venta',
            entidadId: id,
            detalle: { total: totales.total, items: items.length },
            ipAddress: contexto.ipAddress,
            userAgent: contexto.userAgent,
        })

        return obtenerPorId(id)
    })
}

export async function anular(id, contexto = {}) {
    return withTransaction(async (conn) => {
        const [ventas] = await conn.query('SELECT * FROM ventas WHERE id = ?', [id])

        if (ventas.length === 0) {
            const error = new Error('No se encontro la venta.')
            error.status = 404
            throw error
        }

        await conn.query(
            'UPDATE ventas SET estado = ?, actualizado_en = ? WHERE id = ?',
            ['anulada', mysqlDatetime(), id]
        )

        await actividadService.registrar({
            usuarioId: contexto.usuarioId,
            accion: 'ANULAR',
            entidad: 'venta',
            entidadId: id,
            ipAddress: contexto.ipAddress,
            userAgent: contexto.userAgent,
        })

        return obtenerPorId(id)
    })
}
