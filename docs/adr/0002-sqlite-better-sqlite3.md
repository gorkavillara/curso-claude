# ADR 0002: SQLite con `better-sqlite3` como capa de persistencia

- **Estado:** Aceptada
- **Fecha:** 2026-05-15

## Contexto

El backend necesita persistir tareas (`tasks`). El proyecto es una demo
didáctica que debe poder clonarse y arrancar sin infraestructura externa
(sin contenedor de base de datos, sin servicio gestionado). A la vez, queremos
que el código de acceso a datos se parezca a algo real, no a un array en
memoria.

## Decisión

Usamos **SQLite** mediante **`better-sqlite3`**:

- Fichero único en `./data/taskmaster.db`, ruta configurable vía `DB_PATH`.
- `journal_mode = WAL` para mejorar la concurrencia de lectura/escritura.
- API **síncrona** de `better-sqlite3` (no callbacks ni promesas).

## Alternativas consideradas

- **`sqlite3` (async)**: API basada en callbacks, más verbosa y propensa a
  errores en código didáctico.
- **PostgreSQL en Docker**: realista pero añade fricción de arranque que
  contradice el objetivo "clona y corre".
- **Array en memoria**: trivial pero no enseña una capa de persistencia real.

## Consecuencias

**Positivas**

- Cero infraestructura para arrancar; ideal para la demo.
- API síncrona → código de modelo lineal y fácil de leer.
- Mismo motor en dev y en tests (ver [ADR 0006](0006-tests-sqlite-en-memoria.md)).

**Negativas**

- `better-sqlite3` compila un binding nativo en `npm install` (en Windows
  requiere las C++ Build Tools).
- No escala a múltiples instancias del backend escribiendo a la vez; aceptable
  para el alcance de este proyecto.
