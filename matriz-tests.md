| Caso | Tipo | Por qué |
|---|---|---|
| Mapper `rowToTask` (0/1 → boolean) | Unit | Función pura sin IO. Única pieza extraíble. |
| Tag existente devuelve tasks | Integración (BD) | El JOIN real es lo que se valida; mock lo invalida. |
| Tag inexistente → `[]` | Integración (BD) | JOIN vacío solo emerge con BD real. |
| Tag vacío / null / espacios | Integración (BD) | Verifica que la query no explota, no lógica JS. |
| Comilla / `%` / `_` SQL meta | Integración (BD) | Prueba que `?` parametrizado neutraliza inyección. Mock la destruye. |
| `addTag` idempotencia | Integración (BD) | Lo aplica la PK compuesta en BD, no JS. |
| `PRAGMA foreign_keys=ON` | Integración (BD) | Check de configuración de conexión, un solo test. |
| Cascada al borrar task | Integración (BD) | Valida `ON DELETE CASCADE` — requiere BD real. |
| Handler `GET /search` → 200 | Integración (HTTP) | Solo cableado: query param leído + modelo llamado. |
| Handler → 400 | Integración (HTTP) | Idem, valida la rama de error del handler. |