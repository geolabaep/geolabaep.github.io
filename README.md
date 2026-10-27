# Observatorio Hidrológico — paquete basado en tu HTML

**Acceso:** https://geolabaep.github.io/

Base exclusiva: `Vista_previa_Observatorio(1).html`, enviado por la usuaria el 27/10/2026. No se sustituyeron el diseño, las funciones ni las series por archivos de paquetes anteriores. El contenido visual y los scripts originales se conservaron; únicamente se extrajo el bloque de datos a `data/datos.js` y se agregó el lector de totales de Analytics.

## Subir a GitHub

1. Extraer el ZIP y abrir `sitio`.
2. En https://github.com/geolabaep/geolabaep.github.io elegir **Add file → Upload files**.
3. Subir todo el CONTENIDO de `sitio`, incluida `.github`, a la raíz. No subir la carpeta contenedora ni el ZIP. No borrar previamente el repositorio.
4. Guardar con **Commit changes**. Los archivos antiguos de css, assets y vendor pueden permanecer: este index conserva los recursos del HTML incorporados y no los carga.
5. En **Settings → Pages → Source** seleccionar **GitHub Actions**.
6. En **Actions → Publicar observatorio → Run workflow**, ejecutar y esperar a que termine correctamente.
7. En **Actions → Actualizar visualizaciones → Run workflow**, ejecutar la consulta. Después se ejecuta Publicar observatorio automáticamente.
8. Abrir https://geolabaep.github.io/ y recargar con Ctrl+F5.

## Visualizaciones

Requiere la variable `GA4_PROPERTY_ID=560217022` y el secreto `GA4_SERVICE_ACCOUNT_JSON` ya configurados en GitHub. La clave privada no está en el paquete. Si la consulta termina bien, `data/visualizaciones.json` cambia a `status: ready` y muestra today, week y month. Las visitas se consultan cada seis horas y pueden tener demora. Se cuentan visualizaciones, incluidas repeticiones, no personas únicas.

El HTML recibido tenía la tarjeta pero no el lector de este archivo. Se agregó `js/site-views.js`. La prueba real de acceso a Analytics todavía debe ejecutarse en GitHub: este paquete no contiene estadísticas inventadas.

## Datos y actualizaciones

Se conservaron exactamente los datos del HTML recibido: 98 boletines automáticos, hasta 27/10/2026, además de sus series base y lecturas recuperadas incorporadas. Las fechas reales por estación se conservan. La automatización DMH continúa actualizando el bloque externo de datos cuatro veces al día. Los registros históricos recuperados que están dentro del HTML se conservan sin cambios.

Si subís este paquete después de que el repositorio incorpore boletines posteriores al 27/10, no sobrescribas esos datos con una versión más antigua.

## Verificación

Se comprobó la equivalencia exacta entre el HTML recibido y el index publicado al revertir las dos adaptaciones indicadas, la sintaxis de sus 13 scripts y el formato del historial. El SHA-256 de la fuente se registra en version.json. No se ha realizado una prueba visual en un navegador ni se ha verificado la conexión privada real de Analytics.
