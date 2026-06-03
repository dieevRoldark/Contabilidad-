# Plan de Refactorización — Market D&D (Criptografía Aplicada)

> **Fecha:** 28 de mayo de 2026
> **Rol:** Arquitectura de Software Senior — Clean Code, Seguridad y Refactorización
> **Stack:** Node.js 20 ESM + Express 4.21 + Vanilla JS SPA + MySQL 8.0 + Docker Compose

---

## Índice

1. [Diagnóstico de Calidad y Code Smells](#1-diagnóstico-de-calidad-y-code-smells)
2. [Oportunidades de Simplificación Técnica](#2-oportunidades-de-simplificación-técnica)
3. [Plan de Refactorización Paso a Paso](#3-plan-de-refactorización-paso-a-paso)
4. [Guía de Arquitectura Siguiente (To-Be)](#4-guía-de-arquitectura-siguiente-to-be)
5. [Reglas de Diseño para el Código Final](#5-reglas-de-diseño-para-el-código-final)

---

## 1. Diagnóstico de Calidad y Code Smells

**Arquitectura general:** El proyecto tiene una estructura base sólida con patrón factory CRUD en ambas caras (Rutas → Controladores → Servicios → Modelos/DB). Sin embargo, hay problemas críticos que abordar:

### 🔴 Problema 1 — Cookie-parser infrautilizado (Riesgo XSS Alto)

- `cookie-parser` está instalado y se usa para leer `accessToken` de las cookies en `auth.middleware.js:5`.
- Sin embargo, el frontend **no usa cookies** para almacenar tokens — usa `sessionStorage`/`localStorage` legacy (ver `sessionStore.js:7-10`).
- El middleware `autenticar` lee de `req.cookies.accessToken`, pero el frontend nunca setea esa cookie explícitamente. El servidor sí setea cookies en `auth.controller.js` (`res.cookie('accessToken', ...)`) con `httpOnly: true`, `secure: true`, `sameSite: 'strict'`.
- **Inconsistencia**: El servidor escribe cookies, el middleware auth las lee, pero el frontend no las necesita porque `fetchApi()` usa `credentials: 'include'` que envía cookies automáticamente. Esto **funciona correctamente** — no hay bug, pero es confuso.
- **Riesgo real**: El código legacy `CLAVE_USUARIO_LEGACY` que almacenaba tokens en storage fue limpiado (`sessionStore.js:7-10` ejecuta `limpiarStorageLegacy()`), pero queda evidencia de una práctica insegura anterior.

### 🔴 Problema 2 — Cifrado híbrido (Web Crypto API) no está integrado en ningún flujo de datos

- `frontend/src/services/cryptoService.js` exporta `cifrarHibrido()`, `cifrarHibridoConClave()`, `descifrarHibrido()` con implementación AES-GCM-256 + RSA-OAEP-2048 funcional.
- El backend tiene `security/rsaService.js` con `inicializarServicioRSA()`, `obtenerClavePublicaJwk()`, `descifrarPaqueteHibrido()`.
- El middleware `decrypt.middleware.js` está preparado para descifrar payloads entrantes con `_cifrado`.
- El factory `base/crudController.js:112-122` tiene lógica de cifrado condicional (`if (obtenerDatosCifrado) { ... }`).
- **Sin embargo**: ningún controlador concreto define `obtenerDatosCifrado` de manera que el cifrado se active. La función existe en la configuración (ej: `clientes.js:41-47`) pero el valor de retorno se usa en `base/crudController.js` para eliminar campos y reemplazar con `_cifrado` — el código **está escrito pero nunca se ejecuta** porque el bloque condicional funciona correctamente y los controladores sí proveen `obtenerDatosCifrado`.

### 🔴 Problema 3 — Validación duplicada en frontend y backend

- `validarPassword()` está duplicada en `Backend/src/services/auth.service.js:14-28` y `frontend/src/services/authService.js`. Misma lógica, dos lugares.
- `EMAIL_REGEX` en `frontend/src/services/utils.js` y validación inline en backend con `express-validator` `isEmail()`.
- Los schemas de validación existen en `Backend/src/validations/` para todas las entidades, pero **no todos los controladores los usan** — los CRUD factory sí los montan via `crudRoutes.js`, pero `venta.routes.js` y `factura.routes.js` sí los usan.

### 🟡 Problemas Adicionales Detectados

| # | Problema | Ubicación | Severidad |
|---|---|---|---|
| 4 | **Controladores frontend > 500 líneas** | `ventas.js` (568), `facturacion.js` (624) | Media — SRP violado |
| 5 | **`confirm()` nativo bloqueante** | Múltiples controladores | Media — UX pobre |
| 6 | **Cálculo IVA hardcodeado 16%** | `ventas.js` | Media — debería ser configurable |
| 7 | **Variables de estado global mutable** | `ventas.js`, `facturacion.js` | Baja — dificulta testing |
| 8 | **`mostrarMensaje()` duplicado** | 4+ controladores | Baja — boilerplate repetitivo |
| 9 | **CSP desactivado en Express** | `app.js: helmet({ contentSecurityPolicy: {...} })` | Media — nginx compensa pero standalone no |
| 10 | **`escapeHtml()` no usado** | `sanitize.js` | Baja — código muerto |
| 11 | **Sin tests automatizados** | Todo el proyecto | Alta — sin red de seguridad |

---

## 2. Oportunidades de Simplificación Técnica

| Código actual | Simplificación | Stack |
|---|---|---|
| `mysqlDatetime()` artesanal en `fecha.js` | `new Date().toISOString().slice(0, 19).replace('T', ' ')` — correcto, mantener | Node.js 20 |
| `sleep(ms)` en `db.js` | Usar `import { setTimeout } from 'timers/promises'` | ✅ Ya implementado |
| `bufferABase64()` manual en `cryptoService.js` | Combinar `String.fromCharCode` con `btoa` — correcto, mantener | Web Crypto API |
| Validación manual en controladores CRUD frontend | Los schemas `express-validator` ya existen y se usan en rutas | ✅ Ya implementado |
| `crearId()` con fallback en `utils.js` | `globalThis.crypto.randomUUID()` disponible en navegadores modernos | ✅ Ya implementado |
| `asyncHandler` en backend | ✅ Ya implementado como wrapper de 1 línea | Express 4 |
| `formHelpers.js` con `mostrarError/bloquearFormulario` | ✅ Ya extraído a helper compartido | Vanilla JS |

---

## 3. Plan de Refactorización Paso a Paso

### Fase 1: Capa de Datos y Seguridad (Alta Prioridad — 3-4 días)

| Paso | Acción | Archivos | Esfuerzo |
|---|---|---|---|
| 1.1 | **Migrar JWT completamente a HttpOnly cookies** — asegurar que el frontend nunca almacene tokens en storage. El servidor ya escribe cookies, el middleware auth ya las lee. Solo falta limpiar código legacy de storage. | `sessionStore.js`, `authService.js`, `config.js` | 4 horas |
| 1.2 | **Activar CSP en Express** con política restrictiva (no desactivar). Actualmente hay CSP laxo que permite CDN y unsafe-inline; migrar a nonce o hash para scripts inline. | `app.js` | 4 horas |
| 1.3 | **Conectar cifrado híbrido real** en CRUD de datos sensibles: hacer que `obtenerDatosCifrado` en `clientes.js`, `proveedores.js` y `productos.js` funcione y que el backend descifre con `rsaService`. | `base/crudController.js`, `clientes.js`, `proveedores.js`, `productos.js`, `decrypt.middleware.js` | 1 día |
| 1.4 | **Eliminar código muerto**: remover `escapeHtml()` no usado, limpiar referencias legacy de storage. | `sanitize.js`, `sessionStore.js` | 1 hora |
| 1.5 | **Unificar validación de password** — eliminar duplicación, mantener una única fuente de verdad en backend, frontend delega al servidor. | `authService.js` (frontend), `auth.service.js` (backend) | 2 horas |

### Fase 2: Modularización Backend (Media Prioridad — 2-3 días)

| Paso | Acción | Archivos | Esfuerzo |
|---|---|---|---|
| 2.1 | **Refactorizar ventaService y facturaService** para usar `crearCrudService` base + lógica específica (anulación, auditoría) como extensiones | `ventaService.js`, `facturaService.js`, `base/crudService.js` | 1 día |
| 2.2 | **Estandarizar respuestas de error** — asegurar que todos los endpoints usen `AppError.toJSON()` con formato consistente `{ error, codigo, detalles }` | Todos los controladores | 4 horas |
| 2.3 | **Agregar modelo de logs de actividad** — la tabla `logs_actividad` ya existe, el servicio `actividad.service.js` ya está implementado. Extender a operaciones CRUD estándar (no solo ventas/facturas) | `base/crudService.js`, `actividad.service.js` | 4 horas |
| 2.4 | **Agregar healthcheck de DB** en `/api/health` — actualmente solo responde `{ status: 'ok' }` sin verificar conexión a MySQL | `app.js` | 1 hora |

### Fase 3: Refactorización Frontend (Media Prioridad — 2-3 días)

| Paso | Acción | Archivos | Esfuerzo |
|---|---|---|---|
| 3.1 | **Extraer `mostrarMensaje()` a helper compartido** — actualmente duplicado en `ventas.js`, `facturacion.js`, `perfil.js`, `configuracion.js` y `base/crudController.js` | `formHelpers.js`, todos los controladores | 4 horas |
| 3.2 | **Reemplazar `confirm()` con modal personalizado** — crear componente Modal reutilizable con promesas | Nuevo `components/modal.js`, todos los controladores | 1 día |
| 3.3 | **Extraer lógica de cálculo de IVA/totales** de controladores a servicios — `ventas.js` y `facturacion.js` tienen lógica de negocio mezclada con DOM | `ventaService.js`, `facturaService.js` (frontend), `ventas.js`, `facturacion.js` | 1 día |
| 3.4 | **Agregar estados de carga** en operaciones CRUD (spinner mientras se guarda/carga) | `base/crudController.js`, `main.js` | 4 horas |
| 3.5 | **Refactorizar controladores > 500 líneas** — dividir `ventas.js` y `facturacion.js` en módulos más pequeños (formulario, tabla, acciones) | `ventas.js`, `facturacion.js` | 1 día |

### Fase 4: DevOps e Infraestructura (Baja Prioridad — 1-2 días)

| Paso | Acción | Archivos | Esfuerzo |
|---|---|---|---|
| 4.1 | **Pipeline CI/CD** — GitHub Actions con lint, tests, build, deploy | Nuevo `.github/workflows/ci.yml` | 1 día |
| 4.2 | **Logs estructurados** — reemplazar `console.log/error` por logger con niveles (pino/winston) | `app.js`, `server.js`, `db.js` | 4 horas |
| 4.3 | **Healthcheck de DB en `/api/health`** — que el endpoint verifique conexión a MySQL | `app.js` | 1 hora |
| 4.4 | **Validar configuración CSP en Nginx** — la configuración actual en `deploy/nginx.conf` ya tiene CSP restrictivo, verificar que funcione correctamente | `deploy/nginx.conf` | 1 hora |

---

## 4. Guía de Arquitectura Siguiente (To-Be)

### Estructura de carpetas ideal (Backend)

```
Backend/src/
├── app.js                       # Solo: crear app Express, middleware global, montar rutas
├── server.js                    # HTTP/HTTPS listener, SSL, DB init
│
├── config/
│   ├── env.js                   # Zero Default Policy (YA implementado)
│   ├── db.js                    # Pool init + multi-statement (YA implementado)
│   └── seed.js                  # Seed con mysqlDatetime() desde utils (YA implementado)
│
├── middlewares/
│   ├── auth.middleware.js       # JWT desde HttpOnly cookie (YA implementado)
│   ├── rateLimit.middleware.js  # Login (5/15min) + API (100/min) (YA implementado)
│   ├── asyncHandler.js          # catch(next) wrapper (YA implementado)
│   ├── decrypt.middleware.js    # Descifrado RSA server-side (YA implementado, listo para usar)
│   └── validate.js             # Ejecuta schemas express-validator (YA implementado)
│
├── routes/
│   ├── base/
│   │   └── crudRoutes.js       # Con validación integrada (YA implementado)
│   ├── auth.routes.js
│   ├── producto.routes.js
│   ├── cliente.routes.js
│   ├── proveedor.routes.js
│   ├── venta.routes.js
│   ├── factura.routes.js
│   ├── perfil.routes.js
│   ├── configuracion.routes.js
│   └── security.routes.js
│
├── controllers/
│   ├── base/
│   │   └── crudController.js   # SIN lógica de negocio — solo req/res/next (YA implementado)
│   ├── auth.controller.js
│   ├── cliente.controller.js
│   ├── configuracion.controller.js
│   ├── factura.controller.js
│   ├── perfil.controller.js
│   ├── product.controller.js
│   ├── proveedor.controller.js
│   └── venta.controller.js
│
├── services/                   # Toda la lógica de negocio y transacciones
│   ├── base/
│   │   └── crudService.js      # Factory CRUD genérico (YA implementado)
│   ├── auth.service.js
│   ├── actividad.service.js    # Logs de auditoría (YA implementado)
│   ├── clienteService.js
│   ├── configuracionService.js
│   ├── facturaService.js
│   ├── perfilService.js
│   ├── productService.js
│   ├── proveedorService.js
│   └── ventaService.js
│
├── models/                     # Solo queries SQL puras (sin lógica de negocio)
│   ├── user.model.js
│   └── session.model.js
│
├── utils/                      # Utilidades PURAS (sin imports de proyecto)
│   ├── AppError.js             # Error tipificado (YA implementado)
│   ├── crypto.js               # JWT + bcrypt + SHA-256 (YA implementado)
│   ├── fecha.js                # mysqlDatetime() (YA implementado)
│   ├── totales.js              # calcularTotales() (YA implementado)
│   └── transaction.js          # withTransaction() (YA implementado)
│
├── security/                   # RSA keys + servicio (YA implementado)
│   ├── rsaService.js
│   ├── security.routes.js
│   ├── rsa-private.pem
│   └── rsa-public.pem
│
└── validations/                # Schemas express-validator (YA implementado, 8 archivos)
    ├── auth.validations.js
    ├── cliente.validations.js
    ├── configuracion.validations.js
    ├── factura.validations.js
    ├── perfil.validations.js
    ├── product.validations.js
    ├── proveedor.validations.js
    └── venta.validations.js
```

### Estructura de carpetas ideal (Frontend)

```
frontend/src/
├── main.js                     # Router SPA + lazy loading + loading states (YA implementado)
│
├── controller/                 # DOM handlers + eventos + renderizado
│   ├── base/
│   │   └── crudController.js   # CON cifrado híbrido conectado (YA implementado, listo)
│   ├── login.js
│   ├── registro.js
│   ├── inicio.js
│   ├── productos.js
│   ├── clientes.js
│   ├── proveedores.js
│   ├── ventas.js               # REFACTORIZAR: dividir en < 300 líneas
│   ├── facturacion.js          # REFACTORIZAR: dividir en < 300 líneas
│   ├── perfil.js
│   └── configuracion.js
│
├── services/                   # API calls + lógica de dominio del cliente
│   ├── base/
│   │   └── crudService.js      # fetchApi + cifrado automático (YA implementado)
│   ├── authService.js
│   ├── cryptoService.js        # Web Crypto API (YA implementado, listo para conectar)
│   ├── sanitize.js             # Solo DOMPurify (YA implementado)
│   ├── config.js               # fetchApi, token refresh, API_BASE (YA implementado)
│   ├── utils.js                # Formateo, regex, helpers puros (YA implementado)
│   ├── formHelpers.js          # mostrarError, bloquearFormulario (YA implementado)
│   ├── themeService.js         # Tema claro/oscuro (YA implementado)
│   ├── clienteService.js
│   ├── configuracionService.js
│   ├── facturaService.js
│   ├── perfilService.js
│   ├── productService.js
│   ├── proveedorService.js
│   └── ventaService.js
│
└── store/
    └── sessionStore.js         # Estado de sesión en memoria (YA implementado, legacy cleanup OK)
```

---

## 5. Reglas de Diseño para el Código Final

1. **Capa no salta**: `routes → controller → service → DB (model/pool)`. Controller nunca toca `getPool()` directo.

2. **Ruta no valida**: La validación `express-validator` se declara en la ruta como middleware, no en el controlador. ✅ Ya implementado.

3. **Una fuente de verdad por token**: JWT solo en HttpOnly cookie (Secure + SameSite=Strict). Sin `Authorization` header. ✅ Ya implementado en servidor. Pendiente: limpiar legacy de storage.

4. **No más duplicación**: Toda regex de email, validación de password, formato de fecha vive en un solo lugar — `utils/`.

5. **Cifrado conectado**: `cryptoService.js` se invoca automáticamente desde `base/crudService.js` para datos sensibles configurados por entidad. ✅ Código listo, pendiente activación.

6. **Estado de sesión centralizado**: `sessionStore.js` es la única puerta de entrada/salida al estado de sesión. ✅ Ya implementado.

7. **Controlador frontend no mezcla lógica de negocio**: Solo orquesta DOM y eventos; llama a servicios para datos. ❌ `ventas.js` y `facturacion.js` violan esta regla.

8. **Error handler unificado**: Backend usa `asyncHandler` wrapper + `AppError.toJSON()`. Frontend usa `try/catch` en `init()` y muestra feedback al usuario con `mostrarMensaje()`. ⚠️ Pendiente: unificar `mostrarMensaje()`.

9. **Cero configuraciones en producción sin validar**: Toda variable de entorno crítica (DB, JWT, CORS) dispara `process.exit(1)` si falta. ✅ Zero Default Policy implementada.

10. **Logging estructurado**: Reemplazar `console.error()` por logger con niveles (info, warn, error). Pendiente.

---

## Resumen de Prioridades

| Prioridad | Acción | Esfuerzo | Impacto |
|---|---|---|---|
| 🔴 **Crítica** | Activar cifrado híbrido en flujos de datos | 1 día | Seguridad de datos en reposo |
| 🔴 **Crítica** | Migrar JWT completamente a cookies HttpOnly (limpiar legacy) | 4 horas | Eliminar riesgo XSS en storage |
| 🟡 **Alta** | Activar CSP en Express | 4 horas | Seguridad HTTP en modo standalone |
| 🟡 **Alta** | Agregar tests automatizados (API + servicios) | 2-3 días | Red de seguridad para refactorización |
| 🟡 **Alta** | Refactorizar controladores frontend > 500 líneas | 2 días | Mantenibilidad |
| 🟢 **Media** | Unificar `mostrarMensaje()`, reemplazar `confirm()`, agregar loading states | 2 días | UX consistente |
| 🟢 **Media** | Pipeline CI/CD | 1 día | Automatización |
| ⚪ **Baja** | Logs estructurados, healthcheck DB, eliminar código muerto | 4 horas | Calidad de código |

---

*Documento generado como parte del análisis de arquitectura del proyecto Market D&D (Criptografía Aplicada).*
*Versión: 2.0 — Fecha: 28 de mayo de 2026*
