# TaskMaster-TS — Mini guía de arquitectura

App CRUD de tareas. Backend Node/Express + SQLite (better-sqlite3), frontend TS vanilla servido por nginx. Sin framework de UI, sin ORM, sin tests.

## Capas y flujo

```
Navegador
  frontend/src/main.ts      → DOM, eventos, render imperativo
  frontend/src/api.ts       → fetch a API_BASE (default http://localhost:3000/api)
        │ HTTP/JSON
        ▼
Backend (Express)
  backend/src/server.ts     → bootstrap: initDatabase() + app.listen(PORT=3000)
  backend/src/app.ts        → cors → json → /health → /api/tasks → errorHandler
  backend/src/routes/tasks.ts        → parseId + validateInput + handlers CRUD
  backend/src/middleware/errorHandler.ts → catch final
  backend/src/models/task.ts         → TaskModel.list/get/create/update/remove (SQL)
  backend/src/db/connection.ts       → singleton better-sqlite3 + WAL + DDL idempotente
        ▼
  data/taskmaster.db (o $DB_PATH)
```

Punto de entrada backend: `server.ts`. Punto de entrada frontend: `main.ts` (`void refresh()` al cargar).

## Dependencias críticas

1. **better-sqlite3** ([db/connection.ts](../backend/src/db/connection.ts)) — binario nativo. Si no compila para tu Node/OS, el proceso no arranca.
2. **express** ([app.ts](../backend/src/app.ts), [routes/tasks.ts](../backend/src/routes/tasks.ts)) — todo el contrato HTTP cuelga de aquí.
3. **`getDatabase()` singleton** ([db/connection.ts:36](../backend/src/db/connection.ts#L36)) — invocado en cada método de `TaskModel`. Rotura = 5 endpoints caen.
4. **`cors()`** ([app.ts:9](../backend/src/app.ts#L9)) — frontend en otro origen; sin CORS el navegador bloquea todo.
5. **`API_BASE`** ([api.ts:15](../frontend/src/api.ts#L15)) — único punto de resolución de URL del backend, con fallback hardcodeado a localhost.

## Zonas frágiles confirmadas

- **Validación en `routes/` en vez de `models/`** — [routes/tasks.ts:11-34](../backend/src/routes/tasks.ts#L11-L34). `validateInput` devuelve `TaskInput | string` (canal de error vía unión). Convención del proyecto: validar en models.
- **Sin tests** — `jest.config.js` existe pero no hay `*.test.ts` en ningún sitio. Refactors a ciegas.
- **`TaskModel.update`** — [models/task.ts:62-77](../backend/src/models/task.ts#L62-L77). Read-modify-write sin transacción + merge con `??` (no permite "vaciar" campos). Carrera latente bajo WAL.
- **`frontend/src/main.ts` monolítico** — [main.ts](../frontend/src/main.ts). DOM + render + handlers + IO en un único módulo, con casts forzados (`as HTMLFormElement`) que mienten si falta un id.
- **Errores silenciosos en cliente** — [main.ts:50-57](../frontend/src/main.ts#L50-L57). `console.error` y seguir; el usuario no se entera de fallos de red.

## Qué NO tocar sin tests primero

1. **`backend/src/models/task.ts`** — especialmente `update` (merge + reread). Cualquier cambio aquí rompe los 5 endpoints en silencio.
2. **`backend/src/db/connection.ts`** — el singleton y la inicialización lazy en `getDatabase()` son load-bearing para tests futuros y arranque del proceso.
3. **`backend/src/routes/tasks.ts` `validateInput`** — antes de moverla a `models/`, escribe tests de contrato (status codes, mensajes de error). Hoy es la única defensa contra payloads inválidos.
4. **`backend/src/app.ts`** — el orden `cors → json → routes → errorHandler` es frágil; mover el `errorHandler` o quitar `cors` rompe todo el frontend.
5. **`frontend/src/main.ts` render/handlers** — al no haber separación estado/render, cualquier reorganización (p. ej. extraer componentes) requiere validación manual exhaustiva.

## Comandos rápidos

- Backend dev: `npm run dev` en `backend/` (asume scripts estándar; revisar `package.json` antes).
- Frontend dev: build TS + servir vía `frontend/nginx.conf` o estáticos en `dist/frontend/`.
- DB: se crea sola en `data/taskmaster.db` o en `$DB_PATH`.
