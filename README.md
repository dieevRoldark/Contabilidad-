# 🛒 D&D Market — Sistema de Gestión Contable

**MVP funcional** de una plataforma web para la gestión de inventarios, ventas, facturación y clientes, diseñada para pequeñas y medianas empresas colombianas. Incluye cifrado híbrido del lado del cliente (AES-GCM-256 + RSA-OAEP-2048) y autenticación robusta con JWT + bloqueo de cuenta.

---

## 📌 Descripción

D&D Market resuelve la necesidad de las PyMEs colombianas de contar con una herramienta digital que facilite la gestión contable básica y cumpla con los requisitos locales de tributación y facturación. El proyecto integra un frontend SPA sin framework, un backend en Node.js/Express con MySQL, y un sistema de cifrado híbrido del lado del cliente para proteger datos sensibles.

> **Estado actual:** MVP funcional con gestión de productos, clientes, proveedores, ventas, facturación, perfiles y configuración, más un subsistema completo de autenticación y sesiones.

---

## 🚀 Características del MVP

| Módulo | Funcionalidades |
|--------|----------------|
| **🔐 Autenticación** | Registro, inicio de sesión, cierre de sesión, refresh tokens, bloqueo tras 5 intentos fallidos (15 min) |
| **📦 Productos** | CRUD completo con precios, stock, IVA, precio final de venta automático |
| **👥 Clientes** | CRUD con cédula única, teléfono, correo, dirección |
| **🏭 Proveedores** | CRUD con NIT único, datos de contacto |
| **🧾 Ventas** | Registro con items dinámicos (JSON), subtotal, IVA, total, anulación |
| **📄 Facturación** | CRUD de facturas con proveedor, items, totales |
| **👤 Perfil** | Datos personales y de negocio (JSON estructurado), foto de perfil |
| **⚙️ Configuración** | Preferencias de reportes y notificaciones |
| **🌙 Tema oscuro** | Alternancia claro/oscuro con persistencia en `localStorage` |
| **🔒 Cifrado híbrido** | Cifrado AES-GCM-256 + RSA-OAEP-2048 del lado del cliente vía Web Crypto API |

---

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnologías |
|-----------|------------|
| **Frontend** | Vanilla JS (ES Modules), HTML5, CSS3, Web Crypto API, DOMPurify |
| **Backend** | Node.js 20, Express 4.21, ESM (`"type": "module"`) |
| **Base de datos** | MySQL 8.0, mysql2, InnoDB, utf8mb4 |
| **DevOps** | Docker Compose (3 servicios), nginx, Caddy, Dockerfile multi-stage |
| **Seguridad** | jsonwebtoken (HS256), bcryptjs, helmet, cors, express-rate-limit, express-validator |
| **Utilidades** | cookie-parser, dotenv, uuid |

---

## 📂 Estructura del Proyecto

```bash
Criptografia-Aplicada/
│
├── Backend/                          # Servidor Node.js + Express
│   ├── src/
│   │   ├── app.js                    # Punto de entrada
│   │   ├── config/
│   │   │   ├── db.js                 # Pool de conexión MySQL + inicialización
│   │   │   ├── env.js                # Variables de entorno (Zero Default Policy)
│   │   │   └── seed.js               # Datos de prueba (admin, productos, etc.)
│   │   ├── controllers/
│   │   │   ├── base/crudController.js # Factory de controladores CRUD
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── cliente.controller.js
│   │   │   ├── proveedor.controller.js
│   │   │   ├── venta.controller.js
│   │   │   ├── factura.controller.js
│   │   │   ├── perfil.controller.js
│   │   │   └── configuracion.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js     # Verificación JWT Bearer
│   │   │   └── rateLimit.middleware.js # Límite de peticiones
│   │   ├── models/
│   │   │   ├── user.model.js         # Consultas de usuario
│   │   │   └── session.model.js      # Gestión de sesiones
│   │   ├── routes/
│   │   │   ├── base/crudRoutes.js    # Factory de rutas CRUD
│   │   │   ├── auth.routes.js
│   │   │   └── ... (7 routers)
│   │   ├── services/
│   │   │   ├── base/crudService.js   # Factory de servicios CRUD
│   │   │   ├── auth.service.js       # Lógica de autenticación
│   │   │   └── ... (7 servicios)
│   │   └── utils/
│   │       └── crypto.js             # JWT, bcrypt, SHA-256
│   ├── init.sql                      # Esquema de base de datos (7 tablas)
│   ├── scripts/generate-cert.js      # Generador de certificados SSL
│   └── package.json
│
├── frontend/                         # SPA sin bundler
│   ├── index.html                    # Shell principal
│   ├── sections/                     # Vistas HTML parciales (10)
│   │   ├── login.html
│   │   ├── productos.html
│   │   ├── clientes.html
│   │   └── ...
│   ├── src/
│   │   ├── main.js                   # Router SPA basado en hash
│   │   ├── controller/               # Lógica de cada vista
│   │   │   ├── base/crudController.js # Factory CRUD frontend
│   │   │   └── ... (10 controllers)
│   │   └── services/                 # Consumo de API y utilidades
│   │       ├── base/crudService.js
│   │       ├── authService.js
│   │       ├── cryptoService.js      # Cifrado híbrido Web Crypto API
│   │       ├── config.js             # fetchApi, tokens, refresh automático
│   │       ├── sanitize.js           # DOMPurify + escapeHtml
│   │       ├── themeService.js       # Tema oscuro/claro
│   │       └── utils.js              # Formatos COP, validaciones
│   └── public/
│       ├── css/
│       ├── fonts/                    # Roboto (local)
│       └── img/
│
├── deploy/
│   └── nginx.conf                    # Configuración para Docker
│
├── docker-compose.yml                # MySQL + Backend + nginx
├── Caddyfile                         # Proxy reverso alternativo
└── .env                              # Variables Docker (JWT secrets)
```

