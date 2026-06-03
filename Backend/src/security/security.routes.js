import { Router } from 'express'
import { obtenerClavePublicaJwk } from './rsaService.js'

const router = Router()

router.get('/public-key', (req, res) => {
    const jwk = obtenerClavePublicaJwk()

    res.json(jwk)
})

export default router
