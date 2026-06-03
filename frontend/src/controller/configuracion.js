import * as configuracionService from '../services/configuracionService.js'

let config = null

export async function init() {
    try {
        config = await configuracionService.obtener()
    } catch {
        config = null
    }

    poblarFormulario(config)
    configurarBotonGuardar()
}

function configurarBotonGuardar() {
    const btn = document.getElementById('btn-guardar-config')
    btn?.addEventListener('click', guardarConfig)
}

function poblarFormulario(config) {
    if (!config) return

    const reportes = config.reportes || {}
    const notificaciones = config.notificaciones || {}

    if (Array.isArray(reportes.tipo)) {
        document.querySelectorAll('input[name="tipo-reporte"]').forEach(el => {
            el.checked = reportes.tipo.includes(el.value)
        })
    }

    if (reportes.frecuencia) {
        const radio = document.querySelector(`input[name="frecuencia"][value="${reportes.frecuencia}"]`)
        if (radio) radio.checked = true
    }

    if (reportes.formato) {
        const select = document.getElementById('formato-reportes')
        if (select) select.value = reportes.formato
    }

    if (notificaciones.frecuencia) {
        const select = document.getElementById('frecuencia-notificaciones')
        if (select) select.value = notificaciones.frecuencia
    }

    if (Array.isArray(notificaciones.canales)) {
        document.querySelectorAll('input[name="canal-notificacion"]').forEach(el => {
            el.checked = notificaciones.canales.includes(el.value)
        })
    }
}

async function guardarConfig() {
    const tipoReportes = []
    document.querySelectorAll('input[name="tipo-reporte"]:checked').forEach(el => {
        tipoReportes.push(el.value)
    })

    const frecuencia = document.querySelector('input[name="frecuencia"]:checked')?.value || 'diario'

    const formato = document.getElementById('formato-reportes')?.value || 'pdf'

    const frecuenciaNotif = document.getElementById('frecuencia-notificaciones')?.value || 'diario'

    const canales = []
    document.querySelectorAll('input[name="canal-notificacion"]:checked').forEach(el => {
        canales.push(el.value)
    })

    const datos = {
        reportes: {
            tipo: tipoReportes,
            frecuencia,
            formato
        },
        notificaciones: {
            frecuencia: frecuenciaNotif,
            canales
        }
    }

    try {
        config = await configuracionService.guardar(datos)
        poblarFormulario(config)
        mostrarMensaje('Configuración guardada correctamente.', 'success')
    } catch (error) {
        mostrarMensaje(error.message || 'Error al guardar la configuración.', 'error')
    }
}

let timeoutId = null

function mostrarMensaje(mensaje, tipo) {
    const mensajeElemento = document.getElementById('config-mensaje')
    if (!mensajeElemento) return

    if (timeoutId) {
        clearTimeout(timeoutId)
    }

    mensajeElemento.textContent = mensaje
    mensajeElemento.dataset.type = tipo

    timeoutId = setTimeout(() => {
        mensajeElemento.textContent = ''
        delete mensajeElemento.dataset.type
        timeoutId = null
    }, 4000)
}
