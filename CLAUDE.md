# TaskMaster-TS — instrucciones para Claude Code

## Comandos

```bash
npm run build:backend   # compilar TypeScript
npm test                # tests (Jest + supertest, SQLite :memory:)
npm run lint            # type-check
npm run dev             # backend con hot reload
```

## Convenciones obligatorias

- **Validación de entrada:** siempre en `backend/src/models/`, nunca en routes.
- **Routes:** solo IO — reciben, llaman al modelo, responden. Sin lógica.
- **SQLite:** via `better-sqlite3` (síncrono). Sin async/await en queries.
- **Tests:** siempre con base de datos `:memory:`. No toques la BD de desarrollo.
- **Scope:** no refactorices código no relacionado con la tarea pedida.
- **Dependencias:** no añadas packages sin consultarlo.

## Arquitectura

```
backend/src/
├── app.ts              # Express app factory
├── server.ts           # entry point
├── db/connection.ts    # SQLite init y schema
├── models/task.ts      # CRUD del modelo Task
├── routes/tasks.ts     # endpoints REST
└── middleware/
    └── errorHandler.ts
```

Monolito Express. Base de datos SQLite local. Frontend estático (nginx).
Sin colas, sin microservicios, sin workers externos.

## Antes de editar

1. Si el cambio toca la DB: revisa `db/connection.ts` primero (schema).
2. Si añades un endpoint: sigue el patrón de `routes/tasks.ts`.
3. Si añades lógica: va en `models/`, no en `routes/`.
4. Al terminar: lanza `npm test` y verifica que pasan.

## Endpoint pendiente de implementar (vídeo 48)

`GET /api/tasks/today` — devuelve las tareas cuya `due_date` sea la fecha de hoy (UTC).
**No está implementado.** Se implementa en directo durante el vídeo.
