import express from 'express'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { CORS_ORIGIN } from './config/env.js'
import { AppError } from './utils/AppError.js'
import { apiLimiter } from './middlewares/rateLimit.middleware.js'
import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import clienteRoutes from './routes/cliente.routes.js'
import proveedorRoutes from './routes/proveedor.routes.js'
import ventaRoutes from './routes/venta.routes.js'
import perfilRoutes from './routes/perfil.routes.js'
import configuracionRoutes from './routes/configuracion.routes.js'
import facturaRoutes from './routes/factura.routes.js'
import securityRoutes from './security/security.routes.js'
import { inicializarServicioRSA } from './security/rsaService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

inicializarServicioRSA()

const corsOptions = {
    origin: function (origin, callback) {
        const origenesPermitidos = [
            CORS_ORIGIN,
            'http://localhost',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:80',
            'https://localhost',
            'https://localhost:443'
        ]
        if (!origin || origenesPermitidos.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error(`Origen no permitido por CORS: ${origin}`))
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}

app.use(cors(corsOptions))
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            formAction: ["'self'"],
            baseUri: ["'self'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false
}))
app.use(express.json({ limit: '5mb' }))
app.use(cookieParser())
app.disable('x-powered-by')
app.set('trust proxy', 1)

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', apiLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/productos', productRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/proveedores', proveedorRoutes)
app.use('/api/ventas', ventaRoutes)
app.use('/api/perfil', perfilRoutes)
app.use('/api/configuracion', configuracionRoutes)
app.use('/api/facturas', facturaRoutes)
app.use('/api/security', securityRoutes)

const publicPath = resolve(__dirname, '../../frontend/public')
const sectionsPath = resolve(__dirname, '../../frontend/sections')
const srcPath = resolve(__dirname, '../../frontend/src')

app.use('/public', express.static(publicPath))
app.use('/sections', express.static(sectionsPath, { dotfiles: 'deny', index: false }))
app.use('/src', express.static(srcPath, { dotfiles: 'deny', index: false }))
app.use('/img', express.static(resolve(__dirname, '../../frontend/public/img')))

app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json(new AppError('Endpoint no encontrado.', 404).toJSON())
    }
    const indexPath = resolve(__dirname, '../../frontend/index.html')
    if (existsSync(indexPath)) {
        res.sendFile(indexPath)
    } else {
        res.status(200).json({ mensaje: 'Backend funcionando', frontend: 'Sirve via nginx en el puerto 80' })
    }
})

app.use((err, req, res, next) => {
    const appError = err instanceof AppError
        ? err
        : new AppError(
            err.status === 500 && process.env.NODE_ENV === 'production'
                ? 'Error interno del servidor'
                : (err.message || 'Error interno del servidor'),
            err.status || 500
        )
    if (appError.status === 500) {
        console.error('Error no manejado:', err)
    }
    res.status(appError.status).json(appError.toJSON())
})

export default app
