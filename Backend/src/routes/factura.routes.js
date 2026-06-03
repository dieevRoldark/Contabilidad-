import { Router } from 'express'
import * as facturaController from '../controllers/factura.controller.js'
import { autenticar } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.js'
import { crearSchema } from '../validations/factura.validations.js'

const router = Router()

router.get('/', autenticar, facturaController.listar)
router.post('/', autenticar, validate(crearSchema), facturaController.crear)
router.put('/:id/anular', autenticar, facturaController.anular)

export default router
