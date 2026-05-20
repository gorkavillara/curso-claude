# TaskMaster-TS — instrucciones para Claude Code

## Comandos útiles

```bash
npm run build:backend   # compilar backend TypeScript
npm test                # tests (Jest + supertest, SQLite :memory:)
npm run lint            # ESLint / type-check
```

## Convenciones

- Validación de entrada: siempre en `backend/src/models/`, nunca en routes.
- Routes son solo IO: reciben, llaman al modelo, responden. Sin lógica de negocio.
- SQLite via `better-sqlite3` (síncrono). No usar async/await en las queries.
- Tipos explícitos en todas las funciones públicas de modelos.
- Tests de integración con `supertest` + base de datos en memoria (`:memory:`).
- Decisiones arquitectónicas documentadas en `docs/adr/`.

## Arquitectura actual

- Monolito Express. No hay microservicios. No hay colas de mensajes.
- Un único proceso backend. Base de datos SQLite local (sin servidor externo).
- Frontend estático en nginx (no hay SSR).

## Antes de proponer una decisión arquitectónica

1. Revisa `docs/adr/` para ver decisiones anteriores.
2. Comprueba si el patrón ya existe en el repo antes de introducir uno nuevo.
3. Considera el coste operativo para un equipo pequeño.
4. Documenta la decisión en `docs/adr/XXXX-nombre.md`.

## Scope

No añadas dependencias externas sin consultarlo. No refactorices código no relacionado
con la tarea. Cambio acotado: solo lo que se pide.
