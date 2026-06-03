import * as facturaService from '../services/facturaService.js'
import { normalizarNumero, formatearMoneda } from '../services/utils.js'

let facturas = []
let facturaActual = null
let modoPendientes = true

export async function init() {
    facturas = await facturaService.obtenerTodos()

    configurarFormularioItems()
    configurarTablaItems()
    configurarTablaPendientes()
    configurarBotones()
    mostrarFacturasPendientes()
}

function configurarBotones() {
    const btnNuevaFactura = document.getElementById('btn-nueva-factura')
    const btnPendientes = document.getElementById('btn-facturas-pendientes')

    btnNuevaFactura?.addEventListener('click', toggleFormularioFactura)
    btnPendientes?.addEventListener('click', mostrarFacturasPendientes)
}

function configurarFormularioItems() {
    const form = document.getElementById('factura-items-form')

    form?.addEventListener('submit', agregarProductoAFactura)
}

function configurarTablaItems() {
    const tbody = document.querySelector('#tabla-factura-items tbody')

    tbody?.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) {
            return
        }

        const boton = event.target.closest('button[data-action]')

        if (!boton) {
            return
        }

        const id = boton.dataset.id

        if (boton.dataset.action === 'editar') {
            editarItem(id)
        }

        if (boton.dataset.action === 'eliminar') {
            eliminarItem(id)
        }
    })
}

function configurarTablaPendientes() {
    const tbody = document.querySelector('#tabla-facturas-pendientes tbody')

    tbody?.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) {
            return
        }

        const boton = event.target.closest('button[data-action]')

        if (!boton) {
            return
        }

        const id = boton.dataset.id

        if (boton.dataset.action === 'ver') {
            verFactura(id)
        }

        if (boton.dataset.action === 'anular') {
            anularFactura(id)
        }
    })
}

function toggleFormularioFactura() {
    const infoWrapper = document.getElementById('factura-info-wrapper')
    const itemsWrapper = document.getElementById('factura-items-wrapper')
    const tablaItems = document.getElementById('tabla-factura-items')
    const btnPendientes = document.getElementById('btn-facturas-pendientes')

    if (!infoWrapper) {
        return
    }

    const estaOculto = infoWrapper.hidden

    if (estaOculto) {
        nuevaFactura()
        infoWrapper.hidden = false
        itemsWrapper.hidden = false

        if (tablaItems) {
            tablaItems.hidden = false
        }

        document.getElementById('factura-nit')?.focus()

        ocultarPendientes()
        if (btnPendientes) {
            btnPendientes.style.backgroundColor = ''
            btnPendientes.ariaPressed = 'false'
        }
    } else {
        infoWrapper.hidden = true

        if (itemsWrapper) {
            itemsWrapper.hidden = true
        }

        if (tablaItems) {
            tablaItems.hidden = true
        }

        facturaActual = null
        modoPendientes = true
        mostrarFacturasPendientes()
    }
}

function ocultarPendientes() {
    const wrapper = document.getElementById('facturas-pendientes-wrapper')

    if (wrapper) {
        wrapper.hidden = true
    }

    modoPendientes = false
}

function nuevaFactura() {
    facturaActual = {
        id: null,
        proveedorNit: '',
        proveedorNombre: '',
        numeroFactura: '',
        fecha: '',
        estado: 'pendiente',
        items: [],
        subtotal: 0,
        totalIva: 0,
        total: 0,
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString()
    }

    const infoForm = document.getElementById('factura-info-form')
    const itemsForm = document.getElementById('factura-items-form')

    infoForm?.reset()
    itemsForm?.reset()
    limpiarMensaje()
    cargarTablaItems()
}

