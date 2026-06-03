import { body } from 'express-validator'

export const crearSchema = [
    body('cedula').notEmpty().withMessage('Cedula es requerida.').trim().escape(),
    body('nombre').notEmpty().withMessage('Nombre es requerido.').trim().escape(),
    body('telefono').optional().trim().escape(),
    body('correo').optional().isEmail().withMessage('Ingresa un correo valido.').normalizeEmail(),
    body('direccion').optional().trim().escape()
]

export const actualizarSchema = [
    body('cedula').optional().trim().escape(),
    body('nombre').optional().trim().escape(),
    body('telefono').optional().trim().escape(),
    body('correo').optional().isEmail().withMessage('Ingresa un correo valido.').normalizeEmail(),
    body('direccion').optional().trim().escape()
]
