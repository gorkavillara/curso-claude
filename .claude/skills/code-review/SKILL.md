---
name: code-review
description: Revisa el diff actual con foco en riesgo, tests y convenciones del CLAUDE.md.
---

# Code review

## Cuándo activarte
- "revisa el diff", "haz code review", "review pre-merge".

## Procedimiento
1. Ejecuta `git diff main...HEAD` y analiza el resultado.
2. Lee `CLAUDE.md` y verifica consistencia.
3. Lista hallazgos por categoría: riesgo / inconsistencia / tests faltantes / complejidad.
4. Para cada hallazgo: archivo, línea y propuesta concreta.
5. Cierra con un veredicto: aprobar / cambios menores / cambios mayores.

## Errores a evitar
- Hallazgos genéricos sin línea concreta.
- Repetir lo que ya dice el lint.