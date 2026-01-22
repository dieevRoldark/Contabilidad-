
/*En esta estructura la usar Queryselector solo nos permite RECUPER O
aplicar los eventos a un solo elemento o en este caso un boton.

const boton = document.querySelector('.main__header-button')


boton.addEventListener( 'click', function() {
    boton.classList.add("is-applied")
    boton.disabled = true
})

Tener en cuenta!!! = Para recuperar todos los elementos usamos Queryselectorall

*/

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


