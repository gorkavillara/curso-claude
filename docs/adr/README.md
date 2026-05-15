# Architecture Decision Records (ADR)

Este directorio contiene los **Architecture Decision Records** de TaskMaster-TS.
Un ADR documenta una decisión arquitectónica significativa: el contexto, la
decisión tomada y sus consecuencias.

Formato: [MADR](https://adr.github.io/madr/) simplificado.

## Índice

| ADR | Título | Estado |
| --- | ------ | ------ |
| [0001](0001-usar-adrs.md) | Registrar decisiones de arquitectura con ADRs | Aceptada |
| [0002](0002-sqlite-better-sqlite3.md) | SQLite con `better-sqlite3` como capa de persistencia | Aceptada |
| [0003](0003-monorepo-tsconfig-compartido.md) | Monorepo con `tsconfig.base.json` compartido | Aceptada |
| [0004](0004-validacion-en-models.md) | La validación vive en `models/`, no en `routes/` | Aceptada |
| [0005](0005-docker-compose-dos-servicios.md) | Docker Compose con dos servicios (backend + frontend) | Aceptada |
| [0006](0006-tests-sqlite-en-memoria.md) | Tests con SQLite en memoria (`:memory:`) | Aceptada |

## Estados posibles

- **Propuesta** — en discusión, sin aplicar.
- **Aceptada** — vigente.
- **Rechazada** — evaluada y descartada.
- **Obsoleta** — ya no aplica.
- **Sustituida por ADR-XXXX** — reemplazada por otra decisión.

## Cómo añadir un nuevo ADR

1. Copia la estructura de un ADR existente.
2. Numéralo de forma incremental con 4 dígitos.
3. Añádelo al índice de esta tabla.
4. Un ADR es inmutable: si la decisión cambia, crea uno nuevo que la sustituya
   y marca el anterior como *Sustituida por ADR-XXXX*.
