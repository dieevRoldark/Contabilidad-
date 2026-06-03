import { crearCrudRoutes } from './base/crudRoutes.js'
import proveedorController from '../controllers/proveedor.controller.js'
import { crearSchema, actualizarSchema } from '../validations/proveedor.validations.js'

export default crearCrudRoutes(proveedorController, { crear: crearSchema, actualizar: actualizarSchema })
