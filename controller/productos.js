

export function init() {
    console.log('Iniciando módulo de Productos...');

    // Listeners
    const btnNuevo = document.getElementById('btn-nuevo-producto');
    if(btnNuevo) {
        btnNuevo.addEventListener('click', () => alert('Crear producto'));
    }

    // Cargar tabla
    cargarTablaProductos();
}

function cargarTablaProductos() {
    const mockData = [
        { codigo: 1, nombre: "Coca Cola", precio: 2100, iva: '19%', precioIva: 2600 },
        { codigo: 2, nombre: "Papas Margarita", precio: 1500, iva: '0%', precioIva: 1500 },
        { codigo: 3, nombre: "Arroz Diana", precio: 3200, iva: '19%', precioIva: 3800 },
        { codigo: 3, nombre: "Arroz Diana", precio: 3200, iva: '19%', precioIva: 3800 },
        { codigo: 3, nombre: "Arroz Diana", precio: 3200, iva: '19%', precioIva: 3800 },
        { codigo: 3, nombre: "Arroz Diana", precio: 3200, iva: '19%', precioIva: 3800 },
        { codigo: 3, nombre: "Arroz Diana", precio: 3200, iva: '19%', precioIva: 3800 },
        { codigo: 3, nombre: "Arroz Diana", precio: 3200, iva: '19%', precioIva: 3800 },
        { codigo: 3, nombre: "Arroz Diana", precio: 3200, iva: '19%', precioIva: 3800 },
    ];
    
    // Seleccionamos el cuerpo de la tabla
    const tbody = document.querySelector('#tabla-productos tbody');

    tbody.innerHTML = '';


    // Recorremos cada producto y creamos su HTML
    mockData.forEach(producto => {
        // Usamos las comillas invertidas (backticks) para escribir HTML dentro de JS
        const fila = `
            <tr>
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>$${producto.precio}</td>
                <td>${producto.iva}</td>
                <td>$${producto.precioIva}</td>
            </tr>
        `;
        
        // Inyectamos la fila en la tabla
        tbody.innerHTML += fila;
    });
}

/*
                <td>
                    <button class="btn-editar" style="cursor:pointer">✏️</button>
                    <button class="btn-eliminar" style="cursor:pointer">🗑️</button>
                </td>
*/