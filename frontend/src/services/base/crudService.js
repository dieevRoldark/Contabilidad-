import { API_BASE, fetchApi } from '../config.js'

export function crearCrudService(recurso) {
    function obtenerTodos() {
        return fetchApi(`${API_BASE}/${recurso}`)
    }

    function crear(datos) {
        return fetchApi(`${API_BASE}/${recurso}`, {
            method: 'POST',
            body: JSON.stringify(datos)
        })
    }

    function actualizar(id, cambios) {
        return fetchApi(`${API_BASE}/${recurso}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(cambios)
        })
    }

    function eliminar(id) {
        return fetchApi(`${API_BASE}/${recurso}/${id}`, {
            method: 'DELETE'
        })
    }

    return { obtenerTodos, crear, actualizar, eliminar }
}
