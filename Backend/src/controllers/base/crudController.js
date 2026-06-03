import { asyncHandler } from '../../middlewares/asyncHandler.js'
import { AppError } from '../../utils/AppError.js'

export function crearCrudController(service, config) {
    const { alias } = config
    const aliasCapitalizado = alias.charAt(0).toUpperCase() + alias.slice(1)

    async function listar(req, res) {
        const items = await service.obtenerTodos()
        return res.json(items)
    }

    async function crear(req, res) {
        const item = await service.crear(req.body)
        return res.status(201).json(item)
    }

    async function actualizar(req, res) {
        const { id } = req.params
        const item = await service.actualizar(id, req.body)

        if (!item) {
            throw new AppError(`${aliasCapitalizado} no encontrado.`, 404)
        }

        return res.json(item)
    }

    async function eliminar(req, res) {
        const { id } = req.params
        await service.eliminar(id)
        return res.status(204).send()
    }

    return {
        listar: asyncHandler(listar),
        crear: asyncHandler(crear),
        actualizar: asyncHandler(actualizar),
        eliminar: asyncHandler(eliminar)
    }
}
