import { body } from 'express-validator'

export const guardarSchema = [
    body().isObject().withMessage('Datos invalidos.'),
    body('personal').optional().isObject().withMessage('Los datos personales deben ser un objeto.'),
    body('negocio').optional().isObject().withMessage('Los datos del negocio deben ser un objeto.'),
    body('foto').optional().isString().withMessage('La foto debe ser texto.')
]