### Responsabilidades por capa

- **`routes/`** — Define los endpoints HTTP y conecta con controladores.
- **`controllers/`** — Valida entrada, orquesta servicios, responde al cliente.
- **`services/`** — Lógica de negocio, cálculos, orquestación de modelos.
- **`models/`** — Consultas SQL parametrizadas a la base de datos.
- **`base/`** — Fábricas CRUD reutilizables para ambos lados (frontend y backend).

---

## ⚙️ Instalación

### Prerrequisitos

- **Node.js** 18+ (recommendado 20)
- **MySQL** 8.0 (XAMPP, servidor local o Docker)
- **Docker** y **Docker Compose** (opcional, para despliegue contenerizado)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/criptografia-aplicada.git
cd criptografia-aplicada
```

### 2. Configurar variables de entorno

```bash
cd Backend
cp .env.example .env
```

Edita `Backend/.env` con tus credenciales de MySQL (ver [Variables de Entorno](#-variables-de-entorno)).

### 3. Instalar dependencias

```bash
cd Backend
npm install
```

### 4. Inicializar la base de datos

Opción A — **Automático**: Al iniciar el servidor, `db.js` ejecuta `init.sql` y `seed.js` automáticamente si la base de datos no existe.

Opción B — **Manual**: Importa el esquema directamente:

```bash
mysql -u root -p < Backend/init.sql
```

### 5. Ejecutar en desarrollo

```bash
cd Backend
npm run dev
```

El servidor inicia en `http://localhost:3000`. Sirve el frontend estático y expone la API en `/api`.

### 6. Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| **Admin** | `admin@demo.com` | `Admin123` |

---

### 🐳 Ejecutar con Docker (recomendado)

```bash
# Desde la raíz del repositorio
docker-compose up -d
```

Esto levanta tres servicios:

- **mysql** — Base de datos MySQL 8.0
- **backend** — Servidor Node.js con Express (puerto interno `3000`)
- **nginx** — Proxy reverso + archivos estáticos, expuesto en `http://localhost:80`

> Los datos persisten en un volumen Docker (`mysql_data`). Para regenerar desde cero: `docker-compose down -v && docker-compose up -d`.

---

## 🔑 Variables de Entorno

Archivo: `Backend/.env`

| Variable | Descripción | Valor por defecto |
|----------|------------|-------------------|
| `PORT` | Puerto del servidor HTTP | `3000` |
| `JWT_SECRET` | Secreto para firmar access tokens (256-bit HS256, Base64) | **Requerido** — `process.exit(1)` si falta |
| `JWT_REFRESH_SECRET` | Secreto para firmar refresh tokens (256-bit HS256, Base64) | **Requerido** — `process.exit(1)` si falta |
| `SSL_ENABLED` | Habilitar HTTPS con certificados autofirmados | `false` |
| `SSL_KEY_PATH` | Ruta a la llave privada SSL | `./certs/key.pem` |
| `SSL_CERT_PATH` | Ruta al certificado SSL | `./certs/cert.pem` |
| `DOMAIN` | Dominio del servidor | `localhost` |
| `CORS_ORIGIN` | Origen permitido para CORS (frontend) | `http://localhost:5173` |
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_USER` | Usuario de MySQL | `app_user` |
| `DB_PASSWORD` | Contraseña de MySQL | `app_doris` |
| `DB_NAME` | Nombre de la base de datos | `MarketD&D_db` |

> **⚠️ Zero Default Policy:** Las variables `JWT_SECRET` y `JWT_REFRESH_SECRET` no tienen valor por defecto. Si no están definidas, el servidor **termina el proceso inmediatamente** para evitar operar con secretos inseguros.

---

## ▶️ Scripts Disponibles

Todos los scripts se ejecutan desde la carpeta `Backend/`.

| Comando | Descripción |
|---------|------------|
| `npm start` | Inicia el servidor en producción |
| `npm run dev` | Inicia el servidor en desarrollo con recarga automática (`--watch`, Node 18+) |
| `npm run cert:dev` | Genera certificados SSL autofirmados (RSA-2048, 365 días, CN=localhost) |

---

## 🌐 Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR (SPA)                          │
│                                                                 │
│  index.html                                                     │
│    └── main.js (Router por hash)                                │
│          ├── sections/productos.html  ← HTML inyectado          │
│          └── controller/productos.js  ← init()                  │
│                └── service/productos.js ← fetchApi()            │
│                      └── cryptoService.js (cifra datos si        │
│                           aplica antes de enviar)                │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTP (fetch)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express)                           │
│                                                                 │
│  /api/auth     → auth.routes.js     → auth.controller.js        │
│  /api/productos → product.routes.js → product.controller.js     │
│  /api/clientes  → cliente.routes.js → cliente.controller.js     │
│  /api/ventas    → venta.routes.js   → venta.controller.js       │
│  ...                                                             │
│       ↓                                                          │
│  middlewares/auth.middleware.js (JWT verification en rutas       │
│  protegidas)                                                     │
│       ↓                                                          │
│  services/*.service.js (Lógica de negocio)                       │
│       ↓                                                          │
│  models/*.model.js (Consultas SQL parametrizadas)                │
│       ↓                                                          │
│  config/db.js (Pool de conexiones MySQL)                         │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de autenticación

1. El usuario ingresa credenciales en `#login`.
2. El frontend envía `POST /api/auth/login` con email y contraseña.
3. El servidor verifica la contraseña con bcrypt, valida bloqueo por intentos, y responde con un **access token** (15 min) + **refresh token** (7 días).
4. El access token se almacena en `sessionStorage`; el refresh token en `localStorage`.
5. Cada petición protegida incluye el header `Authorization: Bearer <access_token>`.
6. Si el access token expira (`TOKEN_EXPIRADO`), el frontend llama automáticamente a `/api/auth/refresh` para obtener uno nuevo.
7. Al cerrar sesión, el refresh token se revoca en la base de datos.

