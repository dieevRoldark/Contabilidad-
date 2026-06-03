import { cifrarHibridoConClave, obtenerClavePublicaServidor } from '../../services/cryptoService.js'

export function crearCrudController(service, config) {
    const {
        prefijoEntidad,
        nombreEntidad,
        pluralEntidad,
        campoBusqueda,
        columnasTabla,
        obtenerDatosFormulario,
        obtenerDatosCifrado,
        eventosExtra = null,
        onAbrirFormulario = null,
        onCerrarFormulario = null
    } = config

    const colSpanTotal = columnasTabla.length + 2
    const nombreCapitalizado = nombreEntidad.charAt(0).toUpperCase() + nombreEntidad.slice(1)

    let items = []

    async function init() {
        try {
            items = await service.obtenerTodos()
        } catch {
            items = []
        }

        try {
            configurarFormulario()
            configurarTabla()
            cargarTabla()
        } catch (e) {
            console.error(`Error en init() de ${prefijoEntidad}:`, e)
        }

        const mensaje = document.getElementById(`${prefijoEntidad}-form-mensaje`)
        if (mensaje && items.length === 0 && !mensaje.dataset.type) {
            mensaje.textContent = `No se pudieron cargar los ${pluralEntidad}. Verifica la conexion.`
            mensaje.dataset.type = 'error'
        }
    }

    function configurarFormulario() {
        const btnNuevo = document.getElementById(`btn-nuevo-${prefijoEntidad}`)
        const btnCancelar = document.getElementById(`btn-cancelar-${prefijoEntidad}`)
        const form = document.getElementById(`${prefijoEntidad}-form`)

        if (btnNuevo) {
            btnNuevo.addEventListener('click', () => abrirFormulario())
        } else {
            console.warn(`Botón nuevo no encontrado para ${prefijoEntidad}`)
        }

        if (btnCancelar) {
            btnCancelar.addEventListener('click', cerrarFormulario)
        } else {
            console.warn(`Botón cancelar no encontrado para ${prefijoEntidad}`)
        }

        if (form) {
            form.addEventListener('submit', guardarDesdeFormulario)
        } else {
            console.warn(`Formulario no encontrado para ${prefijoEntidad}`)
        }

        if (eventosExtra) {
            eventosExtra()
        }
    }

    function configurarTabla() {
        const tbody = document.querySelector(`#tabla-${pluralEntidad} tbody`)

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
                editar(id)
            }

            if (boton.dataset.action === 'eliminar') {
                eliminar(id)
            }
        })
    }

    async function guardarDesdeFormulario(event) {
        event.preventDefault()

        const form = event.currentTarget
        const resultado = obtenerDatosFormulario(form)

        if (!resultado.ok) {
            mostrarMensaje(resultado.mensaje, 'error')
            return
        }

        try {
            let payload = { ...resultado.data }

            if (obtenerDatosCifrado) {
                const datosSensibles = obtenerDatosCifrado(resultado.data)
                const clavePublica = await obtenerClavePublicaServidor()
                const paqueteCifrado = await cifrarHibridoConClave(datosSensibles, clavePublica)

                for (const clave of Object.keys(datosSensibles)) {
                    delete payload[clave]
                }

                payload._cifrado = paqueteCifrado
            }

            if (payload.id) {
                await service.actualizar(payload.id, payload)
                mostrarMensaje(`${nombreCapitalizado} actualizado correctamente.`, 'success')
            } else {
                await service.crear(payload)
                mostrarMensaje(`${nombreCapitalizado} guardado correctamente.`, 'success')
            }

            items = await service.obtenerTodos()
            cargarTabla()
            cerrarFormulario()

            const guardado = items.find((item) => item[campoBusqueda] === resultado.data[campoBusqueda])
        } catch (error) {
            mostrarMensaje(error.message, 'error')
        }
    }

    function abrirFormulario(item = null) {
        const wrapper = document.getElementById(`${prefijoEntidad}-form-wrapper`)
        const form = document.getElementById(`${prefijoEntidad}-form`)
        const titulo = document.getElementById(`${prefijoEntidad}-form-titulo`)
        const submitButton = document.getElementById(`btn-guardar-${prefijoEntidad}`)

        if (!wrapper || !form || !titulo || !submitButton) {
            return
        }

        form.reset()
        limpiarMensaje()

        if (item) {
            const formElements = form.elements
            if (formElements.id) {
                formElements.id.value = item.id || ''
            }
            for (const col of columnasTabla) {
                if (formElements[col.clave]) {
                    formElements[col.clave].value = item[col.clave] ?? ''
                }
            }
            titulo.textContent = `Editar ${nombreEntidad}`
            submitButton.textContent = `Actualizar ${nombreEntidad}`
        } else {
            if (form.elements.id) {
                form.elements.id.value = ''
            }
            titulo.textContent = `Nuevo ${nombreEntidad}`
            submitButton.textContent = `Guardar ${nombreEntidad}`
        }

        wrapper.hidden = false

        if (onAbrirFormulario) {
            onAbrirFormulario(item)
        }
    }

    function cerrarFormulario() {
        const wrapper = document.getElementById(`${prefijoEntidad}-form-wrapper`)
        const form = document.getElementById(`${prefijoEntidad}-form`)

        form?.reset()
        limpiarMensaje()

        if (onCerrarFormulario) {
            onCerrarFormulario()
        }

        if (wrapper) {
            wrapper.hidden = true
        }
    }

    function editar(id) {
        const item = items.find((item) => item.id === id)

        if (!item) {
            mostrarMensaje(`No se encontro el ${nombreEntidad} seleccionado.`, 'error')
            return
        }

        abrirFormulario(item)
    }

    async function eliminar(id) {
        const item = items.find((item) => item.id === id)

        if (!item) {
            mostrarMensaje(`No se encontro el ${nombreEntidad} seleccionado.`, 'error')
            return
        }

        const confirmaEliminar = confirm(`Deseas eliminar el ${nombreEntidad} "${item.nombre}"?`)

        if (!confirmaEliminar) {
            return
        }

        try {
            await service.eliminar(id)
            items = await service.obtenerTodos()
            cargarTabla()
            cerrarFormulario()
            mostrarMensaje(`${nombreCapitalizado} eliminado correctamente.`, 'success')
        } catch (error) {
            mostrarMensaje(error.message, 'error')
        }
    }

    function cargarTabla() {
        const tbody = document.querySelector(`#tabla-${pluralEntidad} tbody`)

        if (!tbody) {
            return
        }

        tbody.innerHTML = ''

        if (items.length === 0) {
            const filaVacia = document.createElement('tr')
            const celdaVacia = document.createElement('td')

            celdaVacia.colSpan = colSpanTotal
            celdaVacia.textContent = `No hay ${pluralEntidad} registrados.`
            filaVacia.append(celdaVacia)
            tbody.append(filaVacia)
            return
        }

        items.forEach((item) => {
            const fila = document.createElement('tr')

            for (const col of columnasTabla) {
                const celda = document.createElement('td')
                const valor = item[col.clave]
                celda.textContent = col.formato ? col.formato(valor) : (valor ?? '')
                fila.append(celda)
            }

            agregarCeldaAccion(fila, 'editar', item.id, 'Editar')
            agregarCeldaAccion(fila, 'eliminar', item.id, 'Borrar')

            tbody.append(fila)
        })
    }

    function agregarCeldaAccion(fila, accion, id, texto) {
        const celda = document.createElement('td')
        const boton = document.createElement('button')

        boton.className = `product__action-button product__action-button--${accion}`
        boton.type = 'button'
        boton.dataset.action = accion
        boton.dataset.id = id
        boton.textContent = texto
        boton.setAttribute('aria-label', `${texto} ${nombreEntidad}`)

        celda.append(boton)
        fila.append(celda)
    }



    function mostrarMensaje(mensaje, tipo) {
        const mensajeElemento = document.getElementById(`${prefijoEntidad}-form-mensaje`)

        if (!mensajeElemento) {
            return
        }

        mensajeElemento.textContent = mensaje
        mensajeElemento.dataset.type = tipo
    }

    function limpiarMensaje() {
        const mensajeElemento = document.getElementById(`${prefijoEntidad}-form-mensaje`)

        if (!mensajeElemento) {
            return
        }

        mensajeElemento.textContent = ''
        delete mensajeElemento.dataset.type
    }

    return { init }
}
