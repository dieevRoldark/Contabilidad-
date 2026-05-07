
const cacheVistas = {}

async function cargarContenido() {
    const hash = window.location.hash.slice(1) || 'inicio'
    const contentDiv = document.getElementById('contenido')

    try {
        // Antes de ir a internet, preguntamos si ya lo tenemos
        if (cacheVistas[hash]) {
            // Si existe en memoria, lo usamos y NO hacemos fetch
            contentDiv.innerHTML = cacheVistas[hash]
            console.log(`Recuperado de caché: ${hash}`)
        } else {
            // Si NO existe, entonces sí vamos a internet
            const respuestaHtml = await fetch(`./sections/${hash}.html`)
            
            if (respuestaHtml.ok) {
                const html = await respuestaHtml.text()
                
                // 3. NUEVO: Guardamos una copia en memoria antes de usarla
                cacheVistas[hash] = html
                
                contentDiv.innerHTML = html
            } else {
                contentDiv.innerHTML = '<h2>Error 404</h2>'
                return
            }
        }

        try {
            const modulo = await import(`./controller/${hash}.js`)
            if (modulo.init) {
                modulo.init()
            }
        } catch (errorJs) {
            console.log(`Nota: No se cargó script para ${hash}`)
        }

    } catch (error) {
        console.error('Error:', error)
    }
}

window.addEventListener('load', cargarContenido)
window.addEventListener('hashchange', cargarContenido)