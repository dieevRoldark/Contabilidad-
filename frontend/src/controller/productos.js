import productService from '../services/productService.js'
import { crearCrudController } from './base/crudController.js'
import { normalizarNumero, formatearMoneda, formatearNumero } from '../services/utils.js'

const controller = crearCrudController(productService, {
    prefijoEntidad: 'producto',
    nombreEntidad: 'producto',
    pluralEntidad: 'productos',
    campoBusqueda: 'codigo',
    columnasTabla: [
        { clave: 'codigo', titulo: 'Código' },
        { clave: 'nombre', titulo: 'Nombre' },
        { clave: 'precioCompra', titulo: 'Precio Compra', formato: (v) => formatearMoneda(v) },
        { clave: 'iva', titulo: 'IVA', formato: (v) => `${formatearNumero(v)}%` },
        { clave: 'precioFinalVenta', titulo: 'Precio Venta', formato: (v) => formatearMoneda(v) }
    ],
    obtenerDatosFormulario: (form) => {
        const formData = new FormData(form)
        const id = formData.get('id')?.trim() || ''
        const codigo = formData.get('codigo')?.trim() || ''
        const nombre = formData.get('nombre')?.trim() || ''
        const precioCompra = normalizarNumero(formData.get('precioCompra'))
        const iva = normalizarNumero(formData.get('iva'))
        const precioFinalVenta = normalizarNumero(formData.get('precioFinalVenta'))

        if (!codigo || !nombre) {
            return { ok: false, mensaje: 'Ingresa el codigo y el nombre del producto.' }
        }

        if (!Number.isFinite(precioCompra) || precioCompra < 0) {
            return { ok: false, mensaje: 'Ingresa un precio de compra valido.' }
        }

        if (!Number.isFinite(iva) || iva < 0) {
            return { ok: false, mensaje: 'Ingresa un IVA valido.' }
        }

        if (!Number.isFinite(precioFinalVenta) || precioFinalVenta < 0) {
            return { ok: false, mensaje: 'Ingresa un precio final de venta valido.' }
        }

        return {
            ok: true,
            data: { id, codigo, nombre, precioCompra, iva, precioFinalVenta }
        }
    },
    obtenerDatosCifrado: (item) => ({
        codigo: item.codigo,
        nombre: item.nombre,
        precioCompra: item.precioCompra,
        iva: item.iva,
        precioFinalVenta: item.precioFinalVenta
    }),
    eventosExtra: () => {
        const precioCompraInput = document.getElementById('producto-precio-compra')
        const ivaInput = document.getElementById('producto-iva')
        const precioFinalInput = document.getElementById('producto-precio-final')

        function calcularPrecioFinalSugerido() {
            if (!precioCompraInput || !ivaInput || !precioFinalInput || precioFinalInput.dataset.editado === 'true') {
                return
            }

            const precioCompra = normalizarNumero(precioCompraInput.value)
            const iva = normalizarNumero(ivaInput.value)

            if (!Number.isFinite(precioCompra) || !Number.isFinite(iva)) {
                precioFinalInput.value = ''
                return
            }

            precioFinalInput.value = (precioCompra * (1 + iva / 100)).toFixed(2)
        }

        precioCompraInput?.addEventListener('input', calcularPrecioFinalSugerido)
        ivaInput?.addEventListener('input', calcularPrecioFinalSugerido)
        precioFinalInput?.addEventListener('input', () => {
            precioFinalInput.dataset.editado = 'true'
        })
    },
    onAbrirFormulario: (item) => {
        const precioFinalInput = document.getElementById('producto-precio-final')

        if (precioFinalInput) {
            precioFinalInput.dataset.editado = item ? 'true' : 'false'
        }
    },
    onCerrarFormulario: () => {
        const precioFinalInput = document.getElementById('producto-precio-final')

        if (precioFinalInput) {
            precioFinalInput.dataset.editado = 'false'
        }
    }
})

export const init = controller.init
