import { asyncHandler } from '../middlewares/asyncHandler.js'
import * as configuracionService from '../services/configuracionService.js'

export const obtener = asyncHandler(async (req, res) => {
    const config = await configuracionService.obtener(req.usuario.id)

    if (!config) {
        return res.json({
            reportes: { tipo: [], frecuencia: 'diario', formato: 'pdf' },
            notificaciones: { frecuencia: 'diario', canales: ['correo'] },
        })
    }

    return res.json(config)
})

export const guardar = asyncHandler(async (req, res) => {
    const datos = req.body
    const config = await configuracionService.guardar(req.usuario.id, datos)
    return res.json(config)
})
