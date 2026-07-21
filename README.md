# GEOlab AEP · Observatorio Hidrológico

Visor público de solo lectura: https://geolabaep.github.io/

Los datos se comprueban automáticamente cuatro veces al día contra la fuente oficial DMH/DINAC. La actualización se valida antes de modificar el visor.

## Persistencia de datos

- `data/historico-dmh.json` es el historial canónico acumulativo.
- `data/datos.js` contiene una copia derivada para que el visor siga siendo estático y rápido.
- El workflow actualiza y confirma ambos archivos junto con la clave anticaché de `index.html`.
- En futuras actualizaciones exclusivamente visuales no se debe reemplazar `data/historico-dmh.json`. El historial también queda recuperable mediante el historial de commits de GitHub.

Este repositorio no contiene el maestro ni herramientas administrativas.
