import { getPool } from '../config/db.js'
import { mysqlDatetime } from '../utils/fecha.js'

export async function registrar({ usuarioId, accion, entidad, entidadId, detalle, ipAddress, userAgent }) {
    await getPool().query(
        `INSERT INTO logs_actividad
         (usuario_id, accion, entidad, entidad_id, detalle, ip_address, user_agent, creado_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            usuarioId || null,
            accion,
            entidad || '',
            entidadId || null,
            detalle ? JSON.stringify(detalle) : null,
            ipAddress || '',
            userAgent || '',
            mysqlDatetime(),
        ]
    )
}
