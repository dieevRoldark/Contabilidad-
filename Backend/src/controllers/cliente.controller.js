import clienteService from '../services/clienteService.js'
import { crearCrudController } from './base/crudController.js'

export default crearCrudController(clienteService, {
    alias: 'cliente'
})