### Patrón CRUD Factory

Tanto frontend como backend usan fábricas para generar operaciones CRUD consistentes:

```javascript
// Backend — 3 líneas para crear un CRUD completo
const service = crearCrudService({ tabla: 'productos', alias: 'producto', columnas, campoUnico: 'codigo' });
const controller = crearCrudController(service);
const router = crearCrudRoutes(controller);
```

---

## 📱 Diseño Responsivo

El frontend utiliza **CSS vanilla responsive** con diseño adaptable a distintos tamaños de pantalla. Incluye soporte para **tema oscuro** (`themeService.js`) con persistencia en `localStorage`. No se utiliza ningún framework CSS.

---

## 🔒 Seguridad

| Medida | Implementación |
|--------|---------------|
| **JWT HS256** | Access tokens (15 min) y refresh tokens (7 días) firmados con HMAC-SHA256 |
| **Refresh token hashing** | SHA-256 antes de almacenar en base de datos |
| **Zero Default Policy** | El servidor se detiene si `JWT_SECRET` o `JWT_REFRESH_SECRET` no están definidos |
| **Cifrado híbrido cliente** | AES-GCM-256 (datos) + RSA-OAEP-2048 (key wrapping) vía Web Crypto API |
| **bcrypt** | Contraseñas hasheadas con 10 rondas de sal |
| **Bloqueo de cuenta** | 5 intentos fallidos → bloqueo de 15 minutos |
| **Rate limiting** | Login: 5 req/15 min por IP · API global: 100 req/min por IP |
| **Helmet** | Cabeceras de seguridad HTTP (CSP parcialmente deshabilitada) |
| **CORS** | Lista blanca de orígenes localhost |
| **DOMPurify** | Sanitización de HTML dinámico contra XSS |
| **express-validator** | Validación de entrada en rutas de autenticación |
| **SQL injection** | Consultas parametrizadas con `mysql2` en todos los modelos |
| **SSL/TLS** | Soporte para HTTPS con certificados autofirmados (dev) |
| **Cookies** | Parseo con `cookie-parser` |
| **Error handling** | Manejador global que oculta detalles del error en producción |

---

## 📈 Estado del Proyecto

- ✅ **MVP funcional** — Todos los módulos básicos operativos
- 🔄 **En desarrollo activo**
- 📅 **Fase 1 completada:** Seguridad básica (JWT HS256, bcrypt, rate limiting, cifrado cliente)
- 📅 **Fase 2 (pendiente):** Migración a JWT asimétrico RS256 con rotación de llaves

---

## 🧪 Futuras Mejoras

- Migración de JWT HS256 → **RS256 asimétrico** con key rotation (`kid` header)
- Generación y almacenamiento de **pares RSA en el servidor** (`Backend/src/security/`)
- Recuperación de contraseña por correo electrónico
- Reportes y dashboard con gráficos
- Exportación a PDF/Excel
- Roles y permisos de usuario
- Notificaciones en tiempo real (WebSockets)
- Tests automatizados

---

## 👨‍💻 Autor

**Diego Roldán**  
📧 [droldan9@estudiantes.areandina.edu.co](mailto:droldan9@estudiantes.areandina.edu.co)  
🎓 Fundación Universitaria del Área Andina

---

## 📄 Licencia

Este proyecto no cuenta con una licencia definida actualmente. Todos los derechos reservados.
