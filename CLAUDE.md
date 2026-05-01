# CLAUDE.md — TaskMaster-TS

## Arquitectura
- Backend: Node 20 + TypeScript + Express en `backend/src/`.
- Modelos y acceso a datos en `backend/src/models/`, ruteo en `backend/src/routes/`.
- Frontend TypeScript estático en `frontend/src/`, sin framework.
- Persistencia: SQLite, esquema en `backend/src/db/schema.sql`.
- Tests Jest en `tests/`.

## Comandos
- `npm test` — Jest, debe quedar verde antes de commit.
- `npm run lint` — TypeScript en modo `--noEmit`.
- `npm run build` — TypeScript a `dist/`.

## Convenciones
- Sin lógica de negocio en `routes/` — eso vive en `models/`.
- Estados de tarea en minúsculas: `pending`, `completed`.
- Tests al lado de la lógica que cubren.
