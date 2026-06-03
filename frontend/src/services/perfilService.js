import { API_BASE, fetchApi } from './config.js'

export async function obtener() {
    return fetchApi(`${API_BASE}/perfil`)
}

export async function guardar(datos) {
    return fetchApi(`${API_BASE}/perfil`, {
        method: 'PUT',
        body: JSON.stringify(datos)
    })
}
