# CLAUDE.md — TaskMaster-TS

## Convenciones
- Lógica de negocio en `models/`, nunca en `routes/`.
- Errores como `{ error: { code, message } }`.
- Validación con esquemas tipados.
- Tests al lado de la lógica que cubren.
- Sin `console.log` ni `any` sin justificar.
