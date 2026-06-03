export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizarNumero(valor) {
    if (typeof valor !== 'string') {
        return Number(valor)
    }
    return Number(valor.replace(',', '.'))
}

export function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 2
    }).format(valor)
}

export function formatearNumero(valor) {
    return new Intl.NumberFormat('es-CO', {
        maximumFractionDigits: 2
    }).format(valor)
}

export function esEmailValido(email) {
    return EMAIL_REGEX.test(email)
}

export function obtenerTextoFormulario(formData, campo) {
    const valor = formData.get(campo)
    return typeof valor === 'string' ? valor.trim() : ''
}

export function crearId() {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
