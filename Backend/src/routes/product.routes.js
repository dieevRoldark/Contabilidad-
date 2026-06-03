import { crearCrudRoutes } from './base/crudRoutes.js'
import productController from '../controllers/product.controller.js'
import { crearSchema, actualizarSchema } from '../validations/product.validations.js'

export default crearCrudRoutes(productController, { crear: crearSchema, actualizar: actualizarSchema })
