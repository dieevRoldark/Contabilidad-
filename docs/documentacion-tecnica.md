# Documentación Técnica — D&D Market

## Sistema de Gestión de Stock y Facturación Electrónica

<div align="center">

| Campo | Valor |
|---|---|
| **Nombre del proyecto** | D&D Market — Sistema de Gestión de Stock y Facturación |
| **Nombre técnico** | `criptografia-aplicada-backend` |
| **Versión** | 1.0.0 |
| **Estándares** | IEEE 1063 (Documentación de Usuario), IEEE 1016 (Descripción de Diseño) |
| **Arquitectura** | SPA + API REST + DB Relacional. Patrón **MVC modificado** con fábricas CRUD genéricas |
| **Lenguajes** | JavaScript (ESM) — Node.js 20 (backend), Vanilla JS sin bundler (frontend) |
| **Base de datos** | MySQL 8.0 (InnoDB, utf8mb4) |
| **Infraestructura** | Docker Compose (3 servicios: mysql + backend + nginx) |
| **Autor** | Diego Roldán — droldan9@estudiantes.areandina.edu.co |

</div>

---

## Tabla de Contenidos

1. [Descripción General del Proyecto](#1-descripción-general-del-proyecto)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Estructura de Carpetas](#3-estructura-de-carpetas)
4. [Documentación de Módulos — Backend](#4-documentación-de-módulos--backend)
5. [Documentación de Módulos — Frontend](#5-documentación-de-módulos--frontend)
6. [Documentación de Funciones y Métodos Clave](#6-documentación-de-funciones-y-métodos-clave)
7. [Lógica de Negocio](#7-lógica-de-negocio)
8. [API y Endpoints](#8-api-y-endpoints)
9. [Base de Datos](#9-base-de-datos)
10. [Seguridad](#10-seguridad)
11. [Observaciones Técnicas](#11-observaciones-técnicas)
12. [Recomendaciones Profesionales](#12-recomendaciones-profesionales)

---

## 1. Descripción General del Proyecto

### 1.1 Objetivo del Sistema

Proveer una plataforma web SPA para la gestión integral de inventario, ventas, facturación de compras, clientes, proveedores y perfiles de negocio, con cifrado híbrido del lado del cliente (AES-GCM-256 + RSA-OAEP-2048) y autenticación JWT con bloqueo de cuenta por fuerza bruta.

### 1.2 Problema que Resuelve

Las pequeñas y medianas empresas colombianas necesitan un sistema centralizado, accesible vía navegador, para administrar stock, registrar ventas, controlar facturas de proveedores y gestionar la configuración del negocio, con seguridad criptográfica sin depender de infraestructura PKI compleja.

### 1.3 Tecnologías Utilizadas

**Backend (Node.js 20 ESM):**

| Dependencia | Versión | Propósito |
|---|---|---|
| Express | 4.21.2 | Framework HTTP |
| mysql2 | 3.11.0 | Driver MySQL con pool de conexiones, promesas, multi-statement |
| jsonwebtoken | 9.0.2 | JWT HS256 (access + refresh tokens) |
| bcryptjs | 3.0.3 | Hashing de contraseñas (10 rounds) |
| helmet | 8.2.0 | Seguridad HTTP (cabeceras, CSP) |
| express-rate-limit | 8.5.2 | Rate limiting (login + API) |
| express-validator | 7.3.2 | Validación de esquemas en rutas |
| uuid | 11.1.0 | Generación de UUID v4 |
| cookie-parser | 1.4.7 | Parseo de cookies HTTP |
| cors | 2.8.5 | CORS whitelist |
| dotenv | 16.4.7 | Variables de entorno |

**Frontend (Vanilla JS, sin bundler):**

| Recurso | Propósito |
|---|---|
| Web Crypto API | Cifrado híbrido (AES-GCM-256 + RSA-OAEP-2048) |
| DOMPurify (CDN) | Sanitización HTML contra XSS |
| Hash-based Router | Implementación propia en `main.js` |
| CSS Vanilla | 1714 líneas de CSS responsive con tema oscuro |

### 1.4 Estado del Proyecto

| Fase | Estado | Descripción |
|---|---|---|
| **MVP** | ✅ Completo | Todos los módulos básicos operativos |
| **Fase 1** | ✅ Completa | Seguridad: JWT HS256, bcrypt, rate limiting, cifrado híbrido cliente, Zero Default Policy |
| **Fase 2** | 🔄 Pendiente | Migración JWT HS256 → RS256 asimétrico con rotación de llaves (`kid` header) |

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura General

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR (Cliente)                               │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                    SPA — Vanilla JS (sin bundler)                   │  │
│  │                                                                     │  │
│  │  ┌──────────────┐       ┌──────────────────┐                       │  │
│  │  │ ROUTER       │       │ CONTROLLERS       │                       │  │
│  │  │ main.js      │──────▶│ (DOM logic)       │                       │  │
│  │  │ hashchange   │       │ ┌──────────────┐  │                       │  │
│  │  │ → fetch HTML │       │ │ base/        │  │                       │  │
│  │  │ → sanitize   │       │ │ crudController│  │                       │  │
│  │  │ → inject DOM │       │ │ → factory    │  │                       │  │
│  │  │ → import     │       │ └──────────────┘  │                       │  │
│  │  │   controller │       └────────┬─────────┘                          │  │
│  │  └──────────────┘                │                                    │  │
│  │        │                         │                                    │  │
│  │        ▼                         ▼                                    │  │
│  │  ┌────────────────────────────────────────────────────────────┐      │  │
│  │  │ SERVICES (/src/services/)                                   │      │  │
│  │  │  ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────┐ │      │  │
│  │  │  │ auth     │ │ config    │ │ sanitize  │ │ utils       │ │      │  │
│  │  │  │ Service  │ │ (fetchApi,│ │ (DOMPurify)│ │ (formateo,  │ │      │  │
│  │  │  │          │ │  refresh) │ │           │ │  regex)     │ │      │  │
│  │  │  └──────────┘ └───────────┘ └───────────┘ └─────────────┘ │      │  │
│  │  │  ┌──────────┐ ┌───────────┐ ┌──────────────┐              │      │  │
│  │  │  │ crypto   │ │ theme     │ │ base/        │              │      │  │
│  │  │  │ Service  │ │ Service   │ │ crudService  │              │      │  │
│  │  │  │ (AES+RSA)│ │ (dark mode)│ │ (factory)   │              │      │  │
│  │  │  └──────────┘ └───────────┘ └──────────────┘              │      │  │
│  │  │  ┌──────────┐ ┌───────────┐ ┌──────────────┐              │      │  │
│  │  │  │ cliente  │ │ producto  │ │ proveedor    │              │      │  │
│  │  │  │ Service  │ │ Service   │ │ Service      │              │      │  │
│  │  │  └──────────┘ └───────────┘ └──────────────┘              │      │  │
│  │  │  ┌──────────┐ ┌───────────┐ ┌──────────────┐              │      │  │
│  │  │  │ venta    │ │ factura   │ │ perfil /     │              │      │  │
│  │  │  │ Service  │ │ Service   │ │ configService│              │      │  │
│  │  │  └──────────┘ └───────────┘ └──────────────┘              │      │  │
│  │  └────────────────────────────────────────────────────────────┘      │  │
│  │                                                                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐      │  │
│  │  │ STORE                                                     │      │  │
│  │  │  ┌──────────────┐  ┌──────────────────────────────┐       │      │  │
│  │  │  │ sessionStore │  │ localStorage (tema, crypto,  │       │      │  │
│  │  │  │ (en memoria) │  │ email pendiente)             │       │      │  │
│  │  │  └──────────────┘  └──────────────────────────────┘       │      │  │
│  │  └────────────────────────────────────────────────────────────┘      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │ HTTP/HTTPS (JSON + HttpOnly Cookies)
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    BACKEND — Node.js 20 + Express 4                      │
│                                                                           │
│  app.js (Express app setup) ◄── server.js (HTTP/HTTPS listener + SSL)    │
│     │                                                                     │
│     ├── Middleware global: CORS → Helmet → JSON (5MB) → Cookie Parser    │
│     │                                                                     │
│     ├── Rate Limiter (/api): 100 req/min por IP                          │
│     │                                                                     │
│     ├── Rutas montadas:                                                   │
│     │   /api/auth       → auth.routes.js   → auth.controller.js          │
│     │   /api/productos  → crudRoutes       → crudController (factory)    │
│     │   /api/clientes   → crudRoutes       → crudController (factory)    │
│     │   /api/proveedores→ crudRoutes       → crudController (factory)    │
│     │   /api/ventas     → venta.routes.js  → venta.controller.js         │
│     │   /api/facturas   → factura.routes.js→ factura.controller.js        │
│     │   /api/perfil     → perfil.routes.js → perfil.controller.js         │
│     │   /api/configuracion → config.routes.js → config.controller.js     │
│     │   /api/security   → security.routes.js (RSA public key)            │
│     │                                                                     │
│     ├── Servicios (`services/`): Lógica de negocio + transacciones       │
│     │   ┌────────────┐  ┌────────────┐  ┌──────────────┐                │
│     │   │ auth       │  │ venta      │  │ factura      │                │
│     │   │ Service    │  │ Service    │  │ Service      │                │
│     │   ├────────────┤  ├────────────┤  ├──────────────┤                │
│     │   │ cliente    │  │ producto   │  │ proveedor    │                │
│     │   │ Service    │  │ Service    │  │ Service      │                │
│     │   ├────────────┤  ├────────────┤  ├──────────────┤                │
│     │   │ perfil     │  │ config     │  │ actividad    │                │
│     │   │ Service    │  │ Service    │  │ Service      │                │
│     │   └────────────┘  └────────────┘  └──────────────┘                │
│     │         │                │                │                        │
│     │         ▼                ▼                ▼                        │
│     ├── Modelos (`models/`): Consultas SQL parametrizadas                │
│     │   ┌──────────────┐  ┌──────────────────┐                          │
│     │   │ user.model   │  │ session.model    │                          │
│     │   └──────────────┘  └──────────────────┘                          │
│     │                                                                     │
│     ├── Middleware: auth (JWT), decrypt (RSA), validate (express-val)    │
│     │                                                                     │
│     ├── Utilidades: crypto (JWT/bcrypt/SHA-256), fecha, totales,         │
│     │               AppError, transaction wrapper                        │
│     │                                                                     │
│     ├── Seguridad: rsaService (RSA-OAEP descifrado server-side),         │
│     │               rsa-keys (PEM), security.routes                       │
│     │                                                                     │
│     └── Static files: frontend/public, /sections, /src (dev standalone)   │
│                                                                           │
│     config/db.js (MySQL pool: 20 conexiones, auto-init, seed)            │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │ TCP 3306
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    MySQL 8.0 (InnoDB, utf8mb4)                           │
│                                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐            │
│  │ usuarios │  │productos │  │ clientes │  │ proveedores  │            │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────────┤            │
│  │ PK: id   │  │ PK: id   │  │ PK: id   │  │ PK: id       │            │
│  │ UQ: email│  │ UQ: cod  │  │ UQ: ced  │  │ UQ: nit      │            │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────────┤            │
│  │ ventas   │  │ facturas │  │ perfiles │  │ config       │            │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────────┤            │
│  │ items    │  │ items    │  │ JSON     │  │ JSON         │            │
│  │ (JSON)   │  │ (JSON)   │  │ personal │  │ reportes     │            │
│  └──────────┘  └──────────┘  │ + negocio│  │ + notif     │            │
│                              └──────────┘  └──────────────┘            │
│  ┌──────────────────┐  ┌────────────────────┐                          │
│  │ sesiones_activas  │  │ logs_actividad     │                          │
│  │ FK: usuario_id   │  │ (auditoría)        │                          │
│  │ idx: token, user │  │ idx: usuario, accion│                         │
│  └──────────────────┘  └────────────────────┘                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Responsabilidades por Capa

| Capa | Responsabilidad | Principios Aplicados |
|---|---|---|
| **Frontend SPA** | Interfaz de usuario, enrutamiento hash, sanitización XSS, cifrado híbrido Web Crypto API, persistencia de sesión y tema | Separation of Concerns, Module Pattern, Factory Method |
| **Backend API** | Lógica de negocio, autenticación/autorización JWT, validación express-validator, rate limiting, transacciones DB, seguridad HTTP, descifrado server-side | MVC modificado, Middleware Chain, Singleton (pool), Repository |
| **Base de Datos** | Persistencia relacional, integridad referencial, columnas JSON para datos flexibles, índices para desempeño, auditoría | ACID, InnoDB, Foreign Keys |

### 2.3 Patrones de Diseño Identificados

| Patrón | Ubicación | Descripción |
|---|---|---|
| **Factory Method** | `services/base/crudService.js`, `controllers/base/crudController.js`, `routes/base/crudRoutes.js` | Fábrica genérica que crea servicios, controladores y rutas CRUD con configuración declarativa (3-5 líneas por entidad) |
| **Factory Method** | `frontend/src/services/base/crudService.js`, `frontend/src/controller/base/crudController.js` | Contraparte frontend: crea servicios REST y controladores de vista parametrizados con cifrado opcional |
| **Singleton** | `config/db.js` (`getPool()`) | Pool de conexiones MySQL creado una vez y compartido globalmente en toda la aplicación |
| **Middleware Chain** | `app.js` | Pipeline Express: CORS → Helmet → JSON Parser → Rate Limiter → Auth → Routes → Error Handler |
| **Repository Pattern** | `models/*.js` | Abstracción de consultas SQL detrás de funciones con nombre descriptivo (`buscarPorEmail`, `crearSesion`) |
| **Module Pattern** | Todos los archivos JS | Cada archivo exporta un conjunto coherente de funciones sin clases; imports explícitos con ESM |
| **Dependency Injection (manual)** | Funciones factory reciben dependencias como parámetros: `crearCrudService(config)` → `crearCrudController(service)` → `crearCrudRoutes(controller)` |
| **Observer** | `main.js` (`hashchange`, `load` events) | El router escucha cambios de hash y eventos de carga para orquestar navegación |
| **Data Mapper** | `crudService.js` (`mapear()`, `construirInserts()`, `construirUpdates()`) | Traducción entre snake_case (SQL) y camelCase (JavaScript) |
| **Unit of Work** | `utils/transaction.js` (`withTransaction()`) | Transacciones automáticas con begin/commit/rollback en operaciones que lo requieren |

### 2.4 Flujo General de la Aplicación

```
1. Usuario accede a http://localhost:3000 (o vía nginx en puerto 80)
2. SPA carga index.html → main.js inicia router
3. Router lee window.location.hash (ej: #productos)
   ├─ Si es ruta pública (#login, #registro):
   │     → Carga vista HTML desde sections/{ruta}.html
   │     → Importa controller/{ruta}.js y ejecuta init()
   └─ Si es ruta protegida (ej: #productos):
         → Verifica sesión (sessionStore.estaAutenticado())
         ├─ Si no hay sesión → redirige a #login
         └─ Si hay sesión → carga vista y controlador

4. Cada controlador:
   a. Obtiene datos del backend mediante servicios REST
   b. Configura event listeners en el DOM recién inyectado
   c. Renderiza datos en tablas/formularios

5. Interacciones del usuario (click, submit):
   a. fetchApi() construye request HTTP con credentials: 'include'
   b. Si el servidor responde 401 TOKEN_EXPIRADO:
      → fetchApi() llama automáticamente a /api/auth/refresh
      → Reintenta la petición original
      → Si falla de nuevo → cierra sesión → redirige a #login

6. Backend procesa request:
   a. Middleware de rate limiting (100 req/min general, 5/15min login)
   b. Middleware de autenticación JWT (extrae token de HttpOnly cookie)
   c. Middleware de validación express-validator (schema en ruta)
   d. Controlador recibe req, llama a servicio
   e. Servicio ejecuta lógica de negocio (con transacciones si aplica)
   f. Modelo ejecuta consulta SQL parametrizada
   g. Respuesta JSON con código HTTP apropiado
```

### 2.5 Flujo de Autenticación Detallado

```
LOGIN:
1. Usuario ingresa email + password en #login
2. Frontend valida: email formato + password policy
3. POST /api/auth/login { email, password }
4. Backend:
   a. Normaliza email (trim + lowercase)
   b. Busca usuario por email → si no existe: 401 NO_REGISTRADO
   c. Verifica bloqueo (bloqueado_hasta > ahora): si bloqueado → 401 BLOQUEADO
   d. Compara password con bcrypt:
      ├─ Si falla: incrementa intentos_fallidos
      │    └─ Si >= 5: bloquea 15 minutos (bloqueado_hasta = now + 15min)
      └─ Si ok: resetea intentos_fallidos → genera tokens → crea sesión activa
   e. Setea HttpOnly cookies: accessToken (15min) + refreshToken (7d)
   f. Responde { ok: true, usuario: { id, nombre, email } }

REGISTER:
1. Frontend valida nombre, email, password, confirmación
2. POST /api/auth/register { nombre, email, password }
3. Backend:
   a. Verifica email único → si existe: 400
   b. Valida password policy
   c. Hash bcrypt de password
   d. Transacción: INSERT usuario + INSERT perfil vacío + INSERT sesión activa
   e. Genera tokens, setea cookies
   f. Responde 201 { ok: true, usuario }

REFRESH TOKEN:
1. fetchApi() recibe 401 TOKEN_EXPIRADO
2. POST /api/auth/refresh (cookie refreshToken)
3. Backend:
   a. Verifica refresh token JWT (HS256, tipo: 'refresh')
   b. Busca sesión activa por hash SHA-256 del refresh token
   c. Si no existe o expiró: 401 → frontend cierra sesión
   d. Si ok: genera nuevo accessToken, actualiza cookie
   e. Responde { ok: true, accessToken, usuario }
```

---

## 3. Estructura de Carpetas

### 3.1 Árbol Completo del Proyecto

```
Contabilidad-/
│
├── .env                                         # Variables Docker (JWT secrets)
├── .gitignore                                   # node_modules/, .env, certs/
├── AGENTS.md                                    # Onboarding para desarrolladores
├── README.md                                    # Documentación general
├── docker-compose.yml                           # Orquestación: mysql + backend + nginx
│
├── Backend/                                     # ← SERVIDOR (Node.js 20 + Express 4 ESM)
│   ├── .dockerignore
│   ├── .env                                     # Config activa (DB, JWT, SSL)
│   ├── .env.example                             # Plantilla con placeholders
│   ├── Dockerfile                               # Multi-stage: node:20-alpine
│   ├── init.sql                                 # DDL completo (10 tablas + índices)
│   ├── package.json                             # ESM, scripts: start/dev/cert:dev
│   ├── certs/                                   # SSL autofirmados (dev)
│   │   ├── cert.pem
│   │   └── key.pem
│   ├── scripts/
│   │   └── generate-cert.js                     # Generador SSL (RSA-2048, 365 días)
│   │
│   └── src/                                     # ← Código fuente del backend
│       ├── app.js                               # Config Express + middleware + rutas
│       ├── server.js                            # HTTP/HTTPS listener + SSL + DB init
│       │
│       ├── config/
│       │   ├── db.js                            # Pool MySQL + auto-init + seed automático
│       │   ├── env.js                           # Zero Default Policy (JWT obligatorios)
│       │   └── seed.js                          # Datos demo (admin, productos, clientes...)
│       │
│       ├── routes/
│       │   ├── base/
│       │   │   └── crudRoutes.js                # Factory: GET, POST, PUT, DELETE + auth + validate
│       │   ├── auth.routes.js                   # /login, /register, /refresh, /logout, /me
│       │   ├── cliente.routes.js                # CRUD vía factory
│       │   ├── configuracion.routes.js          # GET /, PUT /
│       │   ├── factura.routes.js                # GET /, POST /, PUT /:id/anular
│       │   ├── perfil.routes.js                 # GET /, PUT /
│       │   ├── product.routes.js                # CRUD vía factory
│       │   ├── proveedor.routes.js              # CRUD vía factory
│       │   └── venta.routes.js                  # GET /, POST /, PUT /:id/anular
│       │
│       ├── controllers/
│       │   ├── base/
│       │   │   └── crudController.js            # Factory: listar, crear, actualizar, eliminar
│       │   ├── auth.controller.js               # Login, register, refresh, logout, me
│       │   ├── cliente.controller.js            # CRUD vía factory
│       │   ├── configuracion.controller.js      # Obtener, guardar config
│       │   ├── factura.controller.js            # Listar, crear, anular
│       │   ├── perfil.controller.js             # Obtener, guardar perfil
│       │   ├── product.controller.js            # CRUD vía factory
│       │   ├── proveedor.controller.js          # CRUD vía factory
│       │   └── venta.controller.js              # Listar, crear, anular
│       │
│       ├── services/
│       │   ├── base/
│       │   │   └── crudService.js               # Factory: SQL genérico con transacciones
│       │   ├── actividad.service.js             # Registro de logs de auditoría
│       │   ├── auth.service.js                  # Login, register, refresh, logout, lockout
│       │   ├── clienteService.js                # CRUD vía factory
│       │   ├── configuracionService.js          # GET/PUT config con merge JSON
│       │   ├── facturaService.js                # Crear/listar/anular facturas + totales
│       │   ├── perfilService.js                 # GET/PUT perfil con merge semántico
│       │   ├── productService.js                # CRUD vía factory
│       │   ├── proveedorService.js              # CRUD vía factory
│       │   └── ventaService.js                  # Crear/listar/anular ventas + totales
│       │
│       ├── middlewares/
│       │   ├── asyncHandler.js                  # Wrapper: catch(next) para async Express
│       │   ├── auth.middleware.js               # JWT desde HttpOnly cookie, verificación tipo 'access'
│       │   ├── decrypt.middleware.js            # Descifra payload cifrado (RSA server-side)
│       │   ├── rateLimit.middleware.js          # Login: 5/15min, API: 100/min
│       │   └── validate.js                      # Ejecuta schemas express-validator
│       │
│       ├── models/
│       │   ├── session.model.js                 # CRUD sesiones + SHA-256 hashing
│       │   └── user.model.js                    # Consultas usuario + lockout
│       │
│       ├── security/
│       │   ├── rsaService.js                    # RSA key pair management + descifrado híbrido
│       │   ├── security.routes.js               # GET /api/security/public-key (JWK)
│       │   ├── rsa-private.pem                  # Clave privada RSA-2048 (generada)
│       │   └── rsa-public.pem                   # Clave pública RSA-2048 (generada)
│       │
│       ├── utils/
│       │   ├── AppError.js                      # Clase error tipificado con códigos HTTP
│       │   ├── crypto.js                        # JWT sign/verify (HS256), bcrypt, SHA-256
│       │   ├── fecha.js                         # mysqlDatetime() (JS Date → MySQL DATETIME)
│       │   ├── totales.js                       # calcularTotales() (subtotal, IVA, total)
│       │   └── transaction.js                   # withTransaction(fn) wrapper
│       │
│       └── validations/
│           ├── auth.validations.js              # loginSchema, registerSchema
│           ├── cliente.validations.js           # crearSchema, actualizarSchema
│           ├── configuracion.validations.js     # guardarSchema (reportes, notificaciones)
│           ├── factura.validations.js           # crearSchema (items array validation)
│           ├── perfil.validations.js            # guardarSchema (personal, negocio, foto)
│           ├── product.validations.js           # crearSchema, actualizarSchema
│           ├── proveedor.validations.js         # crearSchema, actualizarSchema
│           └── venta.validations.js             # crearSchema (items array validation)
│
├── deploy/
│   ├── certs/                                   # (vacío) — certificados de producción
│   └── nginx.conf                               # Proxy inverso + SPA + cabeceras seguridad + caché
│
└── frontend/                                    # ← CLIENTE (SPA Vanilla JS sin bundler)
    ├── index.html                               # Shell SPA: sidebar + <main id="contenido">
    ├── login.html                               # Página independiente (fallback SEO)
    │
    ├── sections/                                # Vistas parciales HTML (10 archivos)
    │   ├── inicio.html                          # Dashboard con KPIs configurables
    │   ├── login.html                           # Formulario de inicio de sesión
    │   ├── registro.html                        # Formulario de registro
    │   ├── productos.html                       # CRUD productos (código, nombre, precios, IVA)
    │   ├── clientes.html                        # CRUD clientes (cédula, datos contacto)
    │   ├── proveedores.html                     # CRUD proveedores (NIT, datos contacto)
    │   ├── ventas.html                          # Gestión de ventas (items, totales, finalizar)
    │   ├── facturacion.html                     # Gestión de facturas de proveedores
    │   ├── perfil.html                          # Perfil personal + datos del negocio + foto
    │   └── configuracion.html                   # Preferencias de reportes y notificaciones
    │
    ├── public/
    │   ├── css/
    │   │   ├── fonts.css                        # Declaración @font-face Roboto
    │   │   ├── login.css                        # Estilos específicos login/registro
    │   │   └── style.css                        # Estilos principales (1714 líneas, responsive)
    │   ├── fonts/                               # Roboto: 8 variantes .ttf
    │   └── img/
    │       ├── favicon-32x32.png
    │       ├── favicon1-32x32.png
    │       └── profile-img.jpg                  # Imagen de perfil por defecto
    │
    └── src/                                     # ← Código fuente del frontend
        ├── main.js                              # Router SPA hash-based (carga, sanitiza, inyecta)
        │
        ├── controller/                          # Lógica de cada vista (DOM + eventos)
        │   ├── base/
        │   │   └── crudController.js            # Factory CRUD genérica con cifrado opcional
        │   ├── login.js                         # Login handler + redirección registro
        │   ├── registro.js                      # Registro handler + email pendiente
        │   ├── inicio.js                        # Dashboard: KPIs, config, reportes
        │   ├── productos.js                     # CRUD + auto-cálculo precio venta
        │   ├── clientes.js                      # CRUD clientes
        │   ├── proveedores.js                   # CRUD proveedores
        │   ├── ventas.js                        # Flujo ventas (items → finalizar)
        │   ├── facturacion.js                   # Flujo facturas (items → finalizar)
        │   ├── perfil.js                        # Perfil personal + negocio + foto
        │   └── configuracion.js                 # Config reportes + notificaciones
        │
        ├── services/                            # Servicios de API y utilidades
        │   ├── base/
        │   │   └── crudService.js               # Factory CRUD REST (fetchApi wrapper)
        │   ├── authService.js                   # Login, register, sesión, validación
        │   ├── config.js                        # API_BASE, fetchApi, refresh automático
        │   ├── cryptoService.js                 # AES-GCM-256 + RSA-OAEP-2048 (Web Crypto API)
        │   ├── sanitize.js                      # DOMPurify wrapper
        │   ├── themeService.js                  # Tema claro/oscuro con persistencia
        │   ├── utils.js                         # Formateo COP, regex email, helpers
        │   ├── formHelpers.js                   # mostrarError, bloquearFormulario
        │   ├── clienteService.js                # API clientes (vía factory)
        │   ├── configuracionService.js          # API config
        │   ├── facturaService.js                # API facturas + calcularTotales
        │   ├── perfilService.js                 # API perfil
        │   ├── productService.js                # API productos (vía factory)
        │   ├── proveedorService.js              # API proveedores (vía factory)
        │   └── ventaService.js                  # API ventas + calcularTotales
        │
        └── store/
            └── sessionStore.js                  # Estado de sesión en memoria + storage legacy cleanup
```

---

## 4. Documentación de Módulos — Backend

### 4.1 `app.js` — Configuración Central de Express

| Aspecto | Descripción |
|---|---|
| **Propósito** | Punto de entrada Express: configura middleware global, monta rutas de API, sirve archivos estáticos del frontend, maneja errores globales |
| **Flujo** | Carga env → Inicializa RSA → Crea app Express → Configura CORS (whitelist de 7 orígenes locales) → Helmet (CSP con CDN permitido) → JSON parser (límite 5MB) → Cookie parser → Deshabilita `x-powered-by` → Trust proxy → Health check `/api/health` → Rate limiter global → Monta rutas (auth → productos → clientes → ... → security) → Sirve estáticos `/public`, `/sections`, `/src`, `/img` → Catch-all SPA (index.html) → Error handler global con AppError |
| **Dependencias** | express, cors, helmet, cookie-parser, fs, path, url; todos los route modules; rsaService |
| **Salidas** | Exporta `app` (Express instance) a `server.js` |
| **Complejidad** | Media. ~110 líneas |
| **Observaciones** | CSP en Express es laxo (permite CDN y unsafe-inline). La capa real de CSP está en nginx/Caddy. |

### 4.2 `server.js` — Inicialización del Servidor

| Aspecto | Descripción |
|---|---|
| **Propósito** | Orquesta el arranque: inicializa DB, crea servidor HTTP/HTTPS, maneja redirección HTTP→HTTPS |
| **Flujo** | `inicializarBaseDeDatos()` → Si SSL habilitado: crea HTTPS server + HTTP redirect server (puerto+1) → Si no: HTTP server |
| **Dependencias** | app, db.js, env.js, fs, http, https |
| **Complejidad** | Media. ~65 líneas |
| **Observaciones** | Si la DB no está disponible (XAMPP apagado, Docker no iniciado), el servidor termina con `process.exit(1)` después de 10 reintentos de 3s |

### 4.3 `config/db.js` — Pool de Conexiones MySQL

| Aspecto | Descripción |
|---|---|
| **Propósito** | Pool de conexiones MySQL con inicialización automática: crea DB si no existe (con reintentos), ejecuta `init.sql`, seed si tabla vacía |
| **Pool** | 20 conexiones, `waitForConnections: true`, `keepAlive: true`, `multipleStatements: true` |
| **Funciones** | `crearBaseDeDatosSiNoExiste()` — 10 reintentos x 3s; `inicializarBaseDeDatos()` — orquestación; `getPool()` — singleton |
| **Complejidad** | Alta. ~80 líneas |
| **Observaciones** | Retry amigable: muestra mensajes distintos para XAMPP vs Docker según usuario |

### 4.4 `config/env.js` — Zero Default Policy

| Aspecto | Descripción |
|---|---|
| **Propósito** | Cargar variables de entorno con **Zero Default Policy**: `process.exit(1)` si `JWT_SECRET` o `JWT_REFRESH_SECRET` no existen |
| **Exportaciones** | `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT` (3000), `SSL_ENABLED` (false), `SSL_KEY_PATH`, `SSL_CERT_PATH`, `DOMAIN`, `CORS_ORIGIN`, `ACCESS_TOKEN_EXPIRATION` (15m), `REFRESH_TOKEN_EXPIRATION` (7d), `DB_HOST` (localhost), `DB_PORT` (3306), `DB_USER` (app_user), `DB_PASSWORD` (app_doris), `DB_NAME` (MarketD&D_db), `MAX_LOGIN_ATTEMPTS` (5), `LOGIN_BLOCK_MINUTES` (15), rutas RSA |
| **Complejidad** | Baja. ~50 líneas |

### 4.5 `config/seed.js` — Datos Demo

| Aspecto | Descripción |
|---|---|
| **Propósito** | Población inicial de la base de datos con datos de demostración |
| **Datos insertados** | 1 admin (`admin@demo.com` / `Admin123`), 3 productos (Arroz, Aceite, Azúcar), 2 clientes, 2 proveedores, 1 perfil, 1 configuración |
| **Ejecución** | Automática en `inicializarBaseDeDatos()` si `SELECT COUNT(*) FROM usuarios = 0` |
| **Complejidad** | Baja. ~80 líneas |

### 4.6 `routes/base/crudRoutes.js` — Fábrica de Rutas CRUD

| Aspecto | Descripción |
|---|---|
| **Propósito** | Genera 4 rutas REST estándar para cualquier entidad con autenticación y validación |
| **Rutas generadas** | `GET /` (listar), `POST /` (crear + decrypt middleware + validate), `PUT /:id` (actualizar + decrypt + validate), `DELETE /:id` (eliminar) |
| **Middleware incluido** | `autenticar` (JWT) en todas, `descifrarSiEsCifrado` y `validate` en crear/actualizar |
| **Complejidad** | Baja. ~20 líneas |

### 4.7 `controllers/base/crudController.js` — Fábrica de Controladores CRUD

| Aspecto | Descripción |
|---|---|
| **Propósito** | Genera 4 controladores Express estándar con errores tipificados |
| **Métodos** | `listar(req, res)`, `crear(req, res)`, `actualizar(req, res)` (con 404 si no existe), `eliminar(req, res)` (204) |
| **Config** | `{ alias }` — nombre legible para mensajes de error |
| **Manejo de errores** | Captura errores con `error.status` (lanzados desde service o throw manual), devuelve 4xx/5xx según corresponda |
| **Complejidad** | Baja. ~45 líneas |

### 4.8 `services/base/crudService.js` — Fábrica de Servicios CRUD

| Aspecto | Descripción |
|---|---|
| **Propósito** | Genera 5 métodos CRUD para cualquier tabla SQL con transacciones, manejo de unique constraints y mapeo snake_case ↔ camelCase |
| **Config** | `{ tabla, alias, columnas: [{ nombre, columna }], campoUnico?, validar? }` |
| **Métodos** | `obtenerTodos()` — `SELECT * ... ORDER BY creado_en DESC`, `obtenerPorId(id)`, `crear(datos)` — con transacción + FOR UPDATE lock, `actualizar(id, cambios)` — merge parcial, `eliminar(id)` — DELETE con verificación |
| **Complejidad** | Media-alta. ~124 líneas |
| **Observaciones** | El lock pesimista `FOR UPDATE` previene condiciones de carrera en unique constraints. Las columnas `id`, `creado_en`, `actualizado_en` son implícitas |

### 4.9 `services/auth.service.js` — Autenticación

| Aspecto | Descripción |
|---|---|
| **Propósito** | Lógica completa de autenticación: login con lockout (5 intentos / 15 min bloqueo), registro con creación de perfil, refresh token, cierre de sesión |
| **Funciones** | `validarPassword(password)` — policy: 8+ chars, mayúscula, minúscula, dígito; `login(email, password, metadata)` — flujo completo; `registrar({ nombre, email, password })` — transacción; `refreshAccessToken(refreshToken)` — verifica JWT + session DB; `cerrarSesion(refreshToken)` — revoca |
| **Flujo login** | Validar email → Buscar usuario → Verificar bloqueo → Comparar bcrypt → Si falla: incrementar intentos → Si >= 5: bloquear 15 min → Si ok: resetear intentos → Generar tokens → Crear sesión activa (hash SHA-256) → Retornar |
| **Flujo registro** | Email único → Hash bcrypt → Transacción: INSERT usuario + INSERT perfil vacío + INSERT sesión activa → Generar tokens → 201 Created |
| **Complejidad** | Alta. ~200 líneas |
| **Observaciones** | Los refresh tokens se almacenan hasheados con SHA-256 en DB, no en texto plano |

### 4.10 `services/ventaService.js` y `services/facturaService.js`

| Aspecto | Descripción |
|---|---|
| **Propósito** | Gestión de ventas y facturas de compra: crear (con items JSON), listar, obtener por ID, anular (cambio de estado) |
| **Cálculo de totales** | Usan `calcularTotales()` de `utils/totales.js` con config distinta: ventas usa `tipoIva: 'diferencia'` (precio con IVA incluido), facturas usa `tipoIva: 'porcentaje'` (IVA explícito) |
| **Anulación** | Transaccional con `withTransaction()`: cambia estado a `'anulada'`, registra en `logs_actividad` |
| **Auditoría** | `actividadService.registrar()` en crear y anular con contexto (usuarioId, ipAddress, userAgent) |
| **Complejidad** | Media. ~110 líneas cada uno |
| **Observaciones** | No usan `crearCrudService` (lógica no estándar: items JSON, anulación lógica, auditoría). Patrón casi idéntico entre ambos |

### 4.11 `services/perfilService.js` y `services/configuracionService.js`

| Aspecto | Descripción |
|---|---|
| **Propósito** | GET/PUT de perfiles y configuraciones con merge semántico de campos JSON |
| **Merge** | `{ ...actual, ...nuevo }` — merge superficial que preserva campos no enviados |
| **Transacciones** | Manuales con `beginTransaction()`, `commit()`, `rollback()` (sin usar `withTransaction`) |
| **Complejidad** | Media. ~80 líneas cada uno |
| **Observaciones** | Parseo JSON con `try/catch` para tolerancia a datos corruptos |

### 4.12 `security/rsaService.js` — Servicio RSA

| Aspecto | Descripción |
|---|---|
| **Propósito** | Gestión del par RSA del servidor: genera 2048-bit keys en primera ejecución, carga desde PEM en ejecuciones posteriores, exporta clave pública como JWK, descifra paquetes híbridos |
| **Funciones** | `inicializarServicioRSA()` — singleton; `obtenerClavePublicaJwk()` — exporta JWK + alg; `descifrarPaqueteHibrido(paquete)` — RSA-OAEP decrypt + AES-256-GCM decipher |
| **Almacenamiento** | Archivos PEM: `rsa-private.pem` (modo 600), `rsa-public.pem` |
| **Complejidad** | Media. ~65 líneas |
| **Observaciones** | FASE 2: integrar con `descifrarSiEsCifrado` middleware para descifrar datos de clientes/proveedores |

### 4.13 `middlewares/auth.middleware.js` — Autenticación JWT

```
Function: autenticar(req, res, next)
Purpose:  Verifica JWT access token desde HttpOnly cookie
Flow:     1. Lee req.cookies.accessToken
          2. Si no hay token → 401 Token no proporcionado
          3. Verifica con verificarAccessToken() (HS256)
          4. Valida que payload.tipo === 'access'
          5. Inyecta req.usuario = payload
          6. Si TokenExpiredError → 401 TOKEN_EXPIRADO (refresh automático)
          7. Si otro error → 401 Token inválido
Returns:  next() si ok, 401 JSON con AppError si falla
```

### 4.14 `middlewares/decrypt.middleware.js` — Descifrado Server-Side

```
Function: descifrarSiEsCifrado(req, res, next)
Purpose:  Middleware que descifra payload cifrado (RSA server-side)
          si el body contiene req.body._cifrado
Flow:     1. Si !req.body._cifrado → next() (sin cifrado)
          2. Si formato inválido → 400
          3. Llama descifrarPaqueteHibrido()
          4. Hace merge de datos descifrados en req.body
          5. Elimina req.body._cifrado
Notes:    Usa clave privada RSA del servidor (no la del cliente).
          Previsto para cuando el frontend cifre datos sensibles.
```

### 4.15 `middlewares/rateLimit.middleware.js` — Rate Limiting

| Limitador | Ventana | Máximo | Propósito |
|---|---|---|---|
| `loginLimiter` | 15 minutos | 5 | Previene fuerza bruta en login/register |
| `apiLimiter` | 1 minuto | 100 | Previene DoS en API general |

### 4.16 `middlewares/validate.js` — Validación con express-validator

```
Function: validate(schemas)
Purpose:  Ejecuta arrays de schemas express-validator y retorna
          400 con primer error si la validación falla
Flow:     Promise.all(schemas.map(s => s.run(req))) → validationResult(req)
          → Si errores: 400 AppError('VALIDATION_ERROR') → next()
```

### 4.17 `middlewares/asyncHandler.js` — Wrapper Async

```javascript
// 1 línea: envuelve función async y pasa errores a next()
export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
```

### 4.18 `models/user.model.js` — Modelo de Usuario

| Función | Propósito | SQL |
|---|---|---|
| `buscarPorEmail(email)` | Busca usuario por email (login) | `SELECT * FROM usuarios WHERE email = ?` |
| `buscarPorId(id)` | Busca por ID (refresh/me) | `SELECT id, nombre, email, ... WHERE id = ?` |
| `crear({ id, nombre, email, passwordHash })` | Crea usuario (registro) | `INSERT INTO usuarios ...` |
| `incrementarIntentosFallidos(email)` | Incrementa contador | `UPDATE ... SET intentos_fallidos = intentos_fallidos + 1` |
| `bloquearUsuario(email, hasta)` | Bloquea cuenta | `UPDATE ... SET bloqueado_hasta = ?` |
| `resetearIntentosFallidos(email)` | Resetea contador y bloqueo | `UPDATE ... SET intentos_fallidos = 0, bloqueado_hasta = NULL` |

### 4.19 `models/session.model.js` — Modelo de Sesión

| Función | Propósito |
|---|---|
| `crearSesion({ usuarioId, refreshToken, userAgent, ipAddress, expiraEn })` | Crea sesión activa (hash SHA-256 del token) |
| `buscarSesionPorRefreshToken(refreshToken)` | Busca sesión por hash (no revocada, no expirada) |
| `revocarSesion(refreshToken)` | Marca `revocada_en = NOW()` (logout) |
| `revocarSesionesPorUsuario(usuarioId)` | Revoca todas las sesiones de un usuario |
| `limpiarSesionesExpiradas()` | DELETE de sesiones expiradas (mantenimiento) |

### 4.20 `utils/AppError.js` — Error Tipificado

```
Class:    AppError extends Error
Purpose:  Error estándar con código HTTP y código interno para respuestas JSON
Métodos:  toJSON() → { error: true, codigo: string, detalles: string }
Códigos:  400→BAD_REQUEST, 401→UNAUTHORIZED, 403→FORBIDDEN, 404→NOT_FOUND,
          409→CONFLICT, 422→VALIDATION_ERROR, 429→RATE_LIMITED, 500→INTERNAL_ERROR
```

### 4.21 `utils/crypto.js` — Operaciones Criptográficas

| Función | Propósito | Algoritmo |
|---|---|---|
| `generarAccessToken(usuario)` | JWT access (15 min) | HS256, payload: `{ id, email, nombre, tipo: 'access' }` |
| `generarRefreshToken(usuario)` | JWT refresh (7 días) | HS256, payload: `{ id, email, tipo: 'refresh' }` |
| `verificarAccessToken(token)` | Verifica access JWT | HS256 verify |
| `verificarRefreshToken(token)` | Verifica refresh JWT | HS256 verify |
| `hashToken(token)` | Hash para DB | SHA-256 hex |
| `hashPassword(password)` | Hash para almacenar | bcrypt, 10 rounds |
| `compararPassword(password, hash)` | Verifica password | bcrypt.compare |

### 4.22 `utils/totales.js` — Cálculo de Totales

```
Function: calcularTotales(items, options)
Purpose:  Calcula subtotal, total IVA y total de una lista de items
Parameters:
  items: Array<{ precio/costo, cantidad, iva/precioMasIva }>
  options: {
    precioField (default: 'precio'),
    cantidadField (default: 'cantidad'),
    tipoIva: 'diferencia' | 'porcentaje',
    campoIva: string (default: 'precioMasIva')
  }
Returns:  { subtotal, totalIva, total } (2 decimales, Math.round)
Note:     'diferencia' calcula IVA como (precioConIva - precio) * cantidad
          'porcentaje' calcula IVA como precio * (iva%/100) * cantidad
```

### 4.23 `utils/fecha.js`

```
Function: mysqlDatetime(date = new Date())
Purpose:  Convierte Date JS a formato MySQL DATETIME
Returns:  string 'YYYY-MM-DD HH:MM:SS'
```

### 4.24 `utils/transaction.js`

```
Function: withTransaction(fn)
Purpose:  Wrapper de transacciones: beginTransaction → fn(conn) → commit → return
          En caso de error: rollback → throw error
          Siempre: release connection
```

### 4.25 `validations/` — Schemas de Validación

| Archivo | Schemas | Validaciones clave |
|---|---|---|
| `auth.validations.js` | `loginSchema`, `registerSchema` | Email, password length + custom (mayúscula/minúscula/dígito), nombre required |
| `cliente.validations.js` | `crearSchema`, `actualizarSchema` | Cédula required (crear), nombre required, correo opcional isEmail |
| `product.validations.js` | `crearSchema`, `actualizarSchema` | Código required, nombre required, precioCompra/IVA/precioFinalVenta isFloat min:0 |
| `proveedor.validations.js` | `crearSchema`, `actualizarSchema` | NIT required, nombre required, correo opcional isEmail |
| `venta.validations.js` | `crearSchema` | items isArray min:1, items.* isObject, totales opcionales isFloat |
| `factura.validations.js` | `crearSchema` | items isArray min:1, items.* isObject, totales opcionales |
| `perfil.validations.js` | `guardarSchema` | body isObject, personal/negocio opcionales isObject, foto opcional isString |
| `configuracion.validations.js` | `guardarSchema` | reportes.tipo isArray, reportes.frecuencia isIn (diario/semanal/mensual), reportes.formato isIn (pdf/excel/csv), notificaciones.canales isIn (correo/sms/push) |

### 4.26 `services/actividad.service.js` — Auditoría

```
Function: registrar({ usuarioId, accion, entidad, entidadId, detalle, ipAddress, userAgent })
Purpose:  Inserta registro en logs_actividad para auditoría
Uso:      Llamado desde ventaService y facturaService en crear y anular
```

---

## 5. Documentación de Módulos — Frontend

### 5.1 `main.js` — Router SPA

| Aspecto | Descripción |
|---|---|
| **Propósito** | Router hash-based que orquesta navegación SPA: escucha `load` y `hashchange`, carga vistas HTML, sanitiza, inyecta en DOM, importa controladores |
| **Flujo** | `load` → inyectar estilos loading → `initTheme()` → `configurarCerrarSesion()` → `cargarContenido()` |
| | `cargarContenido()`: `verificarSesion()` → leer hash → `protegerRuta()` → fetch HTML (con caché en `cacheVistas`) → sanitizar con DOMPurify → inyectar en `<main id="contenido">` → import dinámico del controlador → `modulo.init()` |
| **Rutas públicas** | `login`, `registro` |
| **Rutas protegidas** | `inicio`, `productos`, `clientes`, `proveedores`, `ventas`, `facturacion`, `perfil`, `configuracion` |
| **Caché** | `cacheVistas = {}` — cachea HTML de vistas para evitar re-fetch en navegación repetida |
| **Loading** | Spinner CSS mientras se carga la vista |
| **Complejidad** | Media. ~149 líneas |
| **Observaciones** | Usa `import()` dinámico con cache-busting (`?t=${Date.now()}`) para evitar caché de módulo en desarrollo |

### 5.2 `store/sessionStore.js` — Estado de Sesión

| Aspecto | Descripción |
|---|---|
| **Propósito** | Estado de sesión en memoria con limpieza de localStorage legacy |
| **Estado** | `_usuario` (object o null), `_estaAutenticado` (boolean) |
| **Funciones** | `establecerSesion(usuario)`, `limpiarSesion()`, `estaAutenticado()`, `obtenerUsuario()`, `guardarEmailPendiente(email)`, `obtenerEmailPendiente()`, `limpiarEmailPendiente()` |
| **Observaciones** | No persiste tokens en storage — usa cookies HttpOnly. Solo persiste email pendiente para flujo login→registro |

### 5.3 `services/config.js` — Cliente HTTP Centralizado

```
Function: fetchApi(url, options)
Purpose:  Realiza requests HTTP con renovación automática de JWT
Flow:     1. fetch(url, { credentials: 'include', ...options })
          2. Si 401 TOKEN_EXPIRADO → POST /api/auth/refresh
          3. Si refresh ok → reintenta request original
          4. Si 401 persistente → cerrarSesion() → redirigir a #login
          5. 204 → return null
          6. !ok → throw Error con mensaje del servidor
          7. ok → return response.json()
          
Function: manejarRespuesta(response)
Purpose:  Procesa respuesta HTTP: 204→null, !ok→throw, ok→json
```

### 5.4 `services/authService.js` — Servicio de Autenticación

| Función | Propósito |
|---|---|
| `validarPassword(password)` | Misma policy que backend: 8+ chars, mayúscula, minúscula, dígito |
| `login(email, password)` | POST /api/auth/login + establece sesión |
| `registrar({ nombre, email, password })` | POST /api/auth/register + establece sesión |
| `cerrarSesion()` | POST /api/auth/logout + limpia sesión |
| `verificarSesion()` | GET /api/auth/me → establece sesión si ok |
| `estaAutenticado()` | Delega a sessionStore |
| `obtenerUsuario()` | Delega a sessionStore |

### 5.5 `services/cryptoService.js` — Cifrado Híbrido (Web Crypto API)

| Aspecto | Descripción |
|---|---|
| **Propósito** | Cifrado híbrido cliente: AES-GCM-256 (datos) + RSA-OAEP-2048/SHA-256 (clave). Genera par RSA en navegador, persiste en localStorage |
| **Almacenamiento** | `localStorage.setItem('contabilidad.crypto.rsaKeys', JSON.stringify({ publicKey, privateKey }))` |
| **Formato** | Claves en JWK, paquete cifrado en Base64 |
| **Funciones** | `cifrarHibrido(datos)` — cifra con par RSA local; `cifrarHibridoConClave(datos, publicKey)` — cifra con clave pública externa; `descifrarHibrido(paquete, opciones)`; `esPaqueteCifrado(valor)`; `obtenerClavePublicaServidor()` — fetch `/api/security/public-key`; `crearHashSha256(texto)` |
| **Riesgo** | Si usuario borra localStorage o cambia navegador, datos cifrados previos irrecuperables. No hay mecanismo de respaldo de clave privada |
| **Complejidad** | Alta. ~272 líneas |

### 5.6 `controller/base/crudController.js` — Factory CRUD Frontend

| Aspecto | Descripción |
|---|---|
| **Propósito** | Fábrica que genera controladores CRUD completos para el frontend: listar en tabla, formulario crear/editar, eliminar con confirmación, mensajes feedback |
| **Config** | `{ prefijoEntidad, nombreEntidad, pluralEntidad, campoBusqueda, columnasTabla, obtenerDatosFormulario, obtenerDatosCifrado, eventosExtra, onAbrirFormulario, onCerrarFormulario }` |
| **Métodos** | `init()` — carga datos, configura eventos; `configurarFormulario()` — botones nuevo/cancelar/submit; `configurarTabla()` — click en editar/eliminar; `guardarDesdeFormulario()` — valida, cifra si aplica, crea/actualiza; `abrirFormulario(item)` — populate o nuevo; `cerrarFormulario()` — reset + hide; `editar(id)` — busca item, abre formulario; `eliminar(id)` — confirm + delete; `cargarTabla()` — renderiza filas |
| **Cifrado integrado** | Si `obtenerDatosCifrado` existe: obtiene clave pública del servidor, cifra datos sensibles, los reemplaza por `_cifrado`, elimina campos原文 del payload |
| **Complejidad** | Alta. ~311 líneas |
| **Observaciones** | Es el controlador más complejo del frontend. Maneja todo el ciclo CRUD con soporte de cifrado preparado pero no activamente usado por los controladores concretos |

### 5.7 `controller/ventas.js` — Flujo de Ventas (~568 líneas)

| Aspecto | Descripción |
|---|---|
| **Propósito** | Gestión completa de ventas: nueva venta con items dinámicos, edición/eliminación de items, finalización, listado de pendientes, anulación |
| **Estado** | `ventas[]` (todas), `ventaActual` (en edición), `modoPendientes` |
| **Flujo** | `init()` → carga ventas → configura eventos → muestra pendientes → usuario crea venta → agrega items (código, nombre, cantidad, precio) → IVA 16% fijo → recalcula totales → finaliza (POST /api/ventas) → recarga lista |
| **Complejidad** | Alta. Es el controlador frontend más grande |

### 5.8 `controller/facturacion.js` — Flujo de Facturación (~624 líneas)

| Aspecto | Descripción |
|---|---|
| **Propósito** | Gestión completa de facturas de proveedores: nueva factura con info de proveedor + items, edición, finalización, pendientes, anulación |
| **Diferencias con ventas** | Incluye datos de proveedor (NIT, nombre, número factura, fecha); items con costo e IVA porcentual explícito |
| **Complejidad** | Alta. ~624 líneas (el más extenso) |

### 5.9 `controller/inicio.js` — Dashboard (~141 líneas)

| Aspecto | Descripción |
|---|---|
| **Propósito** | Dashboard con KPIS configurables según preferencias del usuario |
| **Flujo** | Carga config → aplica visibilidad de tarjetas (ventas, compras, inventario, clientes, proveedores, facturas) según `reportes.tipo` → carga datos en paralelo (Promise.all: ventas, facturas, clientes, proveedores) → formatea moneda COP |
| **Configuración aplicada** | Frecuencia (Hoy/Semana/Mes), formato de importación (PDF/Excel/CSV), badges de canales de notificación |

### 5.10 `controller/perfil.js` — Perfil (~169 líneas)

| Aspecto | Descripción |
|---|---|
| **Propósito** | Gestión de perfil personal (nombre, teléfono, email, dirección) y de negocio (nombre, tipo, ubicación, fecha creación) + foto de perfil |
| **Foto** | Carga con FileReader → dataURL → guarda en servidor vía API |
| **Merge** | Los formularios hacen merge con datos existentes (solo actualiza campos enviados) |

### 5.11 `controller/configuracion.js` — Configuración (~111 líneas)

| Aspecto | Descripción |
|---|---|
| **Propósito** | Preferencias de reportes (tipo, frecuencia, formato) y notificaciones (canales, frecuencia) |
| **Flujo** | Carga config → puebla checkboxes, radios y selects → guarda con merge → feedback toast con auto-ocultación (4s) |
| **Validación** | No hay validación cliente-side (delegada al backend) |

### 5.12 `services/themeService.js` — Tema Oscuro/Claro

| Aspecto | Descripción |
|---|---|
| **Propósito** | Alternancia de tema claro/oscuro con persistencia en localStorage y detección de preferencia del sistema |
| **Funciones** | `initTheme()` — aplica tema guardado o del sistema, escucha cambios de preferencia; `alternarTema()` — toggle; `aplicarTema(tema)` — setea `data-theme` en `<html>`, actualiza iconos SVG |
| **Persistencia** | `localStorage.setItem('contabilidad.theme', tema)` |
| **Íconos** | SVG inline para sol/luna en botones `[data-theme-toggle]` |

### 5.13 `services/sanitize.js`

```
Function: sanitizeHtml(html)
Purpose:  Sanitiza HTML con DOMPurify contra XSS
Returns:  string sanitizada (o '' si no es string)
Note:     ADD_ATTR: ['target'] permitido para enlaces externos
```

### 5.14 `services/utils.js`

| Función | Propósito |
|---|---|
| `EMAIL_REGEX` | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `normalizarNumero(valor)` | Convierte string con coma a número |
| `formatearMoneda(valor)` | `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })` |
| `formatearNumero(valor)` | Número con 2 decimales, locale es-CO |
| `esEmailValido(email)` | Test EMAIL_REGEX |
| `obtenerTextoFormulario(formData, campo)` | Trim de valor de formulario |
| `crearId()` | `crypto.randomUUID()` con fallback |

### 5.15 `services/formHelpers.js`

| Función | Propósito |
|---|---|
| `mostrarError(elemento, mensaje)` | Setea textContent + hidden=false |
| `ocultarError(elemento)` | Limpia + hidden=true |
| `bloquearFormulario(boton, bloqueado, textoAlterno)` | Deshabilita botón + cambia texto |

---

## 6. Documentación de Funciones y Métodos Clave

### 6.1 `crearCrudService(config)` — Backend: services/base/crudService.js

```
Function: crearCrudService(config)
Purpose:  Factory que genera 5 métodos CRUD para cualquier tabla SQL
Parameters:
  config.tabla       — string, nombre SQL de la tabla
  config.alias       — string, nombre legible para errores (ej: 'producto')
  config.columnas    — Array<{ nombre: string (camelCase), columna: string (snake_case) }>
  config.campoUnico  — string (opcional), nombre camelCase del campo UNIQUE
  config.validar     — function(datos) (opcional), lanza error si datos inválidos
Returns:  { obtenerTodos, obtenerPorId, crear, actualizar, eliminar }
          Cada método es AsyncFunction que retorna objetos mapeados (camelCase)
Exceptions: Error 409 (conflicto unique), Error 404 (no encontrado)
Complexity: O(n) en mapeo de columnas. Queries O(log n) con índices.
Notes:      Usa transacciones en crear(). FOR UPDATE lock en campoUnico
            previene condiciones de carrera en concurrencia.
Example:
  const productService = crearCrudService({
    tabla: 'productos',
    alias: 'producto',
    columnas: [
      { nombre: 'codigo', columna: 'codigo' },
      { nombre: 'nombre', columna: 'nombre' },
      { nombre: 'precioCompra', columna: 'precio_compra' },
      { nombre: 'iva', columna: 'iva' },
      { nombre: 'precioFinalVenta', columna: 'precio_final_venta' }
    ],
    campoUnico: 'codigo'
  })
```

### 6.2 `fetchApi(url, options)` — Frontend: services/config.js

```
Function: fetchApi(url, options)
Purpose:  Realiza requests HTTP con renovación automática de JWT
Parameters: url (string), options (RequestInit opcional)
Returns:  Promise<any> — JSON parseado de la respuesta
          204 → null
Exceptions: Error si response no es OK (mensaje del servidor)
             401 persistente → cierra sesión y redirige a #login
Flow:     1. fetch con credentials: 'include'
          2. Si 401 + TOKEN_EXPIRADO → POST /api/auth/refresh
          3. Si refresh ok → reintenta request original
          4. Si 401 nuevamente → cerrarSesion()
          5. manejarRespuesta() procesa status
Notes:    Renovación de token transparente para el llamante.
          Sin retry policy para errores de red.
```

### 6.3 `cifrarHibrido(datos)` — Frontend: services/cryptoService.js

```
Function: cifrarHibrido(datos)
Purpose:  Cifra datos con esquema híbrido AES-GCM-256 + RSA-OAEP-2048
Parameters: datos (string | Object) — se serializa a JSON si es objeto
Returns:  {
    version: 1,
    tipo: 'AES-GCM+RSA-OAEP',
    iv: string (Base64, 12 bytes aleatorios),
    claveCifrada: string (Base64, clave AES cifrada con RSA),
    datosCifrados: string (Base64, payload AES-GCM)
  }
Exceptions: Error si Web Crypto API no está disponible
Algorithm: 1. Obtener par RSA (localStorage o generar nuevo)
           2. Generar clave AES-256 con subtle.generateKey
           3. Cifrar datos con AES-GCM (IV 12 bytes)
           4. Cifrar clave AES con RSA-OAEP (clave pública)
           5. Retornar paquete con todo en Base64
Notes:     La clave privada RSA se almacena en localStorage.
           Si se borra, los datos cifrados son irrecuperables.
```

### 6.4 `login(email, password, metadata)` — Backend: services/auth.service.js

```
Function: login(email, password, metadata = {})
Purpose:  Autentica usuario con lockout por intentos fallidos
Parameters:
  email       — string
  password    — string
  metadata    — { ipAddress: string, userAgent: string }
Returns:  Success:  { ok: true, accessToken, refreshToken, usuario: { id, nombre, email } }
          Failure:  { ok: false, motivo: string, mensaje: string }
                    motivos: EMAIL_INVALIDO | NO_REGISTRADO | BLOQUEADO | PASSWORD_INVALIDA
                    BLOQUEADO incluye minutosRestantes
                    PASSWORD_INVALIDA incluye intentosRestantes
Flow:     1. Normalizar email (trim + lowercase)
           2. Validar formato email (regex)
           3. Buscar usuario por email
           4. Si no existe → NO_REGISTRADO
           5. Si bloqueado y fecha > ahora → BLOQUEADO
           6. Si bloqueado expirado → resetear intentos
           7. Comparar password con bcrypt
           8. Si falla → incrementar intentos_fallidos
              a. Si >= MAX_LOGIN_ATTEMPTS (5) → bloquear 15 min
              b. Si no → PASSWORD_INVALIDA con intentosRestantes
           9. Si ok → resetear intentos → generar tokens → crear sesión activa
Complexity: O(1) DB queries
```

### 6.5 `obtenerParRSA()` — Frontend: services/cryptoService.js

```
Function: obtenerParRSA()
Purpose:  Obtiene par RSA de localStorage o genera uno nuevo (RSA-OAEP 2048)
Returns:  { publicKey: CryptoKey, privateKey: CryptoKey }
Algorithm: 1. Leer localStorage key 'contabilidad.crypto.rsaKeys'
           2. Si existe y válido → importar JWK a CryptoKey
           3. Si no → subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048,
              publicExponent: Uint8Array([1,0,1]), hash: 'SHA-256' })
           4. Exportar a JWK → guardar en localStorage
           5. Retornar CryptoKey objects
Notes:     Keys solo para encrypt/decrypt (no sign/verify).
           Exportadas en formato JWK para serialización JSON.
```

### 6.6 `calcularTotales(items, options)` — Backend: utils/totales.js

```
Function: calcularTotales(items, options)
Purpose:  Calcula subtotal, IVA y total de una lista de items
Parameters:
  items    — Array<{ precio/costo, cantidad, iva/precioMasIva }>
  options  — {
    precioField: 'precio' | 'costo',
    cantidadField: 'cantidad',
    tipoIva: 'diferencia' (ventas) | 'porcentaje' (facturas),
    campoIva: 'precioMasIva' | 'iva'
  }
Returns:  { subtotal: number, totalIva: number, total: number }
          Todos con Math.round(x * 100) / 100 (2 decimales)
Notes:    Modo 'diferencia': IVA = (precioConIva - precio) * cantidad
          Modo 'porcentaje': IVA = precio * (iva%/100) * cantidad
```

### 6.7 `withTransaction(fn)` — Backend: utils/transaction.js

```
Function: withTransaction(fn)
Purpose:  Wrapper de transacciones ACID
Parameters: fn(connection) — callback que recibe conexión con transacción iniciada
Returns:  Resultado de fn
Flow:     getConnection() → beginTransaction() → fn(conn) → commit() → return
          catch → rollback() → throw
          finally → release()
```

### 6.8 `inicializarBaseDeDatos()` — Backend: config/db.js

```
Function: inicializarBaseDeDatos()
Purpose:  Orquesta la inicialización de la base de datos
Flow:     1. crearBaseDeDatosSiNoExiste() (10 reintentos)
           2. Crear pool (20 conexiones)
           3. Ejecutar init.sql
           4. Si usuarios vacía → seedDatabase()
Exceptions: Error con mensaje descriptivo (XAMPP vs Docker)
```

### 6.9 `autenticar(req, res, next)` — Backend: middlewares/auth.middleware.js

```
Function: autenticar(req, res, next)
Purpose:  Middleware de autenticación JWT
Flow:     1. Lee req.cookies.accessToken
           2. Si no hay token → 401
           3. verificarAccessToken(token) (HS256)
           4. Valida payload.tipo === 'access'
           5. Inyecta req.usuario = payload
           6. catch TokenExpiredError → 401 TOKEN_EXPIRADO
           7. catch → 401 Token inválido
```

### 6.10 `crearCrudController(service, config)` — Frontend: controller/base/crudController.js

```
Function: crearCrudController(service, config)
Purpose:  Factory que genera controlador CRUD frontend completo
Parameters:
  service  — objeto con métodos obtenerTodos, crear, actualizar, eliminar
  config   — { prefijoEntidad, nombreEntidad, pluralEntidad, campoBusqueda,
               columnasTabla, obtenerDatosFormulario, obtenerDatosCifrado?,
               eventosExtra?, onAbrirFormulario?, onCerrarFormulario? }
Returns:  { init: AsyncFunction }
Methods generated:
  init()        — Load data, configure form/table events, render table
  configurarFormulario() — Bind new/cancel/submit buttons
  configurarTabla()      — Delegate click on edit/delete buttons
  guardarDesdeFormulario()— Validate → encrypt (if configured) → create/update → reload
  abrirFormulario(item?) — Populate form or reset for new
  cerrarFormulario()     — Reset form, hide wrapper
  editar(id)             — Find item, open form
  eliminar(id)           — Confirm → delete → reload
  cargarTabla()          — Render rows with format/actions
Notes:    El cifrado de datos sensibles está implementado pero no activo
          en los controladores concretos actuales.
```

---

## 7. Lógica de Negocio

### 7.1 Reglas de Negocio Identificadas

| # | Regla | Implementación | Ubicación |
|---|---|---|---|
| RN-01 | **Password policy**: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 dígito | Validación dual (cliente + servidor) con misma función `validarPassword()` | `auth.service.js:14-28`, `authService.js` |
| RN-02 | **Lockout de cuenta**: 5 intentos fallidos → bloqueo 15 minutos | Contador en DB (`intentos_fallidos`), campo `bloqueado_hasta` con datetime | `auth.service.js:60-73`, `user.model.js` |
| RN-03 | **Refresh token hashing**: SHA-256 antes de almacenar en DB | `hashToken()` con `crypto.createHash('sha256')` | `crypto.js:45-47`, `session.model.js` |
| RN-04 | **Tokens con tipo**: Access `tipo: 'access'`, Refresh `tipo: 'refresh'` | Verificación en middleware auth | `crypto.js`, `auth.middleware.js:13-15` |
| RN-05 | **Sesiones revocables**: Logout marca `revocada_en`, no elimina | UPDATE con `revocada_en = NOW()`, preserve registro histórico | `session.model.js:26-32` |
| RN-06 | **Anulación lógica**: Ventas/facturas cambian estado a `'anulada'` | UPDATE estado = 'anulada' en transacción | `ventaService.js`, `facturaService.js` |
| RN-07 | **Cálculo de totales**: 2 decimales con redondeo bancario | `Math.round(x * 100) / 100` en `totales.js` | `utils/totales.js` |
| RN-08 | **IVA en ventas**: Calculado como diferencia (precio con IVA - precio) | `tipoIva: 'diferencia'` | `ventaService.js` |
| RN-09 | **IVA en facturas**: Calculado como porcentaje del costo | `tipoIva: 'porcentaje'` | `facturaService.js` |
| RN-10 | **Unique con FOR UPDATE**: Prevención de duplicados en concurrencia | `SELECT ... FOR UPDATE` en transacción | `crudService.js:52-59` |
| RN-11 | **Merge parcial en update**: Solo actualiza campos enviados | `construirUpdates()` preserva valores existentes | `crudService.js:28-33` |
| RN-12 | **Cliente por defecto**: Ventas pueden usar 'Cliente General' sin registro | `cliente_id: 'cliente-default'` hardcodeado | `ventaService.js`, `ventas.js` |
| RN-13 | **Cifrado híbrido cliente**: AES-GCM-256 cifra datos, RSA-OAEP-2048 cifra clave AES | Web Crypto API con `subtle.encrypt`/`subtle.decrypt` | `cryptoService.js` |
| RN-14 | **Zero Default Policy**: Servidor no arranca sin JWT_SECRET | `process.exit(1)` en `env.js` | `config/env.js` |
| RN-15 | **Auditoría**: Logs de actividad en crear/anular ventas y facturas | `actividadService.registrar()` con contexto completo | `ventaService.js`, `facturaService.js` |

### 7.2 Decisiones Importantes del Sistema

| Decisión | Justificación | Alternativa Considerada |
|---|---|---|
| **Items como JSON en columna** | Flexibilidad: items heterogéneos sin schema fijo. Simplicidad: no requiere tabla pivote items | Tabla normalizada `items` con FK → más consultas SQL, menos flexible para items con distintos campos |
| **UUID v4 como PK en todas las tablas** | Seguridad: no expone secuencia de IDs. Distribuido: generación cliente sin depender de DB secuencial | `AUTO_INCREMENT` → más simple pero expone número de registros |
| **Cookie HttpOnly para JWT** | Seguridad: previene XSS de robo de token (vs localStorage) | `Authorization: Bearer` header → más común pero vulnerable a XSS |
| **bcrypt para passwords** | Estándar de la industria, resistencia a ataques de fuerza bruta y rainbow tables | SHA-256 → más rápido pero inseguro para passwords; Argon2 → más seguro pero no disponible nativamente |
| **Factory CRUD en ambas caras** | Consistencia: misma interfaz para todas las entidades. Reducción de código: ~5 líneas por entidad vs ~100 | Controlador manual por entidad → más código, menos mantenible |
| **Sin tests automatizados** | MVP: velocidad de desarrollo priorizada sobre cobertura | Jest/Supertest para API → recomendado para producción |

---

## 8. API y Endpoints

### 8.1 Catálogo Completo de Endpoints

| Método | Ruta | Auth | Rate Limit | Descripción | Request Body | Response |
|---|---|---|---|---|---|---|
| `GET` | `/api/health` | No | API | Health check | — | `{ status, timestamp }` |
| `POST` | `/api/auth/login` | No | Login (5/15m) | Inicio de sesión | `{ email, password }` | `{ ok, accessToken, refreshToken, usuario }` |
| `POST` | `/api/auth/register` | No | Login (5/15m) | Registro de usuario | `{ nombre, email, password }` | `{ ok, accessToken, refreshToken, usuario }` |
| `POST` | `/api/auth/refresh` | No | API | Renovar access token | Cookie `refreshToken` | `{ ok, accessToken, usuario }` |
| `POST` | `/api/auth/logout` | Sí | API | Cerrar sesión | Cookie `refreshToken` | `{ ok, mensaje }` |
| `GET` | `/api/auth/me` | Sí | API | Info usuario actual | — | `{ usuario: { id, email, nombre } }` |
| `GET` | `/api/productos` | Sí | API | Listar productos | — | `Producto[]` |
| `POST` | `/api/productos` | Sí | API | Crear producto | `{ codigo, nombre, precioCompra, iva, precioFinalVenta }` | `Producto` (201) |
| `PUT` | `/api/productos/:id` | Sí | API | Actualizar producto | Parcial de campos | `Producto` |
| `DELETE` | `/api/productos/:id` | Sí | API | Eliminar producto | — | `204 No Content` |
| `GET` | `/api/clientes` | Sí | API | Listar clientes | — | `Cliente[]` |
| `POST` | `/api/clientes` | Sí | API | Crear cliente | `{ cedula, nombre, telefono, correo, direccion }` | `Cliente` (201) |
| `PUT` | `/api/clientes/:id` | Sí | API | Actualizar cliente | Parcial de campos | `Cliente` |
| `DELETE` | `/api/clientes/:id` | Sí | API | Eliminar cliente | — | `204 No Content` |
| `GET` | `/api/proveedores` | Sí | API | Listar proveedores | — | `Proveedor[]` |
| `POST` | `/api/proveedores` | Sí | API | Crear proveedor | `{ nit, nombre, telefono, correo, direccion }` | `Proveedor` (201) |
| `PUT` | `/api/proveedores/:id` | Sí | API | Actualizar proveedor | Parcial de campos | `Proveedor` |
| `DELETE` | `/api/proveedores/:id` | Sí | API | Eliminar proveedor | — | `204 No Content` |
| `GET` | `/api/ventas` | Sí | API | Listar ventas | — | `Venta[]` |
| `POST` | `/api/ventas` | Sí | API | Crear venta | `{ clienteId, clienteNombre, estado, items[] }` | `Venta` (201) |
| `PUT` | `/api/ventas/:id/anular` | Sí | API | Anular venta | — | `Venta` |
| `GET` | `/api/facturas` | Sí | API | Listar facturas | — | `Factura[]` |
| `POST` | `/api/facturas` | Sí | API | Crear factura | `{ proveedorNit, proveedorNombre, numeroFactura, fecha, items[] }` | `Factura` (201) |
| `PUT` | `/api/facturas/:id/anular` | Sí | API | Anular factura | — | `Factura` |
| `GET` | `/api/perfil` | Sí | API | Obtener perfil | — | `{ personal, negocio, foto }` |
| `PUT` | `/api/perfil` | Sí | API | Guardar perfil | `{ personal, negocio, foto }` | Perfil actualizado |
| `GET` | `/api/configuracion` | Sí | API | Obtener config | — | `{ reportes, notificaciones }` |
| `PUT` | `/api/configuracion` | Sí | API | Guardar config | `{ reportes, notificaciones }` | Config actualizada |
| `GET` | `/api/security/public-key` | No | API | Clave pública RSA (JWK) | — | `{ kty, n, e, alg, ... }` |

### 8.2 Formato de Respuesta de Error (AppError)

```json
{
  "error": true,
  "codigo": "BAD_REQUEST | UNAUTHORIZED | NOT_FOUND | CONFLICT | VALIDATION_ERROR | RATE_LIMITED | INTERNAL_ERROR",
  "detalles": "Mensaje descriptivo del error"
}
```

### 8.3 Códigos de Estado HTTP

| Código | Uso |
|---|---|
| `200 OK` | GET, PUT, POST (login, refresh) |
| `201 Created` | POST (creación de recursos) |
| `204 No Content` | DELETE |
| `400 Bad Request` | Validación de entrada fallida |
| `401 Unauthorized` | Token faltante, inválido, expirado, credenciales incorrectas |
| `404 Not Found` | Recurso no encontrado (GET/PUT/DELETE por ID inválido) |
| `409 Conflict` | Violación de unique constraint (código, cédula, NIT, email duplicados) |
| `429 Too Many Requests` | Rate limit excedido |
| `500 Internal Server Error` | Error no manejado del servidor |

### 8.4 Middleware por Ruta

```
/api/*
  ├─ apiLimiter (100 req/min)
  │
  ├─ /auth/*
  │   ├─ POST /login → loginLimiter (5/15min) + validate(loginSchema) → authController.login
  │   ├─ POST /register → loginLimiter (5/15min) + validate(registerSchema) → authController.register
  │   ├─ POST /refresh → authController.refresh
  │   ├─ POST /logout → autenticar → authController.logout
  │   └─ GET /me → autenticar → authController.me
  │
  ├─ /productos, /clientes, /proveedores → crudRoutes:
  │   ├─ GET / → autenticar → controller.listar
  │   ├─ POST / → autenticar + descifrarSiEsCifrado + validate(crearSchema) → controller.crear
  │   ├─ PUT /:id → autenticar + descifrarSiEsCifrado + validate(actualizarSchema) → controller.actualizar
  │   └─ DELETE /:id → autenticar → controller.eliminar
  │
  ├─ /ventas:
  │   ├─ GET / → autenticar → ventaController.listar
  │   ├─ POST / → autenticar + validate(ventaCrearSchema) → ventaController.crear
  │   └─ PUT /:id/anular → autenticar → ventaController.anular
  │
  ├─ /facturas:
  │   ├─ GET / → autenticar → facturaController.listar
  │   ├─ POST / → autenticar + validate(facturaCrearSchema) → facturaController.crear
  │   └─ PUT /:id/anular → autenticar → facturaController.anular
  │
  ├─ /perfil:
  │   ├─ GET / → autenticar → perfilController.obtener
  │   └─ PUT / → autenticar + validate(perfilSchema) → perfilController.guardar
  │
  ├─ /configuracion:
  │   ├─ GET / → autenticar → configController.obtener
  │   └─ PUT / → autenticar + validate(configSchema) → configController.guardar
  │
  └─ /security:
      └─ GET /public-key → rsaService.obtenerClavePublicaJwk()
```

---

## 9. Base de Datos

### 9.1 Diagrama Entidad-Relación

```
┌─────────────────┐       ┌───────────────────────┐
│    usuarios     │       │   sesiones_activas     │
│─────────────────│       │───────────────────────│
│ PK id (UUID)    │◄──────│ FK usuario_id (CASCADE)│
│ UQ email        │ 1   N │ refresh_token_hash    │
│ password_hash   │       │ user_agent            │
│ intentos_fallidos│       │ ip_address            │
│ bloqueado_hasta │       │ expira_en             │
│ creado_en       │       │ revocada_en           │
└──────┬──────────┘       └───────────────────────┘
       │
       │ 1
       ├─────────────────────────────────┐
       │                                 │
┌──────┴──────────┐          ┌──────────┴──────────┐
│    perfiles      │          │   configuraciones   │
│──────────────────│          │─────────────────────│
│ FK user_id (CASCADE)        │ FK user_id (CASCADE)│
│ personal (JSON)  │          │ reportes (JSON)     │
│ negocio (JSON)   │          │ notificaciones (JSON)│
│ foto (TEXT)      │          └─────────────────────┘
└──────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│    productos     │     │     clientes     │     │    proveedores      │
│──────────────────│     │──────────────────│     │─────────────────────│
│ PK id (UUID)     │     │ PK id (UUID)     │     │ PK id (UUID)        │
│ UQ codigo        │     │ UQ cedula        │     │ UQ nit              │
│ nombre           │     │ nombre           │     │ nombre              │
│ precio_compra    │     │ telefono         │     │ telefono            │
│ iva              │     │ correo           │     │ correo              │
│ precio_final_venta│     │ direccion        │     │ direccion           │
│ creado_en        │     │ creado_en        │     │ creado_en           │
│ actualizado_en   │     │ actualizado_en   │     │ actualizado_en      │
└──────────────────┘     └──────────────────┘     └─────────────────────┘

┌────────────────────────┐  ┌────────────────────────┐  ┌──────────────────────────────┐
│        ventas          │  │       facturas          │  │      logs_actividad           │
│────────────────────────│  │────────────────────────│  │──────────────────────────────│
│ PK id (UUID)           │  │ PK id (UUID)            │  │ PK id (BIGINT AUTO_INC)      │
│ cliente_id (VARCHAR)   │  │ proveedor_nit (VARCHAR) │  │ usuario_id (VARCHAR, NULL)   │
│ cliente_nombre         │  │ proveedor_nombre        │  │ accion (VARCHAR)             │
│ estado ('pendiente'…)  │  │ numero_factura          │  │ entidad, entidad_id          │
│ items (JSON)           │  │ fecha (VARCHAR)         │  │ detalle (JSON)               │
│ subtotal, total_iva,   │  │ estado ('pendiente'…)   │  │ ip_address, user_agent       │
│ total (DECIMAL 10,2)   │  │ items (JSON)            │  │ creado_en                    │
│ creado_en              │  │ subtotal, total_iva,    │  │ (idx: usuario, accion,creado)│
│ actualizado_en         │  │ total (DECIMAL 10,2)    │  └──────────────────────────────┘
└────────────────────────┘  │ creado_en               │
                            │ actualizado_en           │
                            └────────────────────────┘
```

### 9.2 Descripción de Tablas

| Tabla | Propósito | PK | FK | Unique | Columnas JSON | Índices |
|---|---|---|---|---|---|---|
| `usuarios` | Cuentas de usuario con hash bcrypt y lockout | `id VARCHAR(36)` | — | `email` | — | — |
| `productos` | Catálogo de productos con precios e IVA | `id VARCHAR(36)` | — | `codigo` | — | — |
| `clientes` | Clientes persona natural | `id VARCHAR(36)` | — | `cedula` | — | — |
| `proveedores` | Proveedores persona jurídica | `id VARCHAR(36)` | — | `nit` | — | — |
| `ventas` | Órdenes de venta con items dinámicos | `id VARCHAR(36)` | — | — | `items` | — |
| `facturas` | Facturas de compra con items dinámicos | `id VARCHAR(36)` | — | — | `items` | — |
| `perfiles` | Perfil personal y de negocio | `user_id VARCHAR(36)` | `usuarios(id) CASCADE` | — | `personal`, `negocio` | — |
| `sesiones_activas` | Sesiones JWT refresh con hash SHA-256 | `id VARCHAR(36)` | `usuarios(id) CASCADE` | — | — | `usuario_id`, `refresh_token_hash` |
| `configuraciones` | Preferencias de reportes y notificaciones | `user_id VARCHAR(36)` | `usuarios(id) CASCADE` | — | `reportes`, `notificaciones` | — |
| `logs_actividad` | Auditoría de acciones del usuario | `id BIGINT AUTO_INCREMENT` | — | — | `detalle` | `usuario_id`, `accion`, `creado_en` |

### 9.3 Diseño Desnormalizado Observado

- **Tabla `ventas`**: `cliente_id` y `cliente_nombre` son VARCHAR sin FK real a `clientes`. Permite "Cliente General" sin requerir registro en clientes, pero sacrifica integridad referencial.
- **Tabla `facturas`**: `proveedor_nit` y `proveedor_nombre` son VARCHAR sin FK. Similar al caso anterior.
- **Items**: Almacenados como JSON en columna `items` en ambas tablas `ventas` y `facturas`. Flexibilidad en estructura de items pero impide consultas SQL directas sobre los items.

### 9.4 Seed Data (Demo)

| Tabla | Datos |
|---|---|
| `usuarios` | Admin / admin@demo.com / Admin123 |
| `productos` | P001: Arroz Blanco $2,000 (IVA 19%), P002: Aceite Vegetal $5,000 (19%), P003: Azúcar Refinada $3,000 (19%) |
| `clientes` | Carlos Pérez (1234567890), María Gómez (0987654321) |
| `proveedores` | Distribuidora ABC (800123456-7), Suministros XYZ (900987654-3) |
| `perfiles` | Admin con datos demo del negocio |
| `configuraciones` | Reportes: ventas/compras/facturas/clientes/proveedores en PDF diario; Notificaciones: diario vía correo |

---

## 10. Seguridad

### 10.1 Análisis de Seguridad por Capa

| Aspecto | Estado | Implementación | Observación |
|---|---|---|---|
| **Autenticación** | ✅ | JWT HS256 con access (15m) + refresh (7d) vía HttpOnly cookies | FASE 2: migrar a RS256 asimétrico |
| **Refresh token hashing** | ✅ | SHA-256 antes de almacenar en `sesiones_activas` | Previene exposición del token en DB |
| **Password hashing** | ✅ | bcrypt con 10 rounds de sal | Estándar de la industria |
| **Password policy** | ✅ | 8+ chars, mayúscula, minúscula, dígito | Validación dual (cliente + servidor) |
| **Account lockout** | ✅ | 5 intentos fallidos → bloqueo 15 minutos | Previene fuerza bruta |
| **Rate limiting** | ✅ | Login: 5/15min por IP, API: 100/min por IP | Previene DoS y brute force |
| **JWT secrets** | ✅ | Zero Default Policy: servidor no arranca sin secretos | 256-bit HS256, Base64 |
| **SQL injection** | ✅ | Todas las queries con parámetros posicionales (`WHERE email = ?`) | mysql2 prepara statements |
| **XSS** | ✅ | DOMPurify sanitiza HTML dinámico antes de inyectar en DOM | CDN con ADD_ATTR: ['target'] |
| **CORS** | ✅ | Whitelist de 7 orígenes localhost + callback con error para no permitidos | Bloquea orígenes no autorizados |
| **Helmet** | ✅ | Cabeceras HTTP de seguridad: HSTS, X-Frame-Options, X-Content-Type-Options, etc. | CSP laxo en Express (reforzado en nginx) |
| **SSL/TLS** | ✅ | Opcional con certificados autofirmados (`npm run cert:dev`) | Producción: Let's Encrypt vía nginx |
| **Errores en producción** | ✅ | `AppError` oculta detalles en 500: mensaje genérico | Sin stack trace en JSON |
| **Cifrado híbrido** | ✅ | AES-GCM-256 + RSA-OAEP-2048 vía Web Crypto API | Cliente: clave privada en localStorage |
| **Auditoría** | ✅ | Tabla `logs_actividad` con registro en crear/anular ventas y facturas | No utilizado en CRUD estándar |
| **Sesiones** | ✅ | Revocación explícita + expiración (7d) | `revocada_en` + `expira_en` |
| **Key rotation** | ❌ | No implementado | FASE 2: soporte `kid` header |

### 10.2 Riesgos Potenciales

| # | Riesgo | Impacto | Mitigación Actual | Recomendación |
|---|---|---|---|---|
| R-01 | **Clave privada RSA en `localStorage`** | Alto — cualquier XSS (incluso mitigado por DOMPurify) podría acceder a `localStorage` y robar la clave privada | DOMPurify sanitiza HTML, pero no protege `localStorage` de scripts existentes | Usar claves RSA del servidor para cifrado server-side; mantener par cliente solo para demostración |
| R-02 | **HS256 simétrico** | Alto — cualquiera con `JWT_SECRET` puede firmar tokens arbitrarios | Zero Default Policy + secreto 256-bit Base64 | FASE 2: migrar a RS256 asimétrico con key rotation |
| R-03 | **CSP laxo en Express** | Medio — `helmet CSP` permite `unsafe-inline` en styles y CDN en scripts | nginx ya tiene CSP restrictivo configurado | En standalone (sin nginx), la protección CSP es débil |
| R-04 | **Sin tests de seguridad** | Medio — no hay validación automatizada de vulnerabilidades | — | Agregar pruebas de penetración básicas |
| R-05 | **Tokens sin `httpOnly` en localStorage legacy** | Medio — el código legacy `CLAVE_USUARIO_LEGACY` se limpia en `sessionStore.js:7-10`, pero queda evidencia de una práctica insegura anterior | `limpiarStorageLegacy()` se ejecuta al inicio | Eliminar referencias legacy del código |
| R-06 | **Cifrado cliente no conectado** | Medio — `cryptoService.js` tiene implementación completa pero no se usa en ningún flujo de datos | El middleware `descifrarSiEsCifrado` en backend está listo para recibir | Conectar cifrado en CRUD de datos sensibles (clientes, proveedores) |

---

## 11. Observaciones Técnicas

### 11.1 Deuda Técnica Identificada

| # | Deuda | Ubicación | Impacto | Prioridad |
|---|---|---|---|---|
| D-01 | **JWT almacenado en localStorage/sessionStorage (legacy)** | `sessionStore.js:7-10` | Alto — XSS puede robar tokens legacy | Alta |
| D-02 | **Cifrado híbrido no conectado a flujos de datos** | `cryptoService.js` vs `base/crudController.js:112-122` | Medio — funcionalidad implementada pero no operativa | Alta |
| D-03 | **Validación duplicada `validarPassword()`** | `auth.service.js:14-28` y `authService.js` | Bajo — dos fuentes de verdad ligeramente diferentes | Media |
| D-04 | **Ste negocio y facturaService no usan `crearCrudService`** | `services/ventaService.js`, `facturaService.js` | Medio — lógica transaccional manual duplicada | Media |
| D-05 | **Controladores con try/catch + console.error repetido** | Múltiples controladores (facturacion.js, ventas.js, perfil.js...) | Bajo — boilerplate repetitivo | Baja |
| D-06 | **`mysqlDatetime()` definido en `fecha.js` pero también usado inline** | `seed.js`, `auth.service.js` | Bajo — duplicación de formato | Baja |
| D-07 | **`escapeHtml()` no usado en `sanitize.js`** | `sanitize.js` | Bajo — código muerto | Baja |
| D-08 | **Documentación incompleta en archivos existentes** | `docs/` | Medio — archivos previos no reflejaban módulos nuevos (security, validations, decrypt middleware) | Alta |

### 11.2 Code Smells

| # | Smell | Ubicación | Explicación |
|---|---|---|---|
| S-01 | **Controladores de más de 500 líneas** | `frontend/src/controller/ventas.js` (~568), `facturacion.js` (~624) | Violación de SRP: mezclan lógica de negocio (cálculo IVA), manipulación DOM y llamadas API |
| S-02 | **Variables de estado globales mutables** | Múltiples controladores: `let ventas = []`, `let facturaActual = null`, `let modoPendientes = true` | Estado global mutable dificulta testabilidad y depuración |
| S-03 | **`confirm()` para diálogos de confirmación** | Múltiples controladores: `confirm('...')` | Bloquea UI, no personalizable, UX pobre |
| S-04 | **IDs hardcodeados en strings** | Múltiples lugares: `cliente-id: 'cliente-default'` | Difícil de rastrear y mantener |
| S-05 | **Cálculo de IVA hardcodeado al 16% en frontend** | `ventas.js`: `const iva = 0.16` | Debería ser configurable o provenir del producto |
| S-06 | **Manejo inconsistente de errores en frontend** | Algunos usan `mostrarMensaje()`, otros `console.error()`, otros solo `throw` | Falta estandarización |

### 11.3 Posibles Refactorizaciones

| # | Refactorización | Esfuerzo | Beneficio |
|---|---|---|---|
| R-01 | Migrar JWT de cookies HttpOnly a `Authorization: Bearer` header con renovación | 2-3 días | Elimina dependencia de cookie-parser, alinea con estándares REST |
| R-02 | Conectar `cryptoService.js` en CRUD de datos sensibles | 1 día | Activa cifrado real de datos en reposo |
| R-03 | Extraer lógica de ventas/facturación a servicios compartidos | 2 días | Reduce duplicación, mejora testabilidad |
| R-04 | Unificar `mostrarMensaje()` en un helper global | 4 horas | Consistencia UX, elimina duplicación |
| R-05 | Reemplazar `confirm()` con modal personalizado | 1 día | Mejora UX, no bloquea UI |
| R-06 | Agregar estados de carga en CRUD factory | 4 horas | Feedback visual al usuario |

---

## 12. Recomendaciones Profesionales

### 12.1 Mejoras de Escalabilidad

| Recomendación | Detalle | Prioridad |
|---|---|---|
| **Migrar a JWT RS256 asimétrico** | Separar firmante (servidor) de verificadores (servicios). Agregar `kid` header para key rotation. Permite que otros servicios verifiquen tokens sin compartir secreto | Alta |
| **Conectar cifrado híbrido real** | Usar `cifrarHibridoConClave()` con clave pública del servidor en datos sensibles (clientes, proveedores) antes de enviar. Backend descifra con `rsaService.descifrarPaqueteHibrido()` | Alta |
| **Implementar refresh token rotation** | Cada refresh emite nuevo refresh token y revoca el anterior. Previene reuso de refresh tokens robados | Alta |
| **Rate limiting por usuario** | Además de por IP, limitar por usuario_id para prevenir abuso de cuentas comprometidas | Media |

### 12.2 Organización y Modularización

| Recomendación | Detalle | Prioridad |
|---|---|---|
| **Separar server.js de app.js** | `server.js` ya está separado (correcto). Mantener esta separación: app.js = configuración Express, server.js = listener | ✅ Hecho |
| **Estandarizar formato de respuesta** | Usar `AppError.toJSON()` en todos los errores. Actualmente algunos endpoints devuelven `{ error, codigo, detalles }` y otros `{ ok, mensaje }` | Alta |
| **Unificar helpers frontend** | `mostrarMensaje()` está duplicado en 4+ controladores. Extraer a `services/formHelpers.js` y reutilizar | Media |
| **Tipificar con JSDoc** | Agregar anotaciones JSDoc/TSDoc en todas las funciones para mejorar IDE support y documentación auto-generada | Media |

### 12.3 Patrones Recomendados

| Patrón | Aplicación | Beneficio |
|---|---|---|
| **Strategy Pattern** | `calcularTotales()` con opciones `tipoIva: 'diferencia' | 'porcentaje'` | ✅ Ya implementado |
| **Observer/Event Emitter** | Notificaciones en tiempo real cuando se crea venta/factura | Preparar para WebSockets |
| **Repository + Data Mapper** | `models/*.js` + `crudService.js` mapeo | ✅ Ya implementado |
| **DTO (Data Transfer Object)** | Separar objetos de DB de objetos de API (actualmente son el mismo) | Baja prioridad |
| **Circuit Breaker** | Para llamadas a servicios externos (futuro: email, SMS) | Baja prioridad |

### 12.4 Prácticas DevOps

| Recomendación | Detalle | Prioridad |
|---|---|---|
| **Pipeline CI/CD** | GitHub Actions para lint → test → build → deploy | Alta |
| **Docker multi-stage optimizado** | ✅ Ya implementado con node:20-alpine | ✅ Hecho |
| **Healthcheck robusto** | ✅ Ya implementado con wget a `/api/health` y mysqladmin ping | ✅ Hecho |
| **Logs estructurados** | Reemplazar `console.log/error` por logger (pino, winston) con formato JSON y niveles | Media |
| **Variables de entorno en Docker** | ✅ Ya implementado con `.env` raíz y `Backend/.env` | ✅ Hecho |
| **Monitoreo** | Agregar métricas (Prometheus) y tracing (OpenTelemetry) | Baja |

### 12.5 Testing

| Recomendación | Detalle | Prioridad |
|---|---|---|
| **Tests unitarios backend** | Jest + Supertest para servicios y controladores. Mockear DB con `mysql2` mock | Alta |
| **Tests de integración API** | Supertest para endpoints, base de datos de test separada | Alta |
| **Tests unitarios frontend** | Vitest o JSDOM para controladores | Media |
| **Tests de seguridad** | Escaneo de vulnerabilidades en dependencias (`npm audit`), pruebas de penetración básicas | Media |
| **Cobertura mínima** | 70% en servicios backend, 50% en controladores frontend | Media |

### 12.6 Seguridad Adicional

| Recomendación | Detalle | Prioridad |
|---|---|---|
| **Content Security Policy estricta** | Implementar CSP en Express (no solo en nginx) para modo standalone. Actualmente `helmet({ contentSecurityPolicy: false })` | Alta |
| **Helmet HSTS preload** | Agregar `preload` en `Strict-Transport-Security` para dominios de producción | Media |
| **Validación de entrada** | Extender express-validator a todos los campos de todos los schemas (actualmente hay campos opcionales sin validación) | Media |
| **Sanitización de salida** | Asegurar que todas las respuestas JSON no contengan datos sensibles no intencionados | Media |
| **CORS restrictivo en producción** | Limitar whitelist de CORS a un único origen en producción (no los 7 actuales) | Media |

### 12.7 Mejoras de UX/UI

| Recomendación | Prioridad |
|---|---|
| Reemplazar `confirm()` nativo por modal personalizado no bloqueante | Alta |
| Agregar estados de carga (spinner/skeleton) en todas las operaciones CRUD | Alta |
| Feedback visual con auto-ocultación (toast) consistente en toda la app | Media |
| Paginación en tablas con muchos registros | Media |
| Búsqueda/filtro en listas (clientes, productos) | Media |
| Confirmación de eliminación con texto del elemento (no solo "¿Estás seguro?") | Baja |

---

## Apéndice A: Glosario

| Término | Definición |
|---|---|
| **SPA** | Single Page Application — aplicación que carga una sola página HTML y actualiza dinámicamente el contenido |
| **JWT** | JSON Web Token — estándar abierto para transmisión segura de información entre partes como objeto JSON |
| **HS256** | HMAC con SHA-256 — algoritmo simétrico de firma JWT |
| **RS256** | RSA con SHA-256 — algoritmo asimétrico de firma JWT |
| **AES-GCM-256** | Advanced Encryption Standard en modo Galois/Counter con clave de 256 bits |
| **RSA-OAEP-2048** | RSA con Optimal Asymmetric Encryption Padding, clave de 2048 bits |
| **bcrypt** | Función de hashing de contraseñas con sal incorporada y costo ajustable |
| **Zero Default Policy** | Principio de seguridad: no usar valores por defecto para secretos críticos |
| **CORS** | Cross-Origin Resource Sharing — mecanismo que permite peticiones HTTP entre dominios distintos |
| **CSP** | Content Security Policy — capa de seguridad que ayuda a detectar y mitigar XSS |
| **DOMPurify** | Librería de sanitización HTML que elimina contenido malicioso (XSS) |
| **UUID v4** | Identificador único universal versión 4 (aleatorio) |
| **JWK** | JSON Web Key — formato JSON para representar claves criptográficas |

## Apéndice B: Comandos de Desarrollo

```bash
# Desde Backend/

# Desarrollo con recarga automática
npm run dev

# Producción
npm start

# Generar certificados SSL autofirmados
npm run cert:dev

# Docker (desde raíz)
docker-compose up -d
docker-compose down -v   # Reiniciar con datos limpios
```

## Apéndice C: Variables de Entorno

| Variable | Requerido | Default | Descripción |
|---|---|---|---|
| `PORT` | No | `3000` | Puerto del servidor HTTP |
| `JWT_SECRET` | **Sí** | — | Secreto 256-bit HS256 (Base64) |
| `JWT_REFRESH_SECRET` | **Sí** | — | Secreto 256-bit HS256 (Base64) |
| `SSL_ENABLED` | No | `false` | Habilitar HTTPS |
| `SSL_KEY_PATH` | No | `./certs/key.pem` | Ruta clave privada SSL |
| `SSL_CERT_PATH` | No | `./certs/cert.pem` | Ruta certificado SSL |
| `DOMAIN` | No | `localhost` | Dominio del servidor |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Origen CORS permitido |
| `DB_HOST` | No | `localhost` | Host MySQL |
| `DB_PORT` | No | `3306` | Puerto MySQL |
| `DB_USER` | No | `app_user` | Usuario MySQL |
| `DB_PASSWORD` | No | `app_doris` | Contraseña MySQL |
| `DB_NAME` | No | `MarketD&D_db` | Nombre base de datos |

---

*Documento generado conforme a IEEE 1063 (Documentación de Usuario de Software) e IEEE 1016 (Descripción de Diseño de Software).*
*Versión: 1.0.0 — Fecha: 28 de mayo de 2026*
*Autor: Diego Roldán — droldan9@estudiantes.areandina.edu.co*
*Fundación Universitaria del Área Andina*
