import mysql from 'mysql2/promise'
import { setTimeout } from 'timers/promises'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from './env.js'
import { seedDatabase } from './seed.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let pool = null

async function crearBaseDeDatosSiNoExiste() {
    let lastError = null
    for (let i = 0; i < 10; i++) {
        try {
            const conn = await mysql.createConnection({
                host: DB_HOST,
                port: Number(DB_PORT),
                user: DB_USER,
                password: DB_PASSWORD
            })
            await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
            await conn.end()
            return
        } catch (error) {
            lastError = error
            console.log(`Esperando MySQL (intento ${i + 1}/10)...`)
            await setTimeout(3000)
        }
    }
    throw lastError
}

export async function inicializarBaseDeDatos() {
    try {
        await crearBaseDeDatosSiNoExiste()
    } catch (error) {
        const esXampp = DB_USER === 'root' && DB_PASSWORD === ''
        const msg = [
            `No se pudo conectar a MySQL en ${DB_USER}@${DB_HOST}:${DB_PORT}.`,
            '',
            'Asegurate de que MySQL este corriendo:',
            '',
            '  1. XAMPP: Abre el panel de control y haz clic en "Start" en MySQL.',
            `     (Usuario: ${DB_USER}, Password: ${esXampp ? '(vacio)' : DB_PASSWORD})`,
            '',
             '  2. Docker: docker-compose up -d mysql',
             `     (Usuario: app_user, Password: app_doris)`,
            '',
            '  3. Luego cambia las credenciales en Backend/.env segun corresponda.',
            '',
            `  Host: ${DB_HOST}`,
            `  Puerto: ${DB_PORT}`,
            `  Base de datos: ${DB_NAME}`,
            '',
            'Error original:', error.message
        ].join('\n')

        throw new Error(msg)
    }

    pool = mysql.createPool({
        host: DB_HOST,
        port: Number(DB_PORT),
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        multipleStatements: true
    })

    const connection = await pool.getConnection()
    try {
        const sqlPath = resolve(__dirname, '..', '..', 'init.sql')
        const sql = existsSync(sqlPath) ? readFileSync(sqlPath, 'utf8') : ''

        if (sql) {
            await connection.query(sql)
        }

        const [rows] = await connection.query('SELECT COUNT(*) as total FROM usuarios')
        if (rows[0].total === 0) {
            console.log('Base de datos vacia. Sembrando datos iniciales...')
            await seedDatabase(pool)
            console.log('Datos iniciales insertados correctamente.')
        }
    } finally {
        connection.release()
    }

    console.log(`Conectado a MySQL: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`)
}

export function getPool() {
    if (!pool) {
        throw new Error('Base de datos no inicializada. Llama a inicializarBaseDeDatos() primero.')
    }
    return pool
}