import { Router } from 'express'
import * as configuracionController from '../controllers/configuracion.controller.js'
import { autenticar } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.js'
import { guardarSchema } from '../validations/configuracion.validations.js'

const router = Router()

router.get('/', autenticar, configuracionController.obtener)
router.put('/', autenticar, validate(guardarSchema), configuracionController.guardar)

export default router
