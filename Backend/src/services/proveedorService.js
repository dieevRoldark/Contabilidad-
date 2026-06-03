import { crearCrudService } from './base/crudService.js'

export default crearCrudService({
    tabla: 'proveedores',
    alias: 'proveedor',
    columnas: [
        { nombre: 'nit', columna: 'nit' },
        { nombre: 'nombre', columna: 'nombre' },
        { nombre: 'telefono', columna: 'telefono' },
        { nombre: 'correo', columna: 'correo' },
        { nombre: 'direccion', columna: 'direccion' }
    ],
    campoUnico: 'nit'
})
