# 📋 Backlog — TaskMaster-TS

> Tablero de incidencias. Para ver el detalle de cada una, abre el ticket.
> (Sí, hay que entrar uno por uno. Ese es el punto del vídeo.)

## En curso
- [[EV-101]] — Validación de prioridad en tareas
- [[EV-107]] — CORS abierto a `*` en producción

## Por hacer
- [[EV-102]] — Conexión SQLite sin manejo de error
- [[EV-103]] — Filtro por estado en `GET /api/tasks`
- [[EV-104]] — Falta paginación en `GET /api/tasks`
- [[EV-105]] — `created_at` se devuelve sin formato ISO
- [[EV-106]] — `DELETE /api/tasks/:id` no comprueba existencia
- [[EV-108]] — `description` acepta HTML sin sanitizar
- [[EV-110]] — Tests de integración no cubren errores 4xx

## Backlog
- [[EV-109]] — Falta endpoint de completar tareas en lote

---

| Ticket | Estado | Prioridad | Componente |
|---|---|---|---|
| [[EV-101]] | In Progress | Alta | backend/routes |
| [[EV-102]] | To Do | Crítica | backend/db |
| [[EV-103]] | To Do | Media | backend/routes |
| [[EV-104]] | To Do | Media | backend/routes |
| [[EV-105]] | To Do | Baja | backend/models |
| [[EV-106]] | To Do | Alta | backend/routes |
| [[EV-107]] | In Progress | Crítica | backend/server |
| [[EV-108]] | To Do | Alta | backend/models |
| [[EV-109]] | Backlog | Baja | backend/routes |
| [[EV-110]] | To Do | Media | tests |
