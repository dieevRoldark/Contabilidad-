import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { mysqlDatetime } from '../utils/fecha.js'

export async function seedDatabase(pool) {
    const hashAdmin = await bcrypt.hash('Admin123', 10)
    const ahora = mysqlDatetime()

    const userId = uuidv4()
    await pool.query(
        'INSERT INTO usuarios (id, nombre, email, password_hash, creado_en) VALUES (?, ?, ?, ?, ?)',
        [userId, 'Admin', 'admin@demo.com', hashAdmin, ahora]
    )

    await pool.query(
        'INSERT INTO productos (id, codigo, nombre, precio_compra, iva, precio_final_venta, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), 'P001', 'Arroz Blanco', 2000, 19, 2380, ahora, ahora]
    )
    await pool.query(
        'INSERT INTO productos (id, codigo, nombre, precio_compra, iva, precio_final_venta, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), 'P002', 'Aceite Vegetal', 5000, 19, 5950, ahora, ahora]
    )
    await pool.query(
        'INSERT INTO productos (id, codigo, nombre, precio_compra, iva, precio_final_venta, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), 'P003', 'Azucar Refinada', 3000, 19, 3570, ahora, ahora]
    )

    await pool.query(
        'INSERT INTO clientes (id, cedula, nombre, telefono, correo, direccion, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), '1234567890', 'Carlos Perez', '3001112233', 'carlos@email.com', 'Calle 45 #23-12', ahora, ahora]
    )
    await pool.query(
        'INSERT INTO clientes (id, cedula, nombre, telefono, correo, direccion, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), '0987654321', 'Maria Gomez', '3104445566', 'maria@email.com', 'Carrera 30 #15-80', ahora, ahora]
    )

    await pool.query(
        'INSERT INTO proveedores (id, nit, nombre, telefono, correo, direccion, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), '800123456-7', 'Distribuidora ABC', '6017778899', 'abc@distribuidora.com', 'Av. Siempre Viva 742', ahora, ahora]
    )
    await pool.query(
        'INSERT INTO proveedores (id, nit, nombre, telefono, correo, direccion, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), '900987654-3', 'Suministros XYZ', '6012223344', 'ventas@xyz.com', 'Calle 10 #5-67', ahora, ahora]
    )

    await pool.query(
        'INSERT INTO perfiles (user_id, personal, negocio, foto) VALUES (?, ?, ?, ?)',
        [
            userId,
            JSON.stringify({ nombre: 'Admin', telefono: '3001234567', email: 'admin@demo.com', direccion: 'Calle 123 #45-67' }),
            JSON.stringify({ 'nombre-negocio': 'Demo Market', 'tipo-negocio': 'Tienda de barrio', 'ubicacion-negocio': 'Bogota, Colombia', 'fecha-creacion': '2024-01-01' }),
            null
        ]
    )

    await pool.query(
        'INSERT INTO configuraciones (user_id, reportes, notificaciones) VALUES (?, ?, ?)',
        [
            userId,
            JSON.stringify({ tipo: ['ventas', 'compras', 'facturas', 'clientes', 'proveedores'], formato: 'pdf', frecuencia: 'diario' }),
            JSON.stringify({ frecuencia: 'diario', canales: ['correo'] })
        ]
    )
}
