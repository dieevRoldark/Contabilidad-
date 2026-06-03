import { crearCrudRoutes } from './base/crudRoutes.js'
import clienteController from '../controllers/cliente.controller.js'
import { crearSchema, actualizarSchema } from '../validations/cliente.validations.js'

export default crearCrudRoutes(clienteController, { crear: crearSchema, actualizar: actualizarSchema })
