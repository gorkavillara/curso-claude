# ADR 0001: Registrar decisiones de arquitectura con ADRs

- **Estado:** Aceptada
- **Fecha:** 2026-05-15

## Contexto

TaskMaster-TS es un proyecto multicapa (backend, frontend, tests, Docker)
usado como base didáctica. Las decisiones de diseño se toman de forma
distribuida y, sin un registro, el porqué se pierde: alguien (o un asistente
de IA) revisa el código meses después y no sabe si una decisión fue
deliberada o accidental.

## Decisión

Usamos **Architecture Decision Records** almacenados en `docs/adr/`, en
formato MADR simplificado, numerados de forma incremental e **inmutables**:
una decisión que cambia genera un ADR nuevo que sustituye al anterior.

## Consecuencias

**Positivas**

- El contexto y el razonamiento quedan versionados junto al código.
- Onboarding más rápido para personas y agentes de IA.
- Las discusiones de diseño tienen un destino claro.

**Negativas**

- Disciplina: hay que escribir el ADR cuando se toma la decisión, no después.
- Riesgo de ADRs desactualizados si no se marca su estado correctamente.
