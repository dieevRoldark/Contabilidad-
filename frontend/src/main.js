import { cerrarSesion, estaAutenticado, verificarSesion } from './services/authService.js'
import { sanitizeHtml } from './services/sanitize.js'
import { initTheme } from './services/themeService.js'

const cacheVistas = {}
const RUTA_INICIO = 'inicio'
const RUTA_LOGIN = 'login'
const RUTA_REGISTRO = 'registro'
const rutasPublicas = [RUTA_LOGIN, RUTA_REGISTRO]
const LOADING_HTML = '<div class="loading-spinner"><div class="spinner"></div><p class="loading-text">Cargando...</p></div>'
let inicioListo = false

function inyectarEstilosCarga() {
    if (document.getElementById('loading-styles')) {
        return
    }

    const estilo = document.createElement('style')
    estilo.id = 'loading-styles'
    estilo.textContent = `
        .loading-spinner {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 1rem;
            gap: 1rem;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e0e0e0;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loading-text {
            color: #666;
            font-size: 0.95rem;
            margin: 0;
        }
    `
    document.head.append(estilo)
}

async function cargarContenido() {
    if (!inicioListo) {
        await verificarSesion()
        inicioListo = true
    }

    const hash = window.location.hash.slice(1) || RUTA_INICIO
    const ruta = protegerRuta(hash)
    const contentDiv = document.getElementById('contenido')

    if (!ruta || !contentDiv) {
        return
    }

    actualizarModoLogin(ruta)

    const desdeCache = cacheVistas[ruta]

    if (!desdeCache) {
        contentDiv.innerHTML = LOADING_HTML
    }

    try {
        if (desdeCache) {
            contentDiv.innerHTML = sanitizeHtml(desdeCache)
        } else {
            const respuestaHtml = await fetch(`./sections/${ruta}.html`)

            if (respuestaHtml.ok) {
                const html = await respuestaHtml.text()

                cacheVistas[ruta] = html
                contentDiv.innerHTML = sanitizeHtml(html)
            } else {
                contentDiv.innerHTML = '<h2>Error 404 — Seccion no encontrada</h2>'
                return
            }
        }

        let modulo
        try {
            modulo = await import(`./controller/${ruta}.js?t=${Date.now()}`)
        } catch {
            console.log(`Nota: No se encontro el controlador para ${ruta}`)
        }

        if (modulo?.init) {
            try {
                await modulo.init()
            } catch (errorJs) {
                console.error(`Error al ejecutar init() de ${ruta}:`, errorJs)
            }
        }
    } catch (error) {
        console.error('Error:', error)

        if (!cacheVistas[ruta]) {
            contentDiv.innerHTML = '<h2>Error al cargar la pagina. Intentalo de nuevo.</h2>'
        }
    }
}

function protegerRuta(ruta) {
    if (!estaAutenticado() && !rutasPublicas.includes(ruta)) {
        actualizarModoLogin(RUTA_LOGIN)
        window.location.hash = RUTA_LOGIN
        return null
    }

    if (estaAutenticado() && rutasPublicas.includes(ruta)) {
        window.location.hash = RUTA_INICIO
        return null
    }

    return ruta
}

function actualizarModoLogin(ruta) {
    document.body.classList.toggle('login-mode', rutasPublicas.includes(ruta))
}

function configurarCerrarSesion() {
    const botonCerrarSesion = document.querySelector('[data-logout]')

    if (!botonCerrarSesion) {
        return
    }

    botonCerrarSesion.addEventListener('click', async () => {
        await cerrarSesion()
        window.location.hash = RUTA_LOGIN
    })
}

window.addEventListener('load', () => {
    inyectarEstilosCarga()
    initTheme()
    configurarCerrarSesion()
    cargarContenido()
})
window.addEventListener('hashchange', cargarContenido)
