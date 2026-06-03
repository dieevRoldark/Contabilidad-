
import {
    esEmailValido,
    limpiarRegistroPendiente,
    obtenerEmailRegistroPendiente,
    registrar,
    validarPassword
} from '../services/authService.js'
import { mostrarError, ocultarError, bloquearFormulario } from '../services/formHelpers.js'

export function init() {
    const form = document.getElementById('register-form')
    const nombreInput = document.getElementById('register-name')
    const emailInput = document.getElementById('register-email')
    const passwordInput = document.getElementById('register-password')
    const confirmInput = document.getElementById('register-confirm')
    const errorMessage = document.getElementById('register-error')
    const submitButton = form?.querySelector('button[type="submit"]')

    if (!form) {
        return
    }

    const emailPendiente = obtenerEmailRegistroPendiente()

    if (emailPendiente) {
        emailInput.value = emailPendiente
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault()

        const nombre = nombreInput.value.trim()
        const email = emailInput.value.trim()
        const password = passwordInput.value
        const confirmPassword = confirmInput.value

        ocultarError(errorMessage)

        if (nombre.length < 2) {
            mostrarError(errorMessage, 'Ingresa un nombre valido.')
            return
        }

        if (!esEmailValido(email)) {
            mostrarError(errorMessage, 'Ingresa un correo valido.')
            return
        }

        const validacionPassword = validarPassword(password)

        if (!validacionPassword.ok) {
            mostrarError(errorMessage, validacionPassword.mensaje)
            return
        }

        if (password !== confirmPassword) {
            mostrarError(errorMessage, 'Las contrasenas no coinciden.')
            return
        }

        bloquearFormulario(submitButton, true, 'Creando...')

        try {
            const resultado = await registrar({ nombre, email, password })

            if (!resultado.ok) {
                mostrarError(errorMessage, resultado.mensaje)
                return
            }

            limpiarRegistroPendiente()
            window.location.hash = 'inicio'
        } catch (error) {
            console.error('Error al registrar usuario:', error)
            mostrarError(errorMessage, 'No se pudo crear la cuenta. Intentalo de nuevo.')
        } finally {
            bloquearFormulario(submitButton, false, 'Crear cuenta')
        }
    })
}
