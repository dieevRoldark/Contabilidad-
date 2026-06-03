const THEME_KEY = 'contabilidad.theme'
const TEMA_CLARO = 'light'
const TEMA_OSCURO = 'dark'

function obtenerTemaSistema() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return TEMA_OSCURO
    }
    return TEMA_CLARO
}

export function getTemaActual() {
    return localStorage.getItem(THEME_KEY) || TEMA_CLARO
}

export function aplicarTema(tema) {
    document.documentElement.dataset.theme = tema
    const esOscuro = tema === TEMA_OSCURO
    const iconos = document.querySelectorAll('[data-theme-toggle]')

    for (const icono of iconos) {
        icono.setAttribute('aria-label', esOscuro ? 'Activar modo claro' : 'Activar modo oscuro')
        icono.setAttribute('title', esOscuro ? 'Activar modo claro' : 'Activar modo oscuro')
        icono.innerHTML = esOscuro
            ? `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>`
            : `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3v1m0 16v1m-9-9h1m16 0h1m-4.636-6.364.707-.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707" /><path d="M16 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0" /></svg>`
    }
}

export function alternarTema() {
    const actual = getTemaActual()
    const nuevo = actual === TEMA_OSCURO ? TEMA_CLARO : TEMA_OSCURO
    localStorage.setItem(THEME_KEY, nuevo)
    aplicarTema(nuevo)
}

export function initTheme() {
    const guardado = localStorage.getItem(THEME_KEY)

    if (guardado) {
        aplicarTema(guardado)
    } else {
        const sistema = obtenerTemaSistema()
        aplicarTema(sistema)
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(THEME_KEY)) {
            aplicarTema(e.matches ? TEMA_OSCURO : TEMA_CLARO)
        }
    })

    document.addEventListener('click', (e) => {
        const toggle = e.target.closest('[data-theme-toggle]')
        if (toggle) {
            alternarTema()
        }
    })
}
