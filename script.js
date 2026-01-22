
/*En esta estructura la usar Queryselector solo nos permite RECUPER O
aplicar los eventos a un solo elemento o en este caso un boton.

const boton = document.querySelector('.main__header-button')


boton.addEventListener( 'click', function() {
    boton.classList.add("is-applied")
    boton.disabled = true
})

Tener en cuenta!!! = Para recuperar todos los elementos usamos Queryselectorall

*/



//Primeros pasos en el uso de HTML dinamica
//Seccion Main

const rutas = {
  inicio: `<div class="main__content-wrapper">
                   <header class="main__header">
                        <div class="main__header-description">
                            <h2>Resumen General</h2>
                            <p>Información de tus movimientos más relevantes</p>  
                        </div>
                        
                        <button class="main__header-button button--subt" type="submit">
                            <svg id="icono" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-download"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>
                            Importar
                        </button>
                        <button class="main__header-button " type="submit">Nueva venta</button>
                       
                        
                    </header>

                    <footer class="main__footer">              
                        <article class="main__card-footer">
                            <h3>Ventas Totales</h3>
                            <span>$156,000.00</span>
                            <div>
                                <span>Hoy</span> 
                            </div>
                            
                        </article>
                        <article class="main__card-footer">
                            <h3>Compras</h3>
                            <span>$250,000.00</span>
                            <div>
                                <span>Ayer</span> 
                            </div>
                        </article>
                        <article class="main__card-footer">
                            <h3>Facturas</h3>
                            <span>7</span>
                            <div>
                                <span>Pendientes</span> 
                            </div>
                        </article>
                        <article class="main__card-footer">
                            <h3>Estadisticas</h3>
                            <div class="main__chart">
                                <div class="bar" style="height: 40%;"></div>
                                <div class="bar" style="height: 50%;"></div>
                                <div class="bar" style="height: 60%;"></div>
                                <div class="bar" style="height: 70%;"></div>
                                <div class="bar" style="height: 40%;"></div>
                                <div class="bar" style="height: 50%;"></div>
                            </div>
                        </article>
                    
                    </footer> 
                </div>`,

  productos: `<h2>Productos</h2><p>Aquí puedes editar tu información.</p>`,
  clientes: `<h2>Clientes</h2><p>Aquí puedes editar tu información.</p>`,
  ventas: `<h2>ventas</h2><p>Aquí puedes editar tu información.</p>`,
  facturacion: `<h2>facturación</h2><p>Aquí puedes editar tu información.</p>`,
  configuracion: `<h2>Configuración</h2><p>Opciones de configuración del sistema.</p>`,
  perfil: `<h2>Perfil</h2><p>Aquí puedes editar tu información.</p>`,
};

function cargarContenido() {
  const hash = window.location.hash.slice(1) || "inicio"; // Por defecto: "inicio"
  const contenido = rutas[hash] || "<h2>Página no encontrada</h2>";
  document.getElementById("contenido").innerHTML = contenido;
}

// Cargar al inicio y cuando cambie el hash
window.addEventListener("load", cargarContenido);
window.addEventListener("hashchange", cargarContenido);  





//PreventDefault permite cambiar el comportamiento del evento:input

const searchInput = document.querySelector('#input-search')

searchInput.addEventListener('input', function(event) {
    event.preventDefault()
    console.log(searchInput.value)
})


//Capturar evento:click dentro del contenedor mediante event 
//Condicional que captura los botones del contenedor y los cuenta + estilos

const mainSection = document.querySelector('.main__header')

mainSection.addEventListener('click', function(event) {
    const element = event.target

    if (element.classList.contains('main__header-button')) {
        element.classList.add("is-applied")
        element.disabled = true
    }
})
