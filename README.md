# GEOlab AEP · Observatorio Hidrológico

**Acceder al observatorio:** [https://geolabaep.github.io/](https://geolabaep.github.io/)

Versión de interfaz revisada el 27/10/2026, con datos DMH disponibles hasta el 27/10/2026. Cada estación conserva la fecha real de su última lectura. Sitio estático: abrir `index.html` para revisar o publicar en GitHub Pages. No requiere instalación ni compilación.

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

Encabezado compacto, visualizaciones accesibles mediante un botón, navegación en una fila y controles táctiles, mapa sobre la lista de estaciones y serie temporal ajustada al ancho disponible. Centro operativo conserva todas las columnas con desplazamiento horizontal y estación fija. El gráfico se adapta al cambiar la orientación del dispositivo.

## Publicación en GitHub Pages

En Settings → Pages, seleccionar Source: **GitHub Actions**. El workflow Publicar observatorio publica la rama predeterminada después de una carga y tras cada actualización correcta de DMH o visualizaciones. Esto permite publicar también los commits automáticos realizados por GITHUB_TOKEN.

La conexión de Analytics utiliza la variable `GA4_PROPERTY_ID=560217022` y el secreto `GA4_SERVICE_ACCOUNT_JSON` configurados en el repositorio. Las credenciales no se incluyen en estos archivos. Para probar: Actions → Actualizar visualizaciones → Run workflow; verificar que data/visualizaciones.json tenga status ready y esperar a Publicar observatorio.

## Cambios incluidos en la versión 3.9.1

- Recuperación de 11 lecturas publicadas por DMH en 8 estaciones; fuente individual en `docs/recuperacion_fechas_2026-10-27.json`.
- Círculos lilas en todas las fechas que superan el máximo histórico anterior, aunque no establezcan otro récord.
- Panel «Nuevos máximos históricos», con máximos del año ordenados por fecha alcanzada.
- Calendario con fechas disponibles en verde y sin datos en rojo; rango independiente para descargar CSV.
- Encabezado móvil compacto, estadísticas desplegables y detalle de la serie con cierre.

Persisten 53 días sin lectura dentro de las series operativas. No se estiman ni interpolan valores. La consulta histórica de Humaitá quedó incompleta por interrupciones de DMH. No se ha comprobado la conexión privada de Analytics desde este entorno: ejecutar el workflow después de subir el paquete.
