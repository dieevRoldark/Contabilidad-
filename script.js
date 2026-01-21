
//En esta estructura la usar Queryselector solo nos permite 
//aplicar los eventos a un solo elemento o en este caso un boton.

const boton = document.querySelector('.main__header-button')


boton.addEventListener( 'click', function() {
    boton.classList.add("is-applied")
    boton.disabled = true
})
