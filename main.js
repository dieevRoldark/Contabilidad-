async function cargarContenido() {
    // Obtener qué sección cargar
    const hash = window.location.hash.slice(1) || 'inicio';
    const contentDiv = document.getElementById('contenido');

    // Definir la ruta del archivo HTML
    const rutaArchivo = `./sections/${hash}.html`;

    try {
        const respuesta = await fetch(rutaArchivo);

        if (respuesta.ok) {
            const html = await respuesta.text();
            contentDiv.innerHTML = html;
        } else {
            contentDiv.innerHTML = '<h2>Error 404: Sección no encontrada</h2>';
            console.error(`No se encontró el archivo: ${rutaArchivo}`);
        }
    } catch (error) {
        console.error('Error cargando la vista:', error);
        contentDiv.innerHTML = '<h2>Error de conexión</h2>';
    }
}

// Inicializadores
window.addEventListener('load', cargarContenido);
window.addEventListener('hashchange', cargarContenido);