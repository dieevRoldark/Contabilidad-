import { v4 as uuidv4 } from 'uuid'
import { getPool } from '../config/db.js'
import { mysqlDatetime } from '../utils/fecha.js'
import { withTransaction } from '../utils/transaction.js'
import { calcularTotales } from '../utils/totales.js'
import * as actividadService from './actividad.service.js'

function mapearFactura(row) {
    const items = (() => {
        try { return JSON.parse(row.items) } catch { return [] }
    })()

    return {
        id: row.id,
        proveedorNit: row.proveedor_nit,
        proveedorNombre: row.proveedor_nombre,
        numeroFactura: row.numero_factura,
        fecha: row.fecha,
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
    const [rows] = await getPool().query('SELECT * FROM facturas ORDER BY creado_en DESC')
    return rows.map(mapearFactura)
}

export async function obtenerPorId(id) {
    const [rows] = await getPool().query('SELECT * FROM facturas WHERE id = ?', [id])
    return rows.length > 0 ? mapearFactura(rows[0]) : null
}

export async function crear(datos, contexto = {}) {
    const id = uuidv4()
    const items = datos.items || []
    const totales = calcularTotales(items, { precioField: 'costo', tipoIva: 'porcentaje', campoIva: 'iva' })

    return withTransaction(async (conn) => {
        await conn.query(
            `INSERT INTO facturas
             (id, proveedor_nit, proveedor_nombre, numero_factura, fecha, estado, items,
              subtotal, total_iva, total, creado_en, actualizado_en)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                datos.proveedorNit || '',
                datos.proveedorNombre || '',
                datos.numeroFactura || '',
                datos.fecha || '',
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
            entidad: 'factura',
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
        const [facturas] = await conn.query('SELECT * FROM facturas WHERE id = ?', [id])

        if (facturas.length === 0) {
            const error = new Error('No se encontro la factura.')
            error.status = 404
            throw error
        }

        await conn.query(
            'UPDATE facturas SET estado = ?, actualizado_en = ? WHERE id = ?',
            ['anulada', mysqlDatetime(), id]
        )

        await actividadService.registrar({
            usuarioId: contexto.usuarioId,
            accion: 'ANULAR',
            entidad: 'factura',
            entidadId: id,
            ipAddress: contexto.ipAddress,
            userAgent: contexto.userAgent,
        })

        return obtenerPorId(id)
    })
}
