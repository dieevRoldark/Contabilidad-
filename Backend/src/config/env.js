import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../../.env') })

// ============================================================
//   🔐 JWT — Zero Default Policy
//   NUNCA usar fallback hardcodeado. Si las variables de
//   entorno NO están definidas, el servidor se niega a arrancar.
//   Para generar un secreto: openssl rand -base64 32
//   (256 bits = minimo seguro para HS256)
// ============================================================
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET no definido. Revisa Backend/.env o las variables de entorno de Docker.')
    process.exit(1)
}
if (!process.env.JWT_REFRESH_SECRET) {
    console.error('FATAL: JWT_REFRESH_SECRET no definido.')
    process.exit(1)
}

export const JWT_SECRET = process.env.JWT_SECRET
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

export const PORT = process.env.PORT || 3000

export const SSL_ENABLED = process.env.SSL_ENABLED === 'true'
export const SSL_KEY_PATH = process.env.SSL_KEY_PATH || './certs/key.pem'
export const SSL_CERT_PATH = process.env.SSL_CERT_PATH || './certs/cert.pem'
export const DOMAIN = process.env.DOMAIN || 'localhost'
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

export const ACCESS_TOKEN_EXPIRATION = '15m'
export const REFRESH_TOKEN_EXPIRATION = '7d'

export const DB_HOST = process.env.DB_HOST || 'localhost'
export const DB_PORT = process.env.DB_PORT || 3306
export const DB_USER = process.env.DB_USER || 'app_user'
export const DB_PASSWORD = process.env.DB_PASSWORD ?? 'app_doris'
export const DB_NAME = process.env.DB_NAME || 'MarketD&D_db'

export const MAX_LOGIN_ATTEMPTS = 5
export const LOGIN_BLOCK_MINUTES = 15

export const RSA_PRIVATE_KEY_PATH = process.env.RSA_PRIVATE_KEY_PATH || resolve(__dirname, '../security/rsa-private.pem')
export const RSA_PUBLIC_KEY_PATH = process.env.RSA_PUBLIC_KEY_PATH || resolve(__dirname, '../security/rsa-public.pem')
