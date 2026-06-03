import { body } from 'express-validator'

export const crearSchema = [
    body('codigo').notEmpty().withMessage('Codigo es requerido.').trim().escape(),
    body('nombre').notEmpty().withMessage('Nombre es requerido.').trim().escape(),
    body('precioCompra')
        .notEmpty().withMessage('Precio de compra es requerido.')
        .isFloat({ min: 0 }).withMessage('Precio de compra invalido.'),
    body('iva')
        .notEmpty().withMessage('IVA es requerido.')
        .isFloat({ min: 0 }).withMessage('IVA invalido.'),
    body('precioFinalVenta')
        .notEmpty().withMessage('Precio final de venta es requerido.')
        .isFloat({ min: 0 }).withMessage('Precio final de venta invalido.')
]

export const actualizarSchema = [
    body('codigo').optional().trim().escape(),
    body('nombre').optional().trim().escape(),
    body('precioCompra').optional().isFloat({ min: 0 }).withMessage('Precio de compra invalido.'),
    body('iva').optional().isFloat({ min: 0 }).withMessage('IVA invalido.'),
    body('precioFinalVenta').optional().isFloat({ min: 0 }).withMessage('Precio final de venta invalido.')
]
