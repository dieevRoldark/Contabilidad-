import { crearCrudService } from './base/crudService.js'

export default crearCrudService({
    tabla: 'productos',
    alias: 'producto',
    columnas: [
        { nombre: 'codigo', columna: 'codigo' },
        { nombre: 'nombre', columna: 'nombre' },
        { nombre: 'precioCompra', columna: 'precio_compra' },
        { nombre: 'iva', columna: 'iva' },
        { nombre: 'precioFinalVenta', columna: 'precio_final_venta' }
    ],
    campoUnico: 'codigo'
})
