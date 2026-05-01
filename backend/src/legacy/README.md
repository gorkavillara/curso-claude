# Legacy module

`reportGenerator.js` se escribió en 2017 antes de migrar el proyecto a TypeScript.
Sigue ejecutándose desde un cron job interno una vez por semana.

- Pure JS, callbacks anidados, `var`, sin tipos.
- Acoplado a un formato JSON antiguo (`dbPath` apunta a un volcado del SQLite, no a la BD directamente).
- Sin tests.
