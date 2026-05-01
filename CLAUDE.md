# CLAUDE.md — TaskMaster-TS

## Arquitectura
- Backend: Node 20 + TypeScript + Express en `backend/src/`.
- Modelos en `backend/src/models/`, rutas en `backend/src/routes/`.
- Frontend TS estático en `frontend/src/`, sin framework.
- Persistencia: SQLite (`backend/src/db/`).
- Tests Jest en `tests/`.

## Comandos
- `npm test` — Jest, debe quedar verde antes de commit.
- `npm run lint` — TypeScript en modo `--noEmit`, sin warnings nuevos.
- `npm run build` — TypeScript a `dist/`.

## Convenciones
- Lógica de negocio en `models/`, nunca en `routes/`.
- Validación de entrada con esquemas tipados.
- Errores como `{ error: { code, message } }`.
- Estados en minúsculas: `pending`, `completed`.
- Tests al lado de la lógica que cubren.
- Sin `console.log` ni `any` sin justificar.

## Checklist antes de commit
- [ ] `npm test` verde.
- [ ] `npm run lint` sin warnings.
- [ ] `npm run build` ok.
