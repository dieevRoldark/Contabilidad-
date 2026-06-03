import { Router } from 'express'
import * as perfilController from '../controllers/perfil.controller.js'
import { autenticar } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.js'
import { guardarSchema } from '../validations/perfil.validations.js'

const router = Router()

router.get('/', autenticar, perfilController.obtener)
router.put('/', autenticar, validate(guardarSchema), perfilController.guardar)

export default router
