import { existsSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import https from 'https'
import express from 'express'
import app from './app.js'
import { inicializarBaseDeDatos } from './config/db.js'
import { PORT, SSL_ENABLED, SSL_KEY_PATH, SSL_CERT_PATH, DOMAIN } from './config/env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

try {
    await inicializarBaseDeDatos()
    console.log('Base de datos inicializada correctamente.')
} catch (error) {
    console.error('')
    console.error('╔══════════════════════════════════════════════════════════════╗')
    console.error('║  ERROR DE CONEXION A BASE DE DATOS                        ║')
    console.error('╚══════════════════════════════════════════════════════════════╝')
    console.error('')
    console.error('Error de conexion a base de datos.')
    console.error('')
    process.exit(1)
}

if (SSL_ENABLED) {
    const keyPath = resolve(__dirname, '..', SSL_KEY_PATH)
    const certPath = resolve(__dirname, '..', SSL_CERT_PATH)

    if (!existsSync(keyPath) || !existsSync(certPath)) {
        console.error('Certificados SSL no encontrados.')
        console.error(`  KEY: ${keyPath}`)
        console.error(`  CERT: ${certPath}`)
        console.error('Ejecuta: npm run cert:dev')
        process.exit(1)
    }

    const httpsOptions = {
        key: readFileSync(keyPath),
        cert: readFileSync(certPath)
    }

    const httpsServer = https.createServer(httpsOptions, app)
    httpsServer.listen(PORT, () => {
        console.log(`Servidor corriendo en https://${DOMAIN || 'localhost'}:${PORT}`)
        console.log(`API endpoints disponibles en https://${DOMAIN || 'localhost'}:${PORT}/api`)
    })

    const httpRedirect = express()
    httpRedirect.use((req, res) => {
        const host = DOMAIN || req.headers.host?.split(':')[0] || 'localhost'
        res.redirect(301, `https://${host}:${PORT}${req.originalUrl}`)
    })
    httpRedirect.listen(Number(PORT) + 1, () => {
        console.log(`Redireccion HTTP -> HTTPS en puerto ${Number(PORT) + 1}`)
    })
} else {
    http.createServer(app).listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`)
        console.log(`API endpoints disponibles en http://localhost:${PORT}/api`)
    })
}
