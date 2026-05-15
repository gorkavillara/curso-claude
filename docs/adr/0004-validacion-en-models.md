# ADR 0004: La validación vive en `models/`, no en `routes/`

- **Estado:** Aceptada
- **Fecha:** 2026-05-15

## Contexto

Al crear o actualizar una tarea hay reglas de negocio (p. ej. `title`
obligatorio y no vacío). Esa validación podría colocarse en la capa de rutas
(`routes/tasks.ts`) o en el modelo (`models/task.ts`). Si se reparte entre
ambas, las reglas se duplican y divergen.

## Decisión

La **validación de reglas de negocio vive en `models/`**. La capa
`routes/` es **solo IO**: parsea la petición HTTP, delega en el modelo y
traduce el resultado (o el error) a una respuesta HTTP. El modelo es la única
fuente de verdad sobre qué es una tarea válida.

## Consecuencias

**Positivas**

- Una sola fuente de verdad para las reglas de negocio.
- El modelo es testeable de forma aislada (ver `tests/db.test.ts`), sin montar
  Express.
- Las rutas quedan finas y predecibles.

**Negativas**

- Hay que ser disciplinado: la tentación de "validar rápido" en la ruta debe
  resistirse.
- Los errores de validación del modelo deben mapearse a códigos HTTP
  adecuados en el `errorHandler`/rutas.

## Notas

Esta decisión es una convención vinculante del proyecto. Cualquier cambio o
generación de código (incluida la asistida por IA) debe respetarla: nueva
validación → `models/`, nunca en `routes/`.
