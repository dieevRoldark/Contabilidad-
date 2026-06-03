import clienteService from '../services/clienteService.js'
import { crearCrudController } from './base/crudController.js'
import { EMAIL_REGEX, obtenerTextoFormulario } from '../services/utils.js'

const controller = crearCrudController(clienteService, {
    prefijoEntidad: 'cliente',
    nombreEntidad: 'cliente',
    pluralEntidad: 'clientes',
    campoBusqueda: 'cedula',
    columnasTabla: [
        { clave: 'cedula', titulo: 'Cédula' },
        { clave: 'nombre', titulo: 'Nombre' },
        { clave: 'telefono', titulo: 'Teléfono' },
        { clave: 'correo', titulo: 'Correo' },
        { clave: 'direccion', titulo: 'Dirección' }
    ],
    obtenerDatosFormulario: (form) => {
        const formData = new FormData(form)
        const id = obtenerTextoFormulario(formData, 'id')
        const cedula = obtenerTextoFormulario(formData, 'cedula')
        const nombre = obtenerTextoFormulario(formData, 'nombre')
        const telefono = obtenerTextoFormulario(formData, 'telefono')
        const correo = obtenerTextoFormulario(formData, 'correo')
        const direccion = obtenerTextoFormulario(formData, 'direccion')

        if (!cedula || !nombre) {
            return { ok: false, mensaje: 'Ingresa la cedula y el nombre del cliente.' }
        }

        if (correo && !EMAIL_REGEX.test(correo)) {
            return { ok: false, mensaje: 'Ingresa un correo valido.' }
        }

        return {
            ok: true,
            data: { id, cedula, nombre, telefono, correo, direccion }
        }
    },
    obtenerDatosCifrado: (item) => ({
        cedula: item.cedula,
        nombre: item.nombre,
        telefono: item.telefono,
        correo: item.correo,
        direccion: item.direccion
    }),
    eventosExtra: () => {
        document.getElementById('btn-venta-cliente')?.addEventListener('click', () => {
            window.location.hash = 'ventas'
        })
    }
})

export const init = controller.init
