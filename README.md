# GEOlab AEP · Observatorio Hidrológico

Visor público de solo lectura: https://geolabaep.github.io/

Los datos se comprueban automáticamente cuatro veces al día contra la fuente oficial DMH/DINAC. La actualización se valida antes de modificar el visor.

## Persistencia de datos

- `data/historico-dmh.json` es el historial canónico acumulativo.
- `data/datos.js` contiene una copia derivada para que el visor siga siendo estático y rápido.
- El workflow actualiza y confirma ambos archivos junto con la clave anticaché de `index.html`.
- Antes de guardar, se bloquea cualquier reducción del número de boletines o de estaciones de una fecha ya almacenada.
- El workflow `Validar Observatorio` comprueba automáticamente datos, historial, sintaxis y archivos requeridos en cada cambio y solicitud de incorporación.
- En futuras actualizaciones exclusivamente visuales no se debe reemplazar `data/historico-dmh.json`. El historial también queda recuperable mediante el historial de commits de GitHub.

## Publicación segura

- Las mejoras de interfaz deben revisarse primero en una rama o solicitud de incorporación.
- Solo se publica en GitHub Pages después de integrar los cambios en `main`.
- Los logotipos se almacenan como archivos en `assets/`; no deben volver a incrustarse en base64 dentro de `index.html`.

Este repositorio no contiene el maestro ni herramientas administrativas.
