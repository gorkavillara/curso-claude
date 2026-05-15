# ADR 0005: Docker Compose con dos servicios (backend + frontend)

- **Estado:** Aceptada
- **Fecha:** 2026-05-15

## Contexto

El proyecto tiene un backend Node/Express y un frontend estático. Queremos una
forma reproducible de levantar el stack completo, pero sin acoplar artificialmente
ambas piezas ni introducir un reverse proxy que complique la demo.

## Decisión

Un `compose.yml` con **dos servicios independientes**:

- `backend`: imagen Node, expone `3000`, persiste SQLite en el volumen
  nombrado `taskmaster-data` (`/app/data`).
- `frontend`: imagen nginx sirviendo el cliente compilado, mapea `8080 → 80`,
  con `depends_on: backend`.

El frontend **no** hace proxy al backend: el navegador llama directamente a
`http://localhost:3000/api`. Por eso ambos contenedores solo necesitan exponer
sus puertos al host.

## Alternativas consideradas

- **Nginx como reverse proxy** del backend bajo `/api`: más "producción" pero
  añade configuración de red y oculta el modelo mental cliente→API que la demo
  quiere enseñar.
- **Un único contenedor** sirviendo ambos: acopla ciclos de build y vida de
  procesos heterogéneos.

## Consecuencias

**Positivas**

- `docker compose up --build` levanta todo el stack de forma reproducible.
- Servicios desacoplados: se pueden construir y reiniciar por separado.
- La persistencia sobrevive a recreaciones del contenedor (volumen nombrado).

**Negativas**

- La URL del backend (`localhost:3000`) está fijada en el cliente; cambiarla
  exige recompilar el frontend.
- `depends_on` garantiza orden de arranque pero no que el backend esté *listo*.
