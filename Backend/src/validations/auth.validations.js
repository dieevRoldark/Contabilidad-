import { body } from 'express-validator'
import { validarPassword } from '../services/auth.service.js'

export const loginSchema = [
    body('email').isEmail().withMessage('Email invalido.').normalizeEmail(),
    body('password').notEmpty().withMessage('Contrasena requerida.').trim()
]

export const registerSchema = [
    body('nombre').trim().escape().notEmpty().withMessage('Nombre requerido.'),
    body('email').isEmail().withMessage('Email invalido.').normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('La contrasena debe tener al menos 8 caracteres.')
        .custom((value) => {
            const result = validarPassword(value)
            if (!result.ok) {
                throw new Error(result.mensaje)
            }
            return true
        })
        .trim()
]
