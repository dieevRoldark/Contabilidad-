const cacheSections = {};

async function cargarContenido() {
    const hash = window.location.hash.slice(1) || 'inicio';
    const contentDiv = document.getElementById('contenido');


    if(cacheSections[hash]) {
        contentDiv.innerHTML = cacheSections[hash].html;
        return;
    }

    try {
        // 1. Cargar el HTML 
        const respuestaHtml = await fetch(`./sections/${hash}.html`);
        if (respuestaHtml.ok) {
            const html = await respuestaHtml.text();
            contentDiv.innerHTML = html;

            cacheSections[hash] =  html ;
            
            try {
                // 2. Intentamos cargar dinámicamente el JS de esta sección
                const modulo = await import(`./controller/${hash}.js`);
                
                // 3. Si el archivo existe y tiene una función 'init', la ejecutamos
                if (modulo.init) {
                    modulo.init();
                }
            } catch (errorJs) {

                console.log(`Nota: No se cargó script para ${hash} (o no existe).`);
            }

        } else {
            contentDiv.innerHTML = '<h2>Error 404</h2>';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

window.addEventListener('load', cargarContenido);
window.addEventListener('hashchange', cargarContenido);