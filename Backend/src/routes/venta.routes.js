import { Router } from 'express'
import * as ventaController from '../controllers/venta.controller.js'
import { autenticar } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.js'
import { crearSchema } from '../validations/venta.validations.js'

const router = Router()

router.get('/', autenticar, ventaController.listar)
router.post('/', autenticar, validate(crearSchema), ventaController.crear)
router.put('/:id/anular', autenticar, ventaController.anular)

export default router
