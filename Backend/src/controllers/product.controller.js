import productService from '../services/productService.js'
import { crearCrudController } from './base/crudController.js'

export default crearCrudController(productService, {
    alias: 'producto'
})
