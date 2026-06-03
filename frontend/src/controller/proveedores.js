import proveedorService from '../services/proveedorService.js'
import { crearCrudController } from './base/crudController.js'
import { EMAIL_REGEX, obtenerTextoFormulario } from '../services/utils.js'

const controller = crearCrudController(proveedorService, {
    prefijoEntidad: 'proveedor',
    nombreEntidad: 'proveedor',
    pluralEntidad: 'proveedores',
    campoBusqueda: 'nit',
    columnasTabla: [
        { clave: 'nit', titulo: 'NIT' },
        { clave: 'nombre', titulo: 'Nombre' },
        { clave: 'telefono', titulo: 'Teléfono' },
        { clave: 'correo', titulo: 'Correo' },
        { clave: 'direccion', titulo: 'Dirección' }
    ],
    obtenerDatosFormulario: (form) => {
        const formData = new FormData(form)
        const id = obtenerTextoFormulario(formData, 'id')
        const nit = obtenerTextoFormulario(formData, 'nit')
        const nombre = obtenerTextoFormulario(formData, 'nombre')
        const telefono = obtenerTextoFormulario(formData, 'telefono')
        const correo = obtenerTextoFormulario(formData, 'correo')
        const direccion = obtenerTextoFormulario(formData, 'direccion')

        if (!nit || !nombre) {
            return { ok: false, mensaje: 'Ingresa el nit y el nombre del proveedor.' }
        }

        if (correo && !EMAIL_REGEX.test(correo)) {
            return { ok: false, mensaje: 'Ingresa un correo valido.' }
        }

        return {
            ok: true,
            data: { id, nit, nombre, telefono, correo, direccion }
        }
    },
    obtenerDatosCifrado: (item) => ({
        nit: item.nit,
        nombre: item.nombre,
        telefono: item.telefono,
        correo: item.correo,
        direccion: item.direccion
    })
})

export const init = controller.init
