import { API_BASE, fetchApi } from './config.js'

export async function obtenerTodos() {
    return fetchApi(`${API_BASE}/ventas`)
}

export async function crear(datos) {
    return fetchApi(`${API_BASE}/ventas`, {
        method: 'POST',
        body: JSON.stringify(datos)
    })
}

export async function anular(id) {
    return fetchApi(`${API_BASE}/ventas/${id}/anular`, {
        method: 'PUT'
    })
}

export function calcularTotales(items) {
    let subtotal = 0
    let totalIva = 0

    for (const item of items) {
        const itemSubtotal = item.precio * item.cantidad
        const itemIva = (item.precioMasIva - item.precio) * item.cantidad
        subtotal += itemSubtotal
        totalIva += itemIva
    }

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        totalIva: Math.round(totalIva * 100) / 100,
        total: Math.round((subtotal + totalIva) * 100) / 100
    }
}
