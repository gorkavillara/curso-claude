# ADR 0003: Monorepo con `tsconfig.base.json` compartido

- **Estado:** Aceptada
- **Fecha:** 2026-05-15

## Contexto

El proyecto contiene varios paquetes lógicos (`backend/`, `frontend/`,
`tests/`) que comparten lenguaje (TypeScript) y convenciones de compilación
(strict mode, target, module resolution), pero tienen necesidades distintas
de salida y entorno (Node vs navegador).

## Decisión

Mantener un **único repositorio** con un **`tsconfig.base.json`** raíz que
define las opciones comunes (`strict`, target, etc.). Cada subproyecto tiene
su propio `tsconfig.json` que **extiende** la base y ajusta lo específico:

- `backend/tsconfig.json` → salida `dist/backend`, libs de Node.
- `frontend/tsconfig.json` → salida `dist/frontend`, libs DOM.
- `tests/tsconfig.json` → configuración para Jest.

Un `package.json` raíz orquesta los scripts (`build`, `build:backend`,
`build:frontend`, `test`, `lint`).

## Consecuencias

**Positivas**

- Una sola configuración base evita divergencias entre subproyectos.
- Cambios en convenciones de compilación se hacen en un único sitio.
- Facilita pedir a un asistente de IA cambios que cruzan varias capas.

**Negativas**

- Un `package.json` único mezcla dependencias de backend y frontend.
- Si el proyecto creciera, podría justificarse migrar a workspaces (npm/pnpm).
