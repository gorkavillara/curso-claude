# Backend (Node + TS + Express)

- Toda lógica de negocio vive en `models/`. `routes/` es solo IO.
- Validación de entrada con esquemas tipados.
- Errores se devuelven como `{ error: { code, message } }`.
- Tests Jest junto a la lógica que cubren.
