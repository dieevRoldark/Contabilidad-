import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { autenticar } from '../middlewares/auth.middleware.js'
import { loginLimiter } from '../middlewares/rateLimit.middleware.js'
import { validate } from '../middlewares/validate.js'
import { loginSchema, registerSchema } from '../validations/auth.validations.js'

const router = Router()

router.post('/login', loginLimiter, validate(loginSchema), authController.login)
router.post('/register', loginLimiter, validate(registerSchema), authController.register)
router.post('/refresh', authController.refresh)
router.post('/logout', autenticar, authController.logout)
router.get('/me', autenticar, authController.me)

export default router