async function agregarProductoAFactura(event) {
    event.preventDefault()

    if (!facturaActual) {
        mostrarMensaje('Debes iniciar una nueva factura primero.', 'error')
        return
    }

    const form = event.currentTarget
    const item = obtenerItemDesdeFormulario(form)

    if (!item.ok) {
        mostrarMensaje(item.mensaje, 'error')
        return
    }

    if (item.data.id) {
        facturaActual.items = facturaActual.items.map((i) => i.id === item.data.id ? { ...i, ...item.data } : i)
        mostrarMensaje('Producto actualizado en la factura.', 'success')
    } else {
        const nuevoItem = {
            ...item.data,
            id: crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}`
        }

        facturaActual.items.push(nuevoItem)
        mostrarMensaje('Producto agregado a la factura.', 'success')
    }

    facturaActual.actualizadoEn = new Date().toISOString()
    const totales = facturaService.calcularTotales(facturaActual.items)

    facturaActual.subtotal = totales.subtotal
    facturaActual.totalIva = totales.totalIva
    facturaActual.total = totales.total

    cargarTablaItems()
    form.reset()
    document.getElementById('factura-codigo')?.focus()
}

function obtenerItemDesdeFormulario(form) {
    const formData = new FormData(form)
    const id = formData.get('itemId')?.trim() || ''
    const codigo = formData.get('codigo')?.trim() || ''
    const productoNombre = formData.get('productoNombre')?.trim() || ''
    const iva = normalizarNumero(formData.get('iva'))
    const costo = normalizarNumero(formData.get('costo'))
    const cantidad = parseInt(formData.get('cantidad'), 10) || 1

    if (!codigo && !productoNombre) {
        return { ok: false, mensaje: 'Ingresa el codigo o el nombre del producto.' }
    }

    if (!Number.isFinite(costo) || costo <= 0) {
        return { ok: false, mensaje: 'Ingresa un costo valido.' }
    }

    if (!Number.isFinite(iva) || iva < 0) {
        return { ok: false, mensaje: 'Ingresa un IVA valido.' }
    }

    if (cantidad < 1) {
        return { ok: false, mensaje: 'Ingresa una cantidad valida.' }
    }

    const costoMasIva = costo * (1 + iva / 100)

    return {
        ok: true,
        data: {
            id,
            codigo: codigo || '—',
            nombre: productoNombre,
            cantidad,
            costo,
            iva,
            costoMasIva: Math.round(costoMasIva * 100) / 100
        }
    }
}

function editarItem(id) {
    if (!facturaActual) {
        return
    }

    const item = facturaActual.items.find((i) => i.id === id)

    if (!item) {
        mostrarMensaje('No se encontro el producto seleccionado.', 'error')
        return
    }

    const form = document.getElementById('factura-items-form')

    if (!form) {
        return
    }

    form.elements.itemId.value = item.id
    form.elements.codigo.value = item.codigo === '—' ? '' : item.codigo
    form.elements.productoNombre.value = item.nombre
    form.elements.iva.value = item.iva
    form.elements.costo.value = item.costo
    form.elements.cantidad.value = item.cantidad
    document.getElementById('factura-codigo')?.focus()
    mostrarMensaje('Editando producto. Actualiza los campos y presiona Agregar Producto.', 'info')
}

function eliminarItem(id) {
    if (!facturaActual) {
        return
    }

    const item = facturaActual.items.find((i) => i.id === id)

    if (!item) {
        mostrarMensaje('No se encontro el producto seleccionado.', 'error')
        return
    }

    const confirmaEliminar = confirm(`Deseas eliminar "${item.nombre || 'Producto'}" de la factura?`)

    if (!confirmaEliminar) {
        return
    }

    facturaActual.items = facturaActual.items.filter((i) => i.id !== id)
    facturaActual.actualizadoEn = new Date().toISOString()

    const totales = facturaService.calcularTotales(facturaActual.items)

    facturaActual.subtotal = totales.subtotal
    facturaActual.totalIva = totales.totalIva
    facturaActual.total = totales.total

    cargarTablaItems()
    mostrarMensaje('Producto eliminado de la factura.', 'success')
}

function cargarTablaItems() {
    const tbody = document.querySelector('#tabla-factura-items tbody')

    if (!tbody) {
        return
    }

    tbody.innerHTML = ''

    if (!facturaActual || facturaActual.items.length === 0) {
        const filaVacia = document.createElement('tr')
        const celdaVacia = document.createElement('td')

        celdaVacia.colSpan = 8
        celdaVacia.textContent = 'No hay productos agregados a esta factura.'
        filaVacia.append(celdaVacia)
        tbody.append(filaVacia)
        return
    }

    for (const item of facturaActual.items) {
        const fila = document.createElement('tr')

        agregarCelda(fila, item.codigo)
        agregarCelda(fila, item.nombre)
        agregarCelda(fila, String(item.cantidad))
        agregarCelda(fila, formatearMoneda(item.costo))
        agregarCelda(fila, `${item.iva}%`)
        agregarCelda(fila, formatearMoneda(item.costoMasIva))
        agregarCeldaAccion(fila, 'editar', item.id, 'Editar')
        agregarCeldaAccion(fila, 'eliminar', item.id, 'Borrar')

        tbody.append(fila)
    }

    if (facturaActual.items.length > 0) {
        const filaTotal = document.createElement('tr')
        const celdaLabel = document.createElement('td')

        celdaLabel.colSpan = 7
        celdaLabel.style.textAlign = 'right'
        celdaLabel.style.fontWeight = 'bold'
        celdaLabel.textContent = `Total: ${formatearMoneda(facturaActual.total)}`

        const celdaAccion = document.createElement('td')
        const btnFinalizar = document.createElement('button')

        btnFinalizar.className = 'main__button-all'
        btnFinalizar.style.backgroundColor = 'rgb(34, 167, 63)'
        btnFinalizar.type = 'button'
        btnFinalizar.textContent = 'Finalizar'
        btnFinalizar.addEventListener('click', finalizarFactura)

        celdaAccion.append(btnFinalizar)
        filaTotal.append(celdaLabel, celdaAccion)
        tbody.append(filaTotal)
    }
}

async function finalizarFactura() {
    if (!facturaActual || facturaActual.items.length === 0) {
        mostrarMensaje('Agrega al menos un producto antes de finalizar la factura.', 'error')
        return
    }

    const infoForm = document.getElementById('factura-info-form')

    if (!infoForm) {
        return
    }

    const nit = infoForm.elements.nit.value?.trim() || ''
    const proveedorNombre = infoForm.elements.proveedorNombre.value?.trim() || ''
    const numeroFactura = infoForm.elements.numeroFactura.value?.trim() || ''
    const fecha = infoForm.elements.fecha.value?.trim() || ''

    if (!nit || !proveedorNombre) {
        mostrarMensaje('Ingresa el nit y el nombre del proveedor.', 'error')
        return
    }

    facturaActual.proveedorNit = nit
    facturaActual.proveedorNombre = proveedorNombre
    facturaActual.numeroFactura = numeroFactura
    facturaActual.fecha = fecha

    const confirmaFinalizar = confirm(`Finalizar factura de ${proveedorNombre} por ${formatearMoneda(facturaActual.total)}?`)

    if (!confirmaFinalizar) {
        return
    }

    try {
        facturaActual.estado = 'completada'
        facturaActual.actualizadoEn = new Date().toISOString()

        const creada = await facturaService.crear(facturaActual)

        facturas = await facturaService.obtenerTodos()

        facturaActual = null
        const infoWrapper = document.getElementById('factura-info-wrapper')

        if (infoWrapper) {
            infoWrapper.hidden = true
        }

        const itemsWrapper = document.getElementById('factura-items-wrapper')

        if (itemsWrapper) {
            itemsWrapper.hidden = true
        }

        const tablaItems = document.getElementById('tabla-factura-items')

        if (tablaItems) {
            tablaItems.hidden = true
        }

        mostrarMensaje(`Factura finalizada por ${formatearMoneda(creada.total)}.`, 'success')

        modoPendientes = true
        mostrarFacturasPendientes()
    } catch (error) {
        mostrarMensaje(error.message, 'error')
    }
}

function mostrarFacturasPendientes() {
    const infoWrapper = document.getElementById('factura-info-wrapper')
    const itemsWrapper = document.getElementById('factura-items-wrapper')
    const pendientesWrapper = document.getElementById('facturas-pendientes-wrapper')
    const tablaItems = document.getElementById('tabla-factura-items')
    const btnPendientes = document.getElementById('btn-facturas-pendientes')
    const btnNuevaFactura = document.getElementById('btn-nueva-factura')

    if (infoWrapper) {
        infoWrapper.hidden = true
    }

    if (itemsWrapper) {
        itemsWrapper.hidden = true
    }

    if (tablaItems) {
        tablaItems.hidden = true
    }

    if (pendientesWrapper) {
        pendientesWrapper.hidden = false
    }

    if (btnPendientes) {
        btnPendientes.style.backgroundColor = 'rgb(34, 167, 63)'
        btnPendientes.ariaPressed = 'true'
    }

    if (btnNuevaFactura) {
        btnNuevaFactura.textContent = 'Nueva factura'
    }

    modoPendientes = true
    facturaActual = null

    const tbody = document.querySelector('#tabla-facturas-pendientes tbody')

    if (!tbody) {
        return
    }

    tbody.innerHTML = ''

    const pendientes = facturas.filter((f) => f.estado === 'pendiente')

    if (pendientes.length === 0) {
        const filaVacia = document.createElement('tr')
        const celdaVacia = document.createElement('td')

        celdaVacia.colSpan = 7
        celdaVacia.textContent = 'No hay facturas pendientes.'
        filaVacia.append(celdaVacia)
        tbody.append(filaVacia)
        return
    }

    for (const factura of pendientes) {
        const fila = document.createElement('tr')
        const fecha = factura.fecha || new Date(factura.creadoEn).toLocaleDateString('es-CO')

        agregarCelda(fila, fecha)
        agregarCelda(fila, factura.numeroFactura || '—')
        agregarCelda(fila, factura.proveedorNombre)
        agregarCelda(fila, String(factura.items.length))
        agregarCelda(fila, formatearMoneda(factura.total))
        agregarCeldaAccion(fila, 'ver', factura.id, 'Ver')
        agregarCeldaAccion(fila, 'anular', factura.id, 'Anular')

        tbody.append(fila)
    }
}

function verFactura(id) {
    const factura = facturas.find((f) => f.id === id)

    if (!factura) {
        mostrarMensaje('No se encontro la factura seleccionada.', 'error')
        return
    }

    facturaActual = { ...factura, items: factura.items.map((i) => ({ ...i })) }

    const pendientesWrapper = document.getElementById('facturas-pendientes-wrapper')
    const tablaItems = document.getElementById('tabla-factura-items')
    const infoWrapper = document.getElementById('factura-info-wrapper')
    const itemsWrapper = document.getElementById('factura-items-wrapper')

    if (pendientesWrapper) {
        pendientesWrapper.hidden = true
    }

    if (tablaItems) {
        tablaItems.hidden = false
    }

    if (infoWrapper) {
        infoWrapper.hidden = false
    }

    if (itemsWrapper) {
        itemsWrapper.hidden = false
    }

    const infoForm = document.getElementById('factura-info-form')

    if (infoForm) {
        infoForm.elements.nit.value = factura.proveedorNit || ''
        infoForm.elements.proveedorNombre.value = factura.proveedorNombre || ''
        infoForm.elements.numeroFactura.value = factura.numeroFactura || ''
        infoForm.elements.fecha.value = factura.fecha || ''
    }

    const btnPendientes = document.getElementById('btn-facturas-pendientes')

    if (btnPendientes) {
        btnPendientes.style.backgroundColor = ''
        btnPendientes.ariaPressed = 'false'
    }

    modoPendientes = false
    cargarTablaItems()
    mostrarMensaje('Editando factura pendiente. Agrega o modifica productos.', 'info')
}

async function anularFactura(id) {
    const factura = facturas.find((f) => f.id === id)

    if (!factura) {
        mostrarMensaje('No se encontro la factura seleccionada.', 'error')
        return
    }

    const confirmaAnular = confirm(`Deseas anular la factura de ${factura.proveedorNombre} por ${formatearMoneda(factura.total)}?`)

    if (!confirmaAnular) {
        return
    }

    try {
        await facturaService.anular(id)
        facturas = await facturaService.obtenerTodos()
        mostrarFacturasPendientes()
        mostrarMensaje('Factura anulada correctamente.', 'success')
    } catch (error) {
        mostrarMensaje(error.message, 'error')
    }
}

function agregarCelda(fila, valor) {
    const celda = document.createElement('td')

    celda.textContent = valor
    fila.append(celda)
}

function agregarCeldaAccion(fila, accion, id, texto) {
    const celda = document.createElement('td')
    const boton = document.createElement('button')

    boton.className = `product__action-button product__action-button--${accion}`
    boton.type = 'button'
    boton.dataset.action = accion
    boton.dataset.id = id
    boton.textContent = texto
    boton.setAttribute('aria-label', `${texto} factura`)

    celda.append(boton)
    fila.append(celda)
}

function mostrarMensaje(mensaje, tipo) {
    const mensajeElemento = document.getElementById('factura-form-mensaje')

    if (!mensajeElemento) {
        return
    }

    mensajeElemento.textContent = mensaje
    mensajeElemento.dataset.type = tipo
}

function limpiarMensaje() {
    const mensajeElemento = document.getElementById('factura-form-mensaje')

    if (!mensajeElemento) {
        return
    }

    mensajeElemento.textContent = ''
    delete mensajeElemento.dataset.type
}
