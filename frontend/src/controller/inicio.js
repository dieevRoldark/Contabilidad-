import { API_BASE, fetchApi } from '../services/config.js'
import * as configuracionService from '../services/configuracionService.js'


export async function init() {
    const config = await cargarConfig()
    aplicarConfiguracion(config)
    cargarDatosDashboard(config)
    configurarBotones()
}

function configurarBotones() {
    document.getElementById('btn-nueva-venta-dashboard')?.addEventListener('click', () => {
        window.location.hash = 'ventas'
    })
}

async function cargarConfig() {
    try {
        return await configuracionService.obtener()
    } catch {
        return null
    }
}

function aplicarConfiguracion(config) {
    const reportes = config?.reportes || { tipo: ['ventas', 'compras', 'facturas'], formato: 'pdf', frecuencia: 'diario' }
    const notificaciones = config?.notificaciones || { canales: [] }
    const tipoReportes = reportes.tipo || ['ventas', 'compras', 'facturas']

     const mapaTarjetas = {
         ventas: 'card-ventas',
         compras: 'card-compras',
         inventario: 'card-estadisticas',
         clientes: 'card-clientes',
         proveedores: 'card-proveedores',
         facturas: 'card-facturas'
     }

    for (const [key, cardId] of Object.entries(mapaTarjetas)) {
        const card = document.getElementById(cardId)
        if (card) {
            card.style.display = tipoReportes.includes(key) ? '' : 'none'
        }
    }

    const etiquetaPeriodo = {
        diario: 'Hoy',
        semanal: 'Esta semana',
        mensual: 'Este mes'
    }

    const periodo = etiquetaPeriodo[reportes.frecuencia] || 'Hoy'

    const spanVentasPeriodo = document.getElementById('ventas-periodo')
    if (spanVentasPeriodo) spanVentasPeriodo.textContent = periodo

    const spanComprasPeriodo = document.getElementById('compras-periodo')
    if (spanComprasPeriodo) spanComprasPeriodo.textContent = periodo

    const btnImportar = document.getElementById('btn-importar')
    if (btnImportar) {
        const label = (reportes.formato || 'pdf').toUpperCase()
        const svg = btnImportar.querySelector('svg')
        btnImportar.textContent = ''
        if (svg) btnImportar.append(svg)
        btnImportar.append(` Importar ${label}`)
    }

    if (Array.isArray(notificaciones.canales) && notificaciones.canales.length > 0) {
        const contenedor = document.getElementById('dashboard-canales')
        if (contenedor) {
            const etiquetas = { correo: 'Correo', sms: 'SMS', push: 'Push' }
            contenedor.textContent = ''
            for (const canal of notificaciones.canales) {
                const badge = document.createElement('span')
                badge.className = 'canal-badge'
                badge.textContent = etiquetas[canal] || canal
                contenedor.append(badge)
            }
        }
    }

    const subtitle = document.getElementById('dashboard-subtitle')
    if (subtitle) {
        const partes = tipoReportes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')
        subtitle.textContent = `Mostrando: ${partes} · ${periodo}`
    }
}

async function cargarDatosDashboard(config) {
    const reportes = config?.reportes?.tipo || ['ventas', 'compras', 'facturas']

    try {
        const [ventas, facturas, clientes, proveedores] = await Promise.all([
            reportes.includes('ventas') ? fetchApi(`${API_BASE}/ventas`).catch(() => []) : [],
            reportes.includes('compras') || reportes.includes('facturas') ? fetchApi(`${API_BASE}/facturas`).catch(() => []) : [],
            reportes.includes('clientes') ? fetchApi(`${API_BASE}/clientes`).catch(() => []) : [],
            reportes.includes('proveedores') ? fetchApi(`${API_BASE}/proveedores`).catch(() => []) : []
        ])

        if (Array.isArray(ventas)) {
            const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total || 0), 0)
            actualizarValor('ventas-totales-valor', formatearMoneda(totalVentas))
        }

        if (Array.isArray(facturas)) {
            const pendientes = facturas.filter(f => f.estado === 'pendiente')
            actualizarValor('facturas-pendientes-valor', String(pendientes.length))

            const totalCompras = facturas.reduce((sum, f) => sum + Number(f.total || 0), 0)
            actualizarValor('compras-totales-valor', formatearMoneda(totalCompras))
        }

        if (Array.isArray(clientes)) {
            actualizarValor('clientes-totales-valor', String(clientes.length))
        }

        if (Array.isArray(proveedores)) {
            actualizarValor('proveedores-totales-valor', String(proveedores.length))
        }
    } catch {
    }
}

function actualizarValor(id, valor) {
    const el = document.getElementById(id)
    if (el) el.textContent = valor
}

function formatearMoneda(valor) {
    try {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(valor)
    } catch {
        return `$${valor.toLocaleString()}`
    }
}
