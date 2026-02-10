// Objeto vacío para guardar las secciones ya visitadas
const cacheVistas = {}; 

async function cargarContenido() {
    const hash = window.location.hash.slice(1) || 'inicio';
    const contentDiv = document.getElementById('contenido');
    const rutaArchivo = `./sections/${hash}.html`;

    // PREGUNTA DE SEGURIDAD: ¿Ya tengo esta vista en memoria?
    if (cacheVistas[hash]) {
        // Usamos la copia guardada
        contentDiv.innerHTML = cacheVistas[hash];
        console.log(`Cargado desde caché: ${hash}`);
        return;
    }

    // Si no la tengo, entonces sí hacemos fetch
    try {
        const respuesta = await fetch(rutaArchivo);

        if (respuesta.ok) {
            const html = await respuesta.text();
            
            // GUARDAMOS EN MEMORIA antes de mostrar
            cacheVistas[hash] = html; 
            
            contentDiv.innerHTML = html;
        } else {
            contentDiv.innerHTML = '<h2>Error 404</h2>';
        }
    } catch (error) {
        console.error(error);
        contentDiv.innerHTML = '<h2>Error de conexión</h2>';
    }
}

window.addEventListener('load', cargarContenido);
window.addEventListener('hashchange', cargarContenido);