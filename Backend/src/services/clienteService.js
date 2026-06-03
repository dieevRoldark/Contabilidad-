import { crearCrudService } from './base/crudService.js'

export default crearCrudService({
    tabla: 'clientes',
    alias: 'cliente',
    columnas: [
        { nombre: 'cedula', columna: 'cedula' },
        { nombre: 'nombre', columna: 'nombre' },
        { nombre: 'telefono', columna: 'telefono' },
        { nombre: 'correo', columna: 'correo' },
        { nombre: 'direccion', columna: 'direccion' }
    ],
    campoUnico: 'cedula'
})
