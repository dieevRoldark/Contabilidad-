export function mostrarError(elemento, mensaje) {
    if (!elemento) {
        return
    }

    elemento.textContent = mensaje
    elemento.hidden = false
}

export function ocultarError(elemento) {
    if (!elemento) {
        return
    }

    elemento.textContent = ''
    elemento.hidden = true
}

export function bloquearFormulario(boton, bloqueado, textoAlterno = null) {
    if (!boton) {
        return
    }

    boton.disabled = bloqueado

    if (textoAlterno !== null) {
        boton.textContent = textoAlterno
    }
}
