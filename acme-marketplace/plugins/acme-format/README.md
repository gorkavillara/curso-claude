# acme-format

Plugin interno de la plataforma ACME. **Impide que salga un `git commit` si el código no
pasa el lint** (`npm run lint`, que en este repo es `tsc --noEmit`).

## Qué hace

- Engancha un hook `PreToolUse` sobre comandos `Bash`.
- Si el comando es un `git commit`, ejecuta `npm run lint`.
  - Lint OK → el commit continúa.
  - Lint KO → el commit se bloquea (código de salida 2) con un mensaje claro.
- Si el comando no es un commit, no hace nada (no molesta).

## Qué NO hace

- **No formatea** código. Solo verifica el typecheck. Si quieres formateo automático,
  ese es otro plugin.
- No toca tu working tree ni hace commits por ti.

## Override de emergencia (hotfix)

Si necesitas commitear un hotfix urgente y el lint falla por algo no relacionado:

```
/plugin disable acme-format
git commit -m "hotfix: ..."
/plugin enable acme-format
```

Documentado y a la vista, nunca a escondidas. El override es una decisión consciente,
no un agujero.

## Mantenimiento

- Owner: ACME Platform Team (campo `author` de `plugin.json`).
- Versionado semántico en `plugin.json`.
- Cambios relevantes → CHANGELOG del marketplace.
