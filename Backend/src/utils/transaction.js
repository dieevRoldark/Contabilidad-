import { getPool } from '../config/db.js'

export async function withTransaction(fn) {
    const conn = await getPool().getConnection()
    try {
        await conn.beginTransaction()
        const result = await fn(conn)
        await conn.commit()
        return result
    } catch (error) {
        await conn.rollback()
        throw error
    } finally {
        conn.release()
    }
}
