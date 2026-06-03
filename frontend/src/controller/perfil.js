import * as perfilService from '../services/perfilService.js'
import { EMAIL_REGEX } from '../services/utils.js'

const FOTO_DEFAULT = 'public/img/profile-img.jpg'

let perfil = null

export async function init() {
    perfil = await perfilService.obtener()
    poblarFormularios(perfil)
    configurarFormularios()
    configurarFoto()
}

function configurarFormularios() {
    const formPersonal = document.getElementById('form-info-personal')
    const formNegocio = document.getElementById('form-info-negocio')

    formPersonal?.addEventListener('submit', guardarInfoPersonal)
    formNegocio?.addEventListener('submit', guardarInfoNegocio)
}

function configurarFoto() {
    const btnCambiar = document.querySelector('.perfil__button button[aria-label="Cambiar foto de perfil"]')
    const btnRemover = document.querySelector('.perfil__button button[aria-label="Remover foto de perfil"]')
    const inputFoto = document.getElementById('perfil-foto-input')

    btnCambiar?.addEventListener('click', () => inputFoto?.click())
    btnRemover?.addEventListener('click', removerFoto)
    inputFoto?.addEventListener('change', cambiarFoto)
}

async function guardarInfoPersonal(event) {
    event.preventDefault()

    const form = event.currentTarget
    const datos = obtenerDatosFormulario(form, ['nombre', 'telefono', 'email', 'direccion'])

    if (!datos.nombre) {
        mostrarMensaje('Ingresa tu nombre.', 'error')
        return
    }

    if (datos.email && !EMAIL_REGEX.test(datos.email)) {
        mostrarMensaje('Ingresa un correo valido.', 'error')
        return
    }

    try {
        await perfilService.guardar({ personal: datos })
        perfil = await perfilService.obtener()
        poblarEncabezado(perfil)
        mostrarMensaje('Informacion personal guardada correctamente.', 'success')
    } catch (error) {
        mostrarMensaje(error.message, 'error')
    }
}

async function guardarInfoNegocio(event) {
    event.preventDefault()

    const form = event.currentTarget
    const datos = obtenerDatosFormulario(form, ['nombre-negocio', 'tipo-negocio', 'ubicacion-negocio', 'fecha-creacion'])

    try {
        await perfilService.guardar({ negocio: datos })
        perfil = await perfilService.obtener()
        poblarEncabezado(perfil)
        mostrarMensaje('Informacion del negocio guardada correctamente.', 'success')
    } catch (error) {
        mostrarMensaje(error.message, 'error')
    }
}

function poblarFormularios(perfil) {
    if (!perfil) return

    poblarFormulario('form-info-personal', perfil.personal)
    poblarFormulario('form-info-negocio', perfil.negocio)
    poblarEncabezado(perfil)

    if (perfil.foto) {
        const img = document.getElementById('perfil-foto-img')
        if (img) img.src = perfil.foto
    }
}

function poblarEncabezado(perfil) {
    if (!perfil) return

    const h3 = document.querySelector('.perfil-description h3')
    const p = document.querySelector('.perfil-description p')

    if (h3 && perfil.negocio?.['nombre-negocio']) {
        h3.textContent = perfil.negocio['nombre-negocio']
    }

    if (p && perfil.negocio?.['tipo-negocio']) {
        p.textContent = perfil.negocio['tipo-negocio']
    }
}

function poblarFormulario(formId, datos) {
    const form = document.getElementById(formId)
    if (!form || !datos) return

    for (const [nombre, valor] of Object.entries(datos)) {
        const input = form.elements.namedItem(nombre)
        if (input && !input.disabled) {
            input.value = valor ?? ''
        }
    }
}

function obtenerDatosFormulario(form, campos) {
    const formData = new FormData(form)
    const datos = {}

    for (const campo of campos) {
        const valor = formData.get(campo)
        datos[campo] = typeof valor === 'string' ? valor.trim() : ''
    }

    return datos
}

function cambiarFoto(event) {
    const archivo = event.target.files?.[0]
    if (!archivo) return

    const lector = new FileReader()
    lector.onload = async () => {
        const dataURL = lector.result
        const img = document.getElementById('perfil-foto-img')
        if (img) img.src = dataURL

        try {
            await perfilService.guardar({ foto: dataURL })
            perfil = await perfilService.obtener()
            mostrarMensaje('Foto de perfil actualizada.', 'success')
        } catch (error) {
            mostrarMensaje(error.message, 'error')
        }
    }
    lector.readAsDataURL(archivo)

    event.target.value = ''
}

async function removerFoto() {
    const img = document.getElementById('perfil-foto-img')
    if (img) img.src = FOTO_DEFAULT

    try {
        await perfilService.guardar({ foto: null })
        perfil = await perfilService.obtener()
        mostrarMensaje('Foto de perfil removida.', 'success')
    } catch (error) {
        mostrarMensaje(error.message, 'error')
    }
}

function mostrarMensaje(mensaje, tipo) {
    const mensajeElemento = document.getElementById('perfil-mensaje')
    if (!mensajeElemento) return

    mensajeElemento.textContent = mensaje
    mensajeElemento.dataset.type = tipo
}
