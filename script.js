//Primeros pasos en el uso de HTML dinamico
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

  productos: `<div class="main__productos-wrapper">

                    <header class="main__header-all">
                        <div class="main__header-desc">
                            <h2> Productos</h2>
                            <p>Puedes gestionar tus productos desde el sigueinte panel.</p>
                        </div>

                        <div class="main__button-cont">                           
                            <button class="main__button-all" type="submit">Nuevo producto</button>
                        </div>
                    </header>

                    <footer>
                        <div class="footer__table-cont">
                            <table class="footer__table">
                                <thead>
                                    <tr>
                                        <th scope="col" >Codigo</th>
                                        <th scope="col" >Nombre</th>
                                        <th scope="col">Precio</th>
                                        <th scope="col" >Iva</th>
                                        <th scope="col">Precio + iva</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td data-label="Codigo">001</td>
                                        <td data-label="Nombre">Arroz roa x 500gr</td>
                                        <td data-label="Precio">$20.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$23.20</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Codigo">002</td>
                                        <td data-label="Nombre">Frijol lima superoriente x 500</td>
                                        <td data-label="Precio">$30.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$34.80</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Codigo">003</td>
                                        <td data-label="Nombre">Aceite superoriente x200ml</td>
                                        <td data-label="Precio">$50.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$58.00</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Codigo">004</td>
                                        <td data-label="Nombre">Azucar riopaila x 500 gr</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Codigo">005</td>
                                        <td data-label="Nombre">Chocolate Chocoline x 200</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Codigo">006</td>
                                        <td data-label="Nombre">Salsa de tomate Bary x200 gr</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Codigo">007</td>
                                        <td data-label="Nombre">Leche monteFrio x380gr</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Codigo">008</td>
                                        <td data-label="Nombre">Desodorante Rexona x 60 ml</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Codigo">009</td>
                                        <td data-label="Nombre">Azucar Morena x 500 gr</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </footer>
                </div>`,

  proveedores: `<div>
                    <header class="main__header-all">
                        <div class="main__header-desc">
                            <h2> Proveedores</h2>
                            <p>Puedes gestionar tus proveedores desde el sigueinte panel.</p>
                        </div>

                        <div class="main__button-cont">                           
                            <button class="main__button-all" type="submit">Nuevo proveedor</button>
                        </div>
                    </header>

                    <footer>
                        <div class="footer__table-cont">
                            <table class="footer__table">

                                <thead>
                                    <tr>
                                        <th>Nit</th>
                                        <th>Nombre</th>
                                        <th>direccion</th>
                                        <th>Telefono</th>
                                        <th>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td data-label="Nit">001-002-003</td>
                                        <td data-label="Nombre">Servicios Nutresa</td>
                                        <td data-label="direccion">Cll 20 # 17-10</td>
                                        <td data-label="Telefono">31209344</td>
                                        <td data-label="Email">servicions@ejemplo.com</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Nit">004-005-006</td>
                                        <td data-label="Nombre">Distribuciones La 40</td>
                                        <td data-label="direccion">Av 40 # 50-20</td>
                                        <td data-label="Telefono">31567890</td>
                                        <td data-label="Email">la40@ejemplo.com</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Nit">004-005-006</td>
                                        <td data-label="Nombre">Distribuciones La 40</td>
                                        <td data-label="direccion">Av 40 # 50-20</td>
                                        <td data-label="Telefono">31567890</td>
                                        <td data-label="Email">la40@ejemplo.com</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Nit">004-005-006</td>
                                        <td data-label="Nombre">Distribuciones La 40</td>
                                        <td data-label="direccion">Av 40 # 50-20</td>
                                        <td data-label="Telefono">31567890</td>
                                        <td data-label="Email">la40@ejemplo.com</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Nit">004-005-006</td>
                                        <td data-label="Nombre">Distribuciones La 40</td>
                                        <td data-label="direccion">Av 40 # 50-20</td>
                                        <td data-label="Telefono">31567890</td>
                                        <td data-label="Email">la40@ejemplo.com</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Nit">004-005-006</td>
                                        <td data-label="Nombre">Distribuciones La 40</td>
                                        <td data-label="direccion">Av 40 # 50-20</td>
                                        <td data-label="Telefono">31567890</td>
                                        <td data-label="Email">la40@ejemplo.com</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Nit">004-005-006</td>
                                        <td data-label="Nombre">Distribuciones La 40</td>
                                        <td data-label="direccion">Av 40 # 50-20</td>
                                        <td data-label="Telefono">31567890</td>
                                        <td data-label="Email">la40@ejemplo.com</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Nit">004-005-006</td>
                                        <td data-label="Nombre">Distribuciones La 40</td>
                                        <td data-label="direccion">Av 40 # 50-20</td>
                                        <td data-label="Telefono">31567890</td>
                                        <td data-label="Email">la40@ejemplo.com</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </footer>
                </div>`,

  clientes: `<div>

                    <header class="main__header-all">
                        <div class="main__header-desc">
                            <h2>Clientes</h2>
                            <p>Puedes gestionar tus clientes desde el sigueinte panel.</p>
                        </div>

                        <div class="main__button-cont">                           
                            <button class="main__button-all" type="submit">Nuevo Cliente</button>
                        </div>
                    </header>

                    <footer>
                        <div class="footer__table-cont">
                            <table class="footer__table">
                                <thead>
                                    <tr>
                                        <th scope="col" >Cedula</th>
                                        <th scope="col" >Nombre</th>
                                        <th scope="col" >Teléfono</th>
                                        <th scope="col" >Correo</th>
                                        <th scope="col" >Dirección</th>
                                    </tr>
                                    
                                </thead>
                                <tbody>
                                    <tr>
                                        <td data-label="Cedula">1234567890</td>
                                        <td data-label="Nombre">Juan Pérez</td>
                                        <td data-label="Teléfono">0987654321</td>
                                        <td data-label="Correo">juan@ejemplo.com</td>
                                        <td data-label="Dirección">Calle Falsa 123</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Cedula">0987654321</td>
                                        <td data-label="Nombre">María Gómez</td>
                                        <td data-label="Teléfono">0123456789</td>
                                        <td data-label="Correo">maria@ejemplo.com</td>
                                        <td data-label="Dirección">Avenida Siempre Viva 456</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Cedula">1122334455</td>
                                        <td data-label="Nombre">Carlos López</td>
                                        <td data-label="Teléfono">0912345678</td>
                                        <td data-label="Correo">carlos@ejemplo.com</td>
                                        <td data-label="Dirección">Boulevard Central 789</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Cedula">1122334455</td>
                                        <td data-label="Nombre">Carlos López</td>
                                        <td data-label="Teléfono">0912345678</td>
                                        <td data-label="Correo">carlos@ejemplo.com</td>
                                        <td data-label="Dirección">Boulevard Central 789</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Cedula">1122334455</td>
                                        <td data-label="Nombre">Carlos López</td>
                                        <td data-label="Teléfono">0912345678</td>
                                        <td data-label="Correo">carlos@ejemplo.com</td>
                                        <td data-label="Dirección">Boulevard Central 789</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Cedula">1122334455</td>
                                        <td data-label="Nombre">Carlos López</td>
                                        <td data-label="Teléfono">0912345678</td>
                                        <td data-label="Correo">carlos@ejemplo.com</td>
                                        <td data-label="Dirección">Boulevard Central 789</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Cedula">1122334455</td>
                                        <td data-label="Nombre">Carlos López</td>
                                        <td data-label="Teléfono">0912345678</td>
                                        <td data-label="Correo">carlos@ejemplo.com</td>
                                        <td data-label="Dirección">Boulevard Central 789</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </footer>
                </div>`,
  ventas: `<div>
                    <div>
                        <header class="main__header-all">

                            <div class="main__header-desc">
                                <h2>Ventas</h2>
                                <p>Puedes gestionar tus ventas desde el sigueinte panel</p>
                            </div>

                            <div class="main__button-cont">                           
                                <button class="main__button-all" type="submit">Nueva venta</button>
                            </div>
                        </header>
                    </div>

                    <div>
                        <section>
                            <form>
                                <div>
                                    <label for="">Codigo de barras</label>
                                    <input type="text" placeholder="Escanea el codigo de barras">
                                </div>
                                <div>
                                    <label for="">Producto</label>
                                    <input type="text" placeholder="Nombre del producto">
                                </div>
                                <div>
                                    <label for="">Cantidad</label>
                                    <input type="number" placeholder="0">
                                </div>
                                <div>
                                    <label for="">Precio Unitario</label>
                                    <input type="text" placeholder="$0.00">
                                </div>
                                <button type="submit">Agregar Producto</button>
                            </form>
                        </section>

                        <footer class="footer__table-cont">
                            <table class="footer__table">
                                <thead>
                                    <tr>
                                        <th scope="col" >Codigo</th>
                                        <th scope="col" >Nombre</th>
                                        <th scope="col">Precio</th>
                                        <th scope="col" >Iva</th>
                                        <th scope="col">Precio + iva</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td data-label="Codigo">001</td>
                                        <td data-label="Nombre">Arroz roa x 500gr</td>
                                        <td data-label="Precio">$20.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$23.20</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Codigo">002</td>
                                        <td data-label="Nombre">Frijol lima superoriente x 500</td>
                                        <td data-label="Precio">$30.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$34.80</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Codigo">003</td>
                                        <td data-label="Nombre">Aceite superoriente x200ml</td>
                                        <td data-label="Precio">$50.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$58.00</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Codigo">004</td>
                                        <td data-label="Nombre">Azucar riopaila x 500 gr</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Codigo">005</td>
                                        <td data-label="Nombre">Chocolate Chocoline x 200</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Codigo">006</td>
                                        <td data-label="Nombre">Salsa de tomate Bary x200 gr</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Codigo">007</td>
                                        <td data-label="Nombre">Leche monteFrio x380gr</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </footer>
                    </div>
                </div>`,
  facturacion: `<div>
                    <div>
                        <header class="main__header-all">

                            <div class="main__header-desc">
                                <h2>Facturación</h2>
                                <p>Puedes gestionar tus facturas desde el sigueinte panel</p>
                            </div>

                            <div class="main__button-cont">                           
                                <button class="main__button-all" type="submit">Nueva factura</button>
                            </div>
                        </header>
                    </div>

                    <div>
                        <section>
                            <form>
                                <div>
                                    <label for="">Nit</label>
                                    <input type="number" >
                                </div>
                                <div>
                                    <label for="">Nº Factura</label>
                                    <input type="text">
                                </div>
                                <div>
                                    <label for="">Costo</label>
                                    <input type="number" placeholder="0">
                                </div>
                                <div>
                                    <label for="">Iva</label>
                                    <input type="number" placeholder="19%">
                                </div>
                                <div>
                                    <label for="">Cantidad</label>
                                    <input type="text" placeholder="$0.00">
                                </div>
                                <button type="submit">Agregar Producto</button>
                            </form>
                        </section>

                        <footer class="footer__table-cont">
                            <table class="footer__table">                               
                                <thead>
                                    <tr>
                                        <th scope="col" >Codigo</th>
                                        <th scope="col" >Nombre</th>
                                        <th scope="col">Precio</th>
                                        <th scope="col" >Iva</th>
                                        <th scope="col">Precio + iva</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td data-label="Codigo">001</td>
                                        <td data-label="Nombre">Arroz roa x 500gr</td>
                                        <td data-label="Precio">$20.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$23.20</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Codigo">002</td>
                                        <td data-label="Nombre">Frijol lima superoriente x 500</td>
                                        <td data-label="Precio">$30.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$34.80</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Codigo">003</td>
                                        <td data-label="Nombre">Aceite superoriente x200ml</td>
                                        <td data-label="Precio">$50.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$58.00</td>
                                    </tr>
                                    <tr>
                                        <td data-label="Codigo">004</td>
                                        <td data-label="Nombre">Azucar riopaila x 500 gr</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Codigo">005</td>
                                        <td data-label="Nombre">Chocolate Chocoline x 200</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Codigo">006</td>
                                        <td data-label="Nombre">Salsa de tomate Bary x200 gr</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Codigo">007</td>
                                        <td data-label="Nombre">Leche monteFrio x380gr</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Codigo">008</td>
                                        <td data-label="Nombre">Desodorante Rexona x 60 ml</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>

                                    <tr>
                                        <td data-label="Codigo">009</td>
                                        <td data-label="Nombre">Azucar Morena x 500 gr</td>
                                        <td data-label="Precio">$25.00</td>
                                        <td data-label="Iva">16%</td>
                                        <td data-label="Precio + iva">$29.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </footer>
                    </div>
                </div>`,

  perfil: `<div class="perfil__container-wrapper">
                    <div class="perfil__section-wrapper">
                        <section class="perfil__section">
                            <div class="perfil__section-content">
                                <div class="perfil__content">
                                    <div class="perfil">                                        
                                        <div class="perfil-foto">
                                            <img src="img/profile-img.jpg" alt="Foto de perfil">
                                        </div>
                                        <div class="perfil-description">
                                           <h3>Perfil de Usuario</h3>
                                            <p>Mercados Doris</p> 
                                        </div>                                        
                                    </div>
                                    <div class="perfil__button">
                                        <button type="submit">Cambiar foto</button>
                                        <button type="submit">Remover</button>  
                                    </div>                                    
                                </div>                      
                            </div>
                            <div class="perfil__info-card">
                                <h3>Información Personal</h3>
                                <form class="form__perfil">
                                    <div>
                                        <label for="nombre">Nombre</label>
                                        <input id="nombre" type="text" placeholder="Jhon Smith">
                                    </div>
                                    <div>
                                        <label for="telefono">Teléfono</label>
                                        <input id="telefono" type="tel" placeholder="312 6234762">
                                    </div>
                                    <div>
                                        <label for="email">Correo</label>
                                        <input id="email" type="email" placeholder="Example@correo.com">
                                    </div>
                                    
                                    <div>
                                        <label for="direccion">Dirección</label>
                                        <input id="direccion" type="text" placeholder="Cll 2 # 1-2">
                                    </div>
                                    <div>
                                        <button type="submit">Guardar Cambios</button>
                                    </div>
                                </form>
                            </div>

                            <div class="perfil__info-card" >
                                <h3>Información del negocio</h3>
                                <form class="form__perfil">
                                    <div>
                                        <label for="nombre-negocio">Nombre del Negocio</label>
                                        <input id="nombre-negocio" type="text" placeholder="Mercados Doris">
                                    </div>
                                    <div>
                                        <label for="tipo-negocio">Tipo de Negocio</label>
                                        <input id="tipo-negocio" type="text" placeholder="Mini mercado">
                                    </div>
                                    <div>
                                        <label for="ubicacion-negocio">Ubicación del Negocio</label>
                                        <input id="ubicacion-negocio" type="text" placeholder="Calle colombia 20-19">
                                    </div>
                                    <div>
                                        <label for="fecha-creacion">Fecha de registro</label>
                                        <input id="fecha-creacion" type="date">
                                    </div>
                                    <div>
                                        <button type="submit">Guardar Cambios</button>
                                    </div>
                                </form>
                            </div>
                        </section>

                    </div>  
                </div>`,
  configuracion: `<div>
                    <section>
                        <div>
                            <section>
                                <h4>Configuración de reportes</h4>

                                <details open>
                                    <summary>Gestion de reportes</summary>
                                    <div>
                                        <p>Reportes diarios</p>
                                        <label class="switch">
                                            <input type="checkbox">
                                            <span class="slider round"></span>

                                        </label>
                                    </div>
                                    <div>
                                        <p>Reportes semanales</p>
                                        <label class="switch">
                                            <input type="checkbox">
                                            <span class="slider round"></span>

                                        </label>
                                    </div>
                                    <div>
                                        <p>Reportes mensuales</p>
                                        <label class="switch">
                                            <input type="checkbox">
                                            <span class="slider round"></span>

                                        </label>
                                    </div>

                                </details>
                                <details open>
                                    <summary>Frecuencia Notificaciones</summary>
                                    <p>Selecciona la frecuencia con la que deseas recibir los reportes.</p>
                                    <select>
                                        <option value="diario">Diario</option>
                                        <option value="semanal">Semanal</option>
                                        <option value="mensual">Mensual</option>
                                    </select>
                                </details>



                                <details open>
                                    <summary>Formato de reportes</summary>
                                    <p>Selecciona el formato preferido para la exportación de reportes (PDF, Excel, CSV).</p>
                                    <select>
                                        <option value="pdf">PDF</option>
                                        <option value="excel">Excel</option>
                                        <option value="csv">CSV</option>
                                    </select>
                                </details>
                            </section>
                        </div>
                    </section>
                </div>`,
};

function cargarContenido() {
  const hash = window.location.hash.slice(1) || "inicio"; // Por defecto: "inicio"
  const contenido = rutas[hash] || "<h2>Página no encontrada</h2>";
  document.getElementById("contenido").innerHTML = contenido;
}

// Cargar al inicio y cuando cambie el hash
window.addEventListener("load", cargarContenido);
window.addEventListener("hashchange", cargarContenido);  

