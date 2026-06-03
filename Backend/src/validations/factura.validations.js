import { body } from 'express-validator'

export const crearSchema = [
    body('proveedorNit').optional().trim().escape(),
    body('proveedorNombre').optional().trim().escape(),
    body('numeroFactura').optional().trim().escape(),
    body('fecha').optional().trim().escape(),
    body('estado').optional().trim().escape(),
    body('items')
        .isArray({ min: 1 }).withMessage('La factura debe tener al menos un item.'),
    body('items.*').isObject().withMessage('Cada item debe ser un objeto valido.'),
    body('subtotal').optional().isFloat({ min: 0 }).withMessage('Subtotal invalido.'),
    body('totalIva').optional().isFloat({ min: 0 }).withMessage('Total IVA invalido.'),
    body('total').optional().isFloat({ min: 0 }).withMessage('Total invalido.')
]
