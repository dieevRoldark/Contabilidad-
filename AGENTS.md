# AGENTS.md — D&D Market (Criptografía Aplicada)

## Stack

- **Frontend**: Vanilla JS SPA (no bundler, no `package.json`). Hash-based router at `frontend/src/main.js`.
- **Backend**: Node.js 20, Express 4, ESM (`"type": "module"`). Entry: `Backend/src/app.js`.
- **DB**: MySQL 8.0.
- **Infra**: Docker Compose (mysql + backend + nginx). Also runnable standalone (backend serves frontend statically on `:3000`).

## Dev commands (from `Backend/`)

| Command | Action |
|---|---|
| `npm run dev` | Dev server with `--watch` on `src/app.js` |
| `npm start` | Production start |
| `npm run cert:dev` | Generate self-signed SSL certs |

## Database setup

- **XAMPP dev**: `root` / empty password @ `localhost:3306`
- **Docker**: `app_user` / `app_doris` @ `mysql:3306`
- DB created automatically on first run via `init.sql` + `seed.js`
- Config in `Backend/.env` (copy from `.env.example` if missing)

## Architecture

- Frontend SPA: `window.location.hash` → fetches `sections/{ruta}.html` → imports `controller/{ruta}.js#init()`.
- API base: `/api` (overridable via `window.API_HOST`).
- CRUD factory pattern on both sides: `crearCrudService()` / `crearCrudController() / crearCrudRoutes()`.
- All authenticated routes protect with JWT Bearer token. Token refresh via `/api/auth/refresh`.

## Crypto

- **Client-side hybrid encryption** (AES-GCM-256 + RSA-OAEP-2048) via Web Crypto API in `frontend/src/services/cryptoService.js`.
- **Password hashing (server)**: bcrypt.
- **Password hashing (client demo)**: SHA-256 — demo-only, not for production.
- **RSA key pair** generated in browser, stored in `localStorage` under `contabilidad.crypto.rsaKeys`. Clearing it regenerates keys and breaks previously encrypted data.

## Docker (from repo root)

```bash
docker-compose up -d
```

Mounts `frontend/` dirs into nginx container. Nginx serves frontend, reverse-proxies `/api` to backend.

## Important quirks

- **No tests, linter, or formatter** configured anywhere.
- Frontend uses `DOMPurify` (loaded from CDN) for XSS protection.
- Server `--watch` flag works with Node 18+ (no `nodemon` needed).
- **🔐 FASE 1 COMPLETADA:** `Backend/src/security/` directory is empty — placeholder for future RSA keys.
- **🔐 FASE 1:** `Backend/src/config/env.js` — Zero Default Policy: `process.exit(1)` si `JWT_SECRET` o `JWT_REFRESH_SECRET` no están definidos.
- **🔐 FASE 1:** Secrets regenerados (256-bit HS256, Base64) via `[System.Security.Cryptography.RandomNumberGenerator]`.
- **🔐 FASE 2 (pendiente):** Migrar de HS256 → RS256 asimétrico. Ver comentarios en `crypto.js` y `auth.middleware.js`.
- Session refresh tokens are hashed with SHA-256 before DB storage.
- Account lockout after 5 failed login attempts (15 min block).
- All code in Spanish (`nombreEntidad`, `prefijoEntidad`, etc.). Follow existing naming.
- Docker environment variables override via root `.env`.
