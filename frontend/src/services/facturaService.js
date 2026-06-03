import { API_BASE, fetchApi } from './config.js'

export async function obtenerTodos() {
    return fetchApi(`${API_BASE}/facturas`)
}

export async function crear(datos) {
    return fetchApi(`${API_BASE}/facturas`, {
        method: 'POST',
        body: JSON.stringify(datos)
    })
}

export async function anular(id) {
    return fetchApi(`${API_BASE}/facturas/${id}/anular`, {
        method: 'PUT'
    })
}

export function calcularTotales(items) {
    let subtotal = 0
    let totalIva = 0

    for (const item of items) {
        const itemSubtotal = item.costo * item.cantidad
        const itemIva = (item.costo * (item.iva / 100)) * item.cantidad
        subtotal += itemSubtotal
        totalIva += itemIva
    }

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        totalIva: Math.round(totalIva * 100) / 100,
        total: Math.round((subtotal + totalIva) * 100) / 100
    }
}
