import { asyncHandler } from '../middlewares/asyncHandler.js'
import * as ventaService from '../services/ventaService.js'
import { AppError } from '../utils/AppError.js'

export const listar = asyncHandler(async (req, res) => {
    const ventas = await ventaService.obtenerTodos()
    return res.json(ventas)
})

export const crear = asyncHandler(async (req, res) => {
    const { clienteId, clienteNombre, estado, items } = req.body
    const contexto = {
        usuarioId: req.usuario?.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
    }
    const venta = await ventaService.crear({ clienteId, clienteNombre, estado, items }, contexto)
    return res.status(201).json(venta)
})

export const anular = asyncHandler(async (req, res) => {
    const { id } = req.params
    const contexto = {
        usuarioId: req.usuario?.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
    }
    const venta = await ventaService.anular(id, contexto)
    if (!venta) throw new AppError('Venta no encontrada.', 404)
    return res.json(venta)
})
