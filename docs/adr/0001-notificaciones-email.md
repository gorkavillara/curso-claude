# ADR-0001: ¿Dónde vive la lógica de notificaciones por email?

**Estado:** Pendiente de decisión
**Fecha:** [rellenar durante el vídeo]
**Autores:** [tu nombre]

---

## Contexto

TaskMaster-TS necesita enviar una notificación por email cuando una tarea cambia de
estado (p. ej. pasa a `done` o se le asigna prioridad `critical`).

Estado actual del sistema:
- Monolito Express con un único proceso backend.
- Base de datos SQLite local.
- No hay colas de mensajes ni workers externos.
- No hay microservicios.
- Equipo: 2-3 personas.

La pregunta es: ¿dónde vive esa lógica?

## Alternativas consideradas

### A — Módulo interno dentro del proceso backend

Descripción: ...

Pros: ...

Contras: ...

### B — Microservicio de notificaciones independiente

Descripción: ...

Pros: ...

Contras: ...

### C — Cola de mensajes + worker desacoplado

Descripción: ...

Pros: ...

Contras: ...

---

## Decisión

[Rellenar durante el vídeo tras el análisis con Claude]

## Consecuencias positivas

[Rellenar]

## Consecuencias negativas

[Rellenar — ser honesto]

## Ficheros afectados

[Rellenar con el mapa de impacto generado por Claude]
