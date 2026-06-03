import proveedorService from '../services/proveedorService.js'
import { crearCrudController } from './base/crudController.js'

export default crearCrudController(proveedorService, {
    alias: 'proveedor'
})
