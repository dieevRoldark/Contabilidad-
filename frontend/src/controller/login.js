
import { esEmailValido, guardarEmailRegistroPendiente, login } from '../services/authService.js'
import { mostrarError, ocultarError, bloquearFormulario } from '../services/formHelpers.js'

export function init() {
    const form = document.getElementById('login-form')
    const emailInput = document.getElementById('email')
    const passwordInput = document.getElementById('password')
    const errorMessage = document.getElementById('login-error')
    const registerLink = document.getElementById('go-register')
    const submitButton = form?.querySelector('button[type="submit"]')

    if (!form) {
        return
    }

    registerLink?.addEventListener('click', () => {
        const email = emailInput.value.trim()

        if (esEmailValido(email)) {
            guardarEmailRegistroPendiente(email)
        }
    })

    form.addEventListener('submit', async (event) => {
        event.preventDefault()

        const email = emailInput.value.trim()
        const password = passwordInput.value

        ocultarError(errorMessage)

        if (!esEmailValido(email)) {
            mostrarError(errorMessage, 'Ingresa un correo valido.')
            return
        }

        bloquearFormulario(submitButton, true, 'Ingresando...')

        try {
            const resultado = await login(email, password)

            if (resultado.motivo === 'NO_REGISTRADO') {
                guardarEmailRegistroPendiente(email)
                window.location.hash = 'registro'
                return
            }

            if (!resultado.ok) {
                mostrarError(errorMessage, resultado.mensaje)
                return
            }

            window.location.hash = 'inicio'
        } catch (error) {
            console.error('Error al iniciar sesion:', error)
            mostrarError(errorMessage, 'No se pudo iniciar sesion. Intentalo de nuevo.')
        } finally {
            bloquearFormulario(submitButton, false, 'Login')
        }
    })
}
