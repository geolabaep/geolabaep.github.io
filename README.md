# GEOlab AEP · Observatorio Hidrológico

**Acceder al observatorio:** [https://geolabaep.github.io/](https://geolabaep.github.io/)

Versión de interfaz revisada el 22/10/2026, con datos DMH disponibles hasta esa fecha. Sitio estático: abrir `index.html` para revisar o publicar en GitHub Pages. No requiere instalación ni compilación.

## Organización

- `index.html`: estructura de la interfaz.
- `css/observatorio.css`: diseño aprobado.
- `js/`: mapa, análisis, historial y controles.
- `data/historico-dmh.json`: historial automático acumulativo; no borrarlo ni reemplazarlo con versiones anteriores.
- `data/datos.js`: datos base y copia derivada del historial automático.
- `data/auditoria.js`: recuperación y cotejo histórico con DMH, con URL por lectura.
- `assets/`: logotipos separados.
- `vendor/leaflet.js`: motor cartográfico incluido.
- `docs/`: informe de actualización y lecturas comprobadas.
- `automation/` y `.github/workflows/`: actualización automática existente, ampliada para conservar también máximos y mínimos históricos publicados.

## Actualización

El workflow consulta DMH cuatro veces al día y puede ejecutarse desde Actions → Actualizar datos desde DMH → Run workflow. Solo guarda datos publicados; conserva la fecha real de cada estación y protege el historial contra reducciones. Actualiza datos, extremos históricos y clave de caché. Una caída de DMH conserva los datos guardados.

Los gráficos no interpolan vacíos. Los nuevos máximos se distinguen en lila y los mínimos en rosa. En Monitoreo, los extremos abarcan el año hasta la fecha consultada; en Centro operativo, los últimos 30 días.

## Verificación local

```sh
node automation/test-dmh.js
node automation/test-history.js
node automation/validate-repository.js
```

Los mapas regionales y Leaflet están incluidos; los fondos alternativos y las tipografías web requieren conexión. Los datos no constituyen una alerta oficial.

## Estadísticas de visitas

Google Analytics 4 está integrado con el ID `G-PK379JHWXH`. Se activa al publicar en `geolabaep.github.io`. Las estadísticas se consultan en [Google Analytics](https://analytics.google.com/) con la cuenta autorizada, seleccionando el período diario, semanal o mensual. Las vistas previas locales no registran visitas.

## Contador visible en el encabezado

El panel muestra visualizaciones de hoy y de los últimos 7 y 30 días. Para leer los totales reales requiere habilitar la conexión de lectura con Analytics: [pasos de configuración](docs/ACTIVAR_VISUALIZACIONES.md). Hasta configurarla muestra estadísticas pendientes; no simula visitas.

## Vista móvil

Navegación en dos columnas, controles táctiles, mapa sobre la lista de estaciones y serie temporal ajustada al ancho disponible. Centro operativo conserva todas las columnas con desplazamiento horizontal y estación fija. El gráfico se adapta al cambiar la orientación del dispositivo.
