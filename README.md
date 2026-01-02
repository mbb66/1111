# Gestión Taller Novias

Sistema de gestión para taller de vestidos de novia con funcionalidad de respaldos y visualización.

## Archivos

### Gestión Taller.html
Aplicación principal de gestión del taller con todas las funcionalidades completas.

### gestion-taller-respaldo.html
**Visor de Respaldos JSON - Solo Lectura**

Aplicación dedicada para visualizar y analizar respaldos JSON del sistema principal.

## Cómo usar el Visor de Respaldos

### Características Principales

1. **Persistencia Local con IndexedDB**
   - Los archivos JSON subidos se guardan automáticamente en el navegador
   - No es necesario volver a subirlos en futuras sesiones
   - Los datos persisten entre recargas de página

2. **Carga de Respaldos**
   - **Arrastrar y soltar**: Arrastra uno o múltiples archivos JSON sobre el área de carga
   - **Selector de archivos**: Haz clic en "Seleccionar Archivos" para elegir archivos JSON
   - Los respaldos se validan y guardan automáticamente

3. **Búsqueda y Filtrado Avanzado**
   - **Búsqueda de texto libre**: Busca en código modelo, código completo, nombre, OF, lote, factura, albarán
   - **Filtros multi-selección**:
     - Proveedor: pronovias, traka, rosa_clara, otros
     - Estado: en_taller, enviado, pagado, con_tara, reparado, pendiente
   - **Filtros especiales**:
     - Solo facturados / no facturados
     - Con historial de albaranes
     - Con reenvío
     - Por tipo de tara (tara_taller, tara_empresa)
   - **Rangos de fechas**: Fecha entrada, envío, factura
   - **Rangos numéricos**: Horas estimadas, precio base
   - **Ordenación**: Por fecha entrada, fecha límite, precio, horas estimadas, nombre modelo

4. **Visualización de Inventario**
   - Tabla interactiva con paginación (10, 25, 50, 100 elementos por página)
   - Haz clic en cualquier fila para ver el detalle completo JSON
   - Panel lateral con el JSON formateado

5. **Exportación y Descarga**
   - **Copiar JSON**: Copia el JSON de un elemento seleccionado al portapapeles
   - **Descargar JSON**: Descarga el JSON de un elemento como archivo
   - **Exportar Respaldo Combinado**: Genera un único archivo JSON con todos los vestidos de todos los respaldos
   - **Importar Respaldo Combinado**: Importa un respaldo combinado previamente exportado

6. **Gestión de Respaldos**
   - Ver lista de todos los respaldos cargados con estadísticas
   - Eliminar respaldos individuales
   - Limpiar completamente la base de datos local

### Instrucciones de Uso

1. **Primera Vez**
   - Abre `gestion-taller-respaldo.html` en tu navegador
   - Arrastra o selecciona archivos JSON de respaldo
   - Los datos se guardarán automáticamente en IndexedDB

2. **Visualización**
   - Usa los filtros para refinar los resultados
   - Haz clic en las filas de la tabla para ver detalles
   - Usa los botones de paginación para navegar

3. **Exportación**
   - Selecciona un elemento y usa "Copiar JSON" o "Descargar JSON"
   - Usa "Exportar Respaldo Combinado" para crear un archivo consolidado

4. **Mantenimiento**
   - Elimina respaldos individuales desde la sección de respaldos
   - Usa "Limpiar Base de Datos" para empezar de cero (confirmación requerida)

### Características Técnicas

- **100% Cliente**: No requiere servidor, funciona completamente offline
- **Sin Dependencias Externas**: Archivo HTML auto-contenido
- **Persistencia**: IndexedDB para almacenamiento local robusto
- **Estética Consistente**: Mantiene el mismo diseño y variables CSS que la aplicación principal
- **Sin Transmisión de Datos**: Todo el procesamiento es local, privacidad total

### Compatibilidad

- Navegadores modernos con soporte para:
  - IndexedDB
  - Drag & Drop API
  - ES6+
  - Clipboard API

Probado en:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Notas de Seguridad

- Los datos solo se almacenan localmente en tu navegador
- No se envían datos a servicios externos
- Los respaldos persisten por navegador y perfil de usuario
- Limpia la base de datos si cambias de equipo o compartes el navegador

## Licencia

Software propietario para uso interno del taller.
