# ADR 0006: Tests con SQLite en memoria (`:memory:`)

- **Estado:** Aceptada
- **Fecha:** 2026-05-15

## Contexto

La suite Jest cubre el modelo (`tests/db.test.ts`) y la API
(`tests/tasks.test.ts` con supertest). Necesitamos aislamiento entre tests,
ejecución rápida y cero artefactos en disco, pero sin sacrificar fidelidad
respecto al motor real de producción.

## Decisión

Los tests usan **SQLite en memoria** (`:memory:`) a través de la misma función
`initDatabase()` que el código de producción, inyectando la ruta de BD. Cada
suite arranca con un esquema limpio y no deja ficheros tras de sí.

## Consecuencias

**Positivas**

- **Mismo motor** que dev/producción → los tests ejercitan el SQL real, no un
  mock (coherente con [ADR 0002](0002-sqlite-better-sqlite3.md)).
- Rápidos y herméticos: sin IO de disco, sin estado compartido entre runs.
- Sin limpieza de artefactos (`taskmaster.db`) en CI ni en local.

**Negativas**

- Una BD `:memory:` vive por conexión; el aislamiento depende de inicializar
  correctamente la BD por suite.
- Comportamientos ligados al fichero (p. ej. WAL en disco) no se ejercitan en
  los tests.
