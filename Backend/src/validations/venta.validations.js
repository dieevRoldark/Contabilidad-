import { body } from 'express-validator'

export const crearSchema = [
    body('clienteId').optional().trim().escape(),
    body('clienteNombre').optional().trim().escape(),
    body('estado').optional().trim().escape(),
    body('items')
        .isArray({ min: 1 }).withMessage('La venta debe tener al menos un item.'),
    body('items.*').isObject().withMessage('Cada item debe ser un objeto valido.'),
    body('subtotal').optional().isFloat({ min: 0 }).withMessage('Subtotal invalido.'),
    body('totalIva').optional().isFloat({ min: 0 }).withMessage('Total IVA invalido.'),
    body('total').optional().isFloat({ min: 0 }).withMessage('Total invalido.')
]
