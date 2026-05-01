# CLAUDE.md — TaskMaster-TS

## Arquitectura
- Backend: Node 20 + TypeScript + Express en `backend/src/`.
- Modelos y acceso a datos en `backend/src/models/`, ruteo en `backend/src/routes/`.
- Frontend TypeScript estático en `frontend/src/`, sin framework.
- Persistencia: SQLite, esquema en `backend/src/db/schema.sql`.
- Tests Jest en `tests/`.
- Despliegue: Docker (`Dockerfile`, `compose.yml`).

## Comandos
- `npm test` — Jest, debe quedar verde antes de commit.
- `npm run lint` — TypeScript en modo `--noEmit`, no se admiten warnings nuevos.
- `npm run build` — TypeScript a `dist/`.

## Convenciones
- Funciones puras donde sea posible.
- Nombres de variables en inglés, mensajes de UI en español.
- Tests al lado de la lógica que cubren.
- Sin lógica de negocio en `routes/` — eso vive en `models/`.

## Checklist antes de commit
- [ ] `npm test` verde.
- [ ] `npm run lint` sin warnings nuevos.
- [ ] `npm run build` ok.
- [ ] No quedan `console.log` ni `any` sin justificar.
