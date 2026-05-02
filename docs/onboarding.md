# Guía de onboarding — TaskMaster-TS

## Día 1: pon el proyecto en marcha

```bash
npm install
npm run dev          # backend en http://localhost:3000
npm test             # confirma que todo el suite pasa en verde
```

En otra terminal, levanta el frontend:

```bash
npm run build:frontend
npx http-server dist/frontend -p 8080   # http://localhost:8080
```

Smoke test rápido: abre [http://localhost:3000/health](http://localhost:3000/health), crea una tarea desde el frontend y verifica que aparece. Antes de tocar nada, lanza `npm run lint` para ver el estado base de tipos.

Si prefieres todo en contenedores: `docker compose up --build` levanta backend (3000) + frontend (8080).

## Qué leer, en este orden

1. **[README.md](../README.md)** — contrato del API, scripts y layout. 5 minutos.
2. **[package.json](../package.json)** — scripts reales y dependencias.
3. **Backend, recorrido de una request** (entender el flujo completo antes que cualquier detalle):
   - [backend/src/server.ts](../backend/src/server.ts) — bootstrap.
   - [backend/src/app.ts](../backend/src/app.ts) — middlewares y montaje del router.
   - [backend/src/routes/tasks.ts](../backend/src/routes/tasks.ts) — endpoints REST (solo IO, sin lógica).
   - [backend/src/models/task.ts](../backend/src/models/task.ts) — **aquí vive la validación y el CRUD**. Léelo con calma.
   - [backend/src/db/connection.ts](../backend/src/db/connection.ts) — schema SQLite y `DB_PATH`.
   - [backend/src/middleware/errorHandler.ts](../backend/src/middleware/errorHandler.ts) — cómo se mapean errores a HTTP.
4. **Frontend** (es TS plano, no hay framework):
   - [frontend/index.html](../frontend/index.html) — markup base.
   - [frontend/src/main.ts](../frontend/src/main.ts) — wiring del DOM y handlers.
   - [frontend/src/api.ts](../frontend/src/api.ts) — cliente fetch tipado.
5. **Tests** como documentación ejecutable:
   - [tests/tasks.test.ts](../tests/tasks.test.ts) — comportamiento del API end-to-end (supertest).
   - [tests/db.test.ts](../tests/db.test.ts) — contrato del modelo.

## Módulos críticos que tienes que dominar

- **[backend/src/models/task.ts](../backend/src/models/task.ts)** — es el corazón del sistema. Convención del repo: **toda validación va aquí, no en `routes/`**. Si añades campos o reglas, este es el fichero.
- **[backend/src/app.ts](../backend/src/app.ts)** — punto único donde se cablean middlewares, rutas y manejo de errores.
- **[frontend/src/api.ts](../frontend/src/api.ts)** — única superficie de contacto entre cliente y backend; cualquier cambio en el contrato del API se refleja aquí.

## Convenciones y trampas

- `routes/` solo hace IO (parse request → llamar al modelo → responder). La validación **no** va aquí.
- Los tests usan SQLite `:memory:`; en runtime se persiste en `./data/taskmaster.db` (override con `DB_PATH`).
- El frontend no es SPA: HTML estático + bundle esbuild. Tras tocar `frontend/src/*` hay que `npm run build:frontend` para verlo.
- `npm run lint` es `tsc --noEmit` en backend y frontend; lánzalo antes de cada commit.
- `better-sqlite3` compila binding nativo: en Windows necesitas "Desktop development with C++" de VS Build Tools si falla `npm install`.

## Primer cambio sugerido

Añade un campo opcional al `Task` (p. ej. `priority`) siguiendo el flujo: schema en [db/connection.ts](../backend/src/db/connection.ts) → validación + CRUD en [models/task.ts](../backend/src/models/task.ts) → exposición en [routes/tasks.ts](../backend/src/routes/tasks.ts) → tipo y método en [frontend/src/api.ts](../frontend/src/api.ts) → UI en [frontend/src/main.ts](../frontend/src/main.ts) → tests en [tests/](../tests/). Te obliga a tocar todas las capas y entender el ciclo completo.
