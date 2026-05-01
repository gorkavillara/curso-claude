# CLAUDE.md — TaskMaster-TS

## Arquitectura
- Backend: Node 20 + TypeScript + Express en `backend/src/`.
- Modelos en `backend/src/models/`, rutas en `backend/src/routes/`.
- Frontend TS estático en `frontend/src/`.
- Persistencia: SQLite (`backend/src/db/`).
- Tests Jest en `tests/`.

## Comandos
- `npm test` — Jest.
- `npm run lint` — TypeScript `--noEmit`.
- `npm run build` — Compilación a `dist/`.

## Convenciones
- Lógica de negocio en `models/`, nunca en `routes/`.
- Estados en minúsculas: `pending`, `completed`.
