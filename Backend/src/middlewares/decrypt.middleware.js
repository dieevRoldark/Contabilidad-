import { descifrarPaqueteHibrido } from '../security/rsaService.js'
import { AppError } from '../utils/AppError.js'

function esPaqueteCifrado(valor) {
    return Boolean(
        valor
        && typeof valor === 'object'
        && valor.iv
        && valor.claveCifrada
        && valor.datosCifrados
    )
}

export function descifrarSiEsCifrado(req, res, next) {
    if (!req.body || !req.body._cifrado) {
        return next()
    }

    if (!esPaqueteCifrado(req.body._cifrado)) {
        return next(new AppError('Formato de paquete cifrado invalido.', 400))
    }

    try {
        const textoDescifrado = descifrarPaqueteHibrido(req.body._cifrado)
        const datosDescifrados = JSON.parse(textoDescifrado)

        delete req.body._cifrado

        Object.assign(req.body, datosDescifrados)

        next()
    } catch (err) {
        return next(new AppError('Error al descifrar los datos enviados.', 400))
    }
}
