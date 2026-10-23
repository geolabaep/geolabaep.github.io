# Activar el contador de visualizaciones

El bloque está en el encabezado y muestra Hoy, 7 días y 30 días (incluyendo hoy). Son visualizaciones de página, incluidas visitas repetidas, no personas únicas. Los informes tienen demora de procesamiento; se muestra la fecha de corte. Los días se consultan según la fecha de Paraguay; configurá también esa zona horaria en la propiedad GA4.

La etiqueta G-PK379JHWXH registra visitas pero no permite leer los informes privados. Para publicar únicamente los tres totales:

1. En Google Analytics → Administrar → Detalles de la propiedad, copiá el ID numérico de la propiedad. No uses el Stream ID ni el ID G-.
2. En Google Cloud, habilitá Google Analytics Data API y creá una cuenta de servicio para lectura de estadísticas.
3. En Google Analytics → Administrar → Gestión de accesos a la propiedad, agregá el correo de esa cuenta de servicio con rol Lector.
4. Generá una clave JSON para esa cuenta de servicio. Guardá el contenido directamente en GitHub → repositorio → Settings → Secrets and variables → Actions → Secrets, con nombre `GA4_SERVICE_ACCOUNT_JSON`. No lo subas como archivo al repositorio ni lo pegues en el chat.
5. En la pestaña Variables del mismo lugar, agregá `GA4_PROPERTY_ID` con el ID numérico.
6. Subí la carpeta `.github` incluida y el resto de los cambios. En Actions → Actualizar visualizaciones → Run workflow, ejecutá una consulta.

La consulta corre cada seis horas. Publica solo totales agregados para geolabaep.github.io en `data/visualizaciones.json`. No publica credenciales ni información de visitantes. Si falla, conserva el último informe. Sin configurar el acceso, muestra pendientes en lugar de un cero ficticio.

Guía oficial: https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart
