const API_HOST = window.API_HOST || ''
export const API_BASE = API_HOST ? `${API_HOST}/api` : '/api'

export function configurarApiHost(host) {
    window.API_HOST = host
}

export async function manejarRespuesta(response) {
    if (response.status === 204) {
        return null
    }

    if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Error del servidor' }))
        throw new Error(data.error || data.mensaje || `Error ${response.status}`)
    }

    return response.json()
}

export async function fetchApi(url, options = {}) {
    const fetchOptions = {
        credentials: 'include',
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers }
    }

    let response = await fetch(url, fetchOptions)

    if (response.status === 401) {
        const data = await response.json().catch(() => ({}))

        if (data.codigo === 'TOKEN_EXPIRADO') {
            const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })

            if (refreshRes.ok) {
                response = await fetch(url, fetchOptions)
            }
        }
    }

    if (response.status === 401) {
        const { cerrarSesion } = await import('./authService.js')
        await cerrarSesion()
        window.location.hash = 'login'
        throw new Error('Sesion expirada. Inicia sesion nuevamente.')
    }

    return manejarRespuesta(response)
}
