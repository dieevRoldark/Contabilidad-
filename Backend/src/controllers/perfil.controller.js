import { asyncHandler } from '../middlewares/asyncHandler.js'
import * as perfilService from '../services/perfilService.js'

export const obtener = asyncHandler(async (req, res) => {
    const perfil = await perfilService.obtener(req.usuario.id)

    if (!perfil) {
        return res.json({ personal: {}, negocio: {}, foto: null })
    }

    return res.json(perfil)
})

export const guardar = asyncHandler(async (req, res) => {
    const datos = req.body
    const perfil = await perfilService.guardar(req.usuario.id, datos)
    return res.json(perfil)
})
