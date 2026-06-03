export function calcularTotales(items, options = {}) {
    const {
        precioField = 'precio',
        cantidadField = 'cantidad',
        tipoIva = 'diferencia',
        campoIva = 'precioMasIva',
    } = options

    let subtotal = 0
    let totalIva = 0

    for (const item of items) {
        const precio = item[precioField] ?? 0
        const cantidad = item[cantidadField] ?? 0
        const itemSubtotal = precio * cantidad

        let itemIva = 0
        if (tipoIva === 'diferencia') {
            const precioConIva = item[campoIva] ?? 0
            itemIva = (precioConIva - precio) * cantidad
        } else {
            const porcentaje = item[campoIva] ?? 0
            itemIva = (precio * (porcentaje / 100)) * cantidad
        }

        subtotal += itemSubtotal
        totalIva += itemIva
    }

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        totalIva: Math.round(totalIva * 100) / 100,
        total: Math.round((subtotal + totalIva) * 100) / 100,
    }
}
