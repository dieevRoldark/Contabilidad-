import crypto from 'crypto'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { RSA_PRIVATE_KEY_PATH, RSA_PUBLIC_KEY_PATH } from '../config/env.js'

let privateKey = null
let publicKey = null
let clavePublicaJwk = null

export function inicializarServicioRSA() {
    if (privateKey && publicKey) {
        return
    }

    if (existsSync(RSA_PRIVATE_KEY_PATH) && existsSync(RSA_PUBLIC_KEY_PATH)) {
        const pemPrivada = readFileSync(RSA_PRIVATE_KEY_PATH, 'utf8')
        const pemPublica = readFileSync(RSA_PUBLIC_KEY_PATH, 'utf8')

        privateKey = crypto.createPrivateKey(pemPrivada)
        publicKey = crypto.createPublicKey(pemPublica)
    } else {
        const keyPair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        })

        writeFileSync(RSA_PRIVATE_KEY_PATH, keyPair.privateKey, { mode: 0o600 })
        writeFileSync(RSA_PUBLIC_KEY_PATH, keyPair.publicKey)

        privateKey = crypto.createPrivateKey(keyPair.privateKey)
        publicKey = crypto.createPublicKey(keyPair.publicKey)
    }

    clavePublicaJwk = publicKey.export({ format: 'jwk' })
}

export function obtenerClavePublicaJwk() {
    if (!clavePublicaJwk) {
        inicializarServicioRSA()
    }

    return { ...clavePublicaJwk, alg: 'RSA-OAEP-256' }
}

export function descifrarPaqueteHibrido(paqueteCifrado) {
    if (!privateKey) {
        inicializarServicioRSA()
    }

    const claveAES = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        Buffer.from(paqueteCifrado.claveCifrada, 'base64')
    )

    const iv = Buffer.from(paqueteCifrado.iv, 'base64')
    const datosCompletos = Buffer.from(paqueteCifrado.datosCifrados, 'base64')

    const tag = datosCompletos.subarray(datosCompletos.length - 16)
    const ciphertext = datosCompletos.subarray(0, datosCompletos.length - 16)

    const decipher = crypto.createDecipheriv('aes-256-gcm', claveAES, iv)
    decipher.setAuthTag(tag)

    const descifrado = decipher.update(ciphertext)
    const final = decipher.final()

    return Buffer.concat([descifrado, final]).toString('utf-8')
}
