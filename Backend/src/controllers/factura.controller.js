import { asyncHandler } from '../middlewares/asyncHandler.js'
import * as facturaService from '../services/facturaService.js'
import { AppError } from '../utils/AppError.js'

export const listar = asyncHandler(async (req, res) => {
    const facturas = await facturaService.obtenerTodos()
    return res.json(facturas)
})

export const crear = asyncHandler(async (req, res) => {
    const { proveedorNit, proveedorNombre, numeroFactura, fecha, estado, items } = req.body
    const contexto = {
        usuarioId: req.usuario?.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
    }
    const factura = await facturaService.crear(
        { proveedorNit, proveedorNombre, numeroFactura, fecha, estado, items },
        contexto
    )
    return res.status(201).json(factura)
})

export const anular = asyncHandler(async (req, res) => {
    const { id } = req.params
    const contexto = {
        usuarioId: req.usuario?.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
    }
    const factura = await facturaService.anular(id, contexto)
    if (!factura) throw new AppError('Factura no encontrada.', 404)
    return res.json(factura)
})
