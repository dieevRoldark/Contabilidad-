import { Router } from 'express'
import { autenticar } from '../../middlewares/auth.middleware.js'
import { validate } from '../../middlewares/validate.js'
import { descifrarSiEsCifrado } from '../../middlewares/decrypt.middleware.js'

export function crearCrudRoutes(controller, validations = {}) {
    const router = Router()

    router.get('/', autenticar, controller.listar)
    router.post('/', autenticar, descifrarSiEsCifrado, validate(validations.crear || []), controller.crear)
    router.put('/:id', autenticar, descifrarSiEsCifrado, validate(validations.actualizar || []), controller.actualizar)
    router.delete('/:id', autenticar, controller.eliminar)

    return router
}