# Gestión Taller Novias

Sistema de gestión para taller de vestidos de novia con funcionalidad de respaldos y visualización.

## Archivos

### Gestión Taller.html
Aplicación principal de gestión del taller con todas las funcionalidades completas.

### Gestión Histórico.html
**Visor Histórico - Solo Lectura**

Aplicación dedicada para visualizar datos históricos de años anteriores o respaldos completos. Replica las pestañas principales del sistema (Inventario, Facturación, Finanzas) en modo solo lectura.

### gestion-taller-respaldo.html
**Visor de Respaldos JSON - Solo Lectura**

Aplicación dedicada para visualizar y analizar respaldos JSON del sistema principal.

### calendar-extracted.html
**Calendario Extraído de Planificación - Standalone**

Calendario completo extraído de la pestaña "Planificación" de Gestión Taller.html. Incluye todas las funcionalidades, estilos, animaciones e interacciones del calendario original.

## Cómo usar Gestión Histórico

### Características Principales

1. **Visualización de Datos Históricos**
   - Visualiza datos de cierres anuales o respaldos completos
   - Tres pestañas principales: Inventario, Facturación y Finanzas
   - Modo solo lectura para proteger datos históricos

2. **Carga de Archivos**
   - **Arrastrar y soltar**: Arrastra archivos JSON sobre el área de carga
   - **Selector de archivos**: Haz clic en "Seleccionar Archivos"
   - Soporta respaldos completos y informes anuales

3. **Persistencia Local**
   - Los archivos se guardan en IndexedDB
   - No es necesario volver a cargarlos entre sesiones
   - Gestiona múltiples respaldos simultáneamente

4. **Pestaña Inventario**
   - Lista completa de vestidos del respaldo
   - Filtros por proveedor y estado
   - Búsqueda por código, modelo, talla, lote
   - Paginación para navegación sencilla
   - Vista detallada expandible por vestido

5. **Pestaña Facturación**
   - Agrupación por facturas y albaranes
   - Filtros por proveedor (Todos, Pronovias, Rosa Clará, Traka)
   - Visualización de totales y detalles

6. **Pestaña Finanzas**
   - Dashboard con KPIs principales
   - Ingresos, gastos y beneficio neto
   - Desglose detallado por proveedor
   - Métricas de promedio por vestido

7. **Gestión de Respaldos**
   - Ver lista de todos los respaldos cargados
   - Seleccionar respaldo activo para visualización
   - Eliminar respaldos individuales
   - Limpiar completamente la base de datos

### Instrucciones de Uso

1. **Primera Vez**
   - Abre `Gestión Histórico.html` en tu navegador
   - Ve a la pestaña "Cargar Datos"
   - Arrastra o selecciona archivos JSON
   - Los datos se guardarán automáticamente

2. **Seleccionar Respaldo**
   - En la lista de respaldos, haz clic en "Seleccionar"
   - Los datos se cargarán en las pestañas de visualización

3. **Visualización**
   - Navega por las pestañas Inventario, Facturación y Finanzas
   - Usa filtros y búsqueda para encontrar información específica
   - Expande detalles de vestidos, facturas o albaranes

4. **Comparar Años**
   - Carga múltiples informes anuales
   - Cambia entre ellos seleccionando diferentes respaldos

### Características Técnicas

- **100% Cliente**: Funciona completamente offline
- **Sin Dependencias**: Archivo HTML auto-contenido
- **Persistencia**: IndexedDB para almacenamiento robusto
- **Diseño Consistente**: Misma estética que la aplicación principal
- **Modo Solo Lectura**: Protección de datos históricos

### Compatibilidad

- Navegadores modernos con soporte para IndexedDB, Drag & Drop API, ES6+
- Probado en: Chrome/Edge 90+, Firefox 88+, Safari 14+

### Integración con la Aplicación Principal

Desde la pestaña "Respaldos" de la aplicación principal:
- Haz clic en "📖 Abrir Gestión Histórico" para abrir el visor
- Carga informes anuales para comparativas rápidas

### Formatos Soportados

**Respaldos Completos** (Exportar Todo):
```json
{
  "modelos": [...],
  "vestidos": [...],
  "gastos": [...],
  "otrosIngresos": [...],
  "planificacion": {...},
  "configuracion": {...}
}
```

⚠️ **Nota importante**: Gestión Histórico solo acepta **respaldos completos**. Los informes anuales (generados con "Cierre de Año") tienen un formato resumido y deben cargarse en la aplicación principal para comparativas.

**Informes Anuales** (formato de referencia - para uso en aplicación principal):
```json
{
  "año": 2024,
  "fecha_cierre": "2024-12-31",
  "vestidos": {...},
  "finanzas": {...},
  "horas": {...},
  "top_modelos": [...]
}
```

### Notas de Seguridad

- Los datos solo se almacenan localmente en tu navegador
- No se envían datos a servicios externos
- Los respaldos persisten por navegador y perfil de usuario
- Limpia la base de datos si cambias de equipo o compartes el navegador

## Cómo usar el Visor de Respaldos (gestion-taller-respaldo.html)

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

## Cómo usar el Calendario Extraído (calendar-extracted.html)

### Descripción General

El archivo `calendar-extracted.html` es una **extracción completa y funcional** del calendario de la pestaña "Planificación" de Gestión Taller.html. Este calendario standalone incluye:

- ✅ Todas las funcionalidades del calendario original
- ✅ Todos los estilos y animaciones CSS
- ✅ Drag-and-drop completo para mover vestidos entre días
- ✅ Efectos visuales y hover effects
- ✅ Sistema de filtros multi-selección
- ✅ Navegación entre meses
- ✅ Resaltado del día actual
- ✅ Colores diferenciados por proveedor

### Características Principales

1. **Navegación del Calendario**
   - **◀ Anterior / Siguiente ▶**: Navega entre meses del año
   - **Hoy**: Salta rápidamente al mes actual
   - **Indicador de Mes/Año**: Muestra claramente el período visualizado
   - **Resaltado del Día Actual**: El día de hoy se marca con borde amarillo

2. **Sistema de Filtros Avanzado**
   - **✨ Todos**: Activa todos los filtros simultáneamente
   - **📦 Vestidos Enviados**: Muestra vestidos enviados con producción
   - **🚚 Albaranes**: Muestra envíos sin producción (solo albarán)
   - **⏰ Fecha Fin**: Muestra vestidos según su fecha límite
   - **⚙️ En Proceso**: Muestra vestidos con intervalos de trabajo asignados
   - **👗 Todos en Producción**: Vista general de todos los vestidos en taller
   - **❌ Ninguno**: Desactiva todos los filtros
   - **🏢 Filtro por Proveedor**: Filtra por Pronovias, Rosa Clará, Traka o todos

3. **Drag-and-Drop Interactivo**
   - **Arrastrar vestidos**: Mueve vestidos entre días del calendario
   - **Validación de fines de semana**: Previene asignación en sábados/domingos
   - **Feedback visual**: Resaltado de zonas de drop válidas
   - **Animaciones suaves**: Transiciones visuales al mover elementos

4. **Visualización de Vestidos**
   - **Codificación por colores**: 
     - Rosa claro: Pronovias
     - Azul claro: Traka
     - Rosa intenso: Rosa Clará
   - **Información condensada**: Nombre, lote, horas estimadas
   - **Iconos descriptivos**:
     - ⏳ Pendientes (solo fecha límite)
     - ✅ En proceso (con horas asignadas)
     - 🔒 Manual (intervalos manuales no modificables)
     - 🤖 Planificación automática
     - 📅 Planificación sugerida

5. **Efectos Visuales**
   - **Hover en días**: Efecto de escala y sombra al pasar el mouse
   - **Hover en vestidos**: Elevación y sombra en tarjetas de vestido
   - **Drag-over highlight**: Borde punteado azul al arrastrar sobre un día
   - **Días de fin de semana**: Opacidad reducida y cursor por defecto

### Instrucciones de Uso

1. **Abrir el Calendario**
   - Opción 1: Abrir directamente `calendar-extracted.html` en tu navegador web
   - Opción 2: Usar servidor local (recomendado para testing)
     ```bash
     python3 -m http.server 8080
     # Luego abre: http://localhost:8080/calendar-extracted.html
     ```

2. **Navegar por el Calendario**
   - Usa los botones **Anterior** y **Siguiente** para moverte entre meses
   - Haz clic en **Hoy** para volver al mes actual
   - El día actual está resaltado con un borde amarillo

3. **Usar Filtros**
   - Marca/desmarca checkboxes individuales para controlar qué vestidos ver
   - Usa **Todos** para seleccionar todos los filtros a la vez
   - Usa **Ninguno** para ocultar todos los vestidos
   - Selecciona un proveedor específico en el dropdown inferior

4. **Drag and Drop (Funcionalidad Demostrada)**
   - Haz clic y mantén presionado sobre un vestido
   - Arrastra el vestido a otro día del calendario
   - Suéltalo sobre un día laboral (lunes-viernes)
   - El sistema validará automáticamente la operación

5. **Datos de Ejemplo**
   - El calendario incluye 3 vestidos de muestra para demostrar la funcionalidad:
     - Vestido A (Pronovias) - Fecha límite: 15 de febrero
     - Vestido B (Rosa Clará) - Fecha límite: 20 de febrero
     - Vestido C (Traka) - Fecha límite: 25 de febrero

### Características Técnicas

- **100% Standalone**: Archivo HTML único y auto-contenido
- **Sin Dependencias Externas**: Funciona completamente offline (excepto Google Fonts)
- **Responsive Design**: Se adapta a diferentes tamaños de pantalla
- **CSS Variables**: Sistema de colores centralizado y consistente
- **Vanilla JavaScript**: Sin frameworks, máxima compatibilidad

### Funcionalidades Implementadas

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Generación de calendario | ✅ | Grid mensual con días de la semana |
| Navegación entre meses | ✅ | Botones anterior/siguiente/hoy |
| Drag & drop | ✅ | Mover vestidos entre días |
| Validación de drops | ✅ | Previene drops en fines de semana |
| Filtros multi-selección | ✅ | Control granular de visibilidad |
| Hover effects | ✅ | Animaciones en días y vestidos |
| Colores por proveedor | ✅ | Pronovias, Traka, Rosa Clará |
| Resaltado día actual | ✅ | Borde amarillo en el día de hoy |
| Datos de ejemplo | ✅ | 3 vestidos para demostración |

### Limitaciones del Calendario Standalone

Como este es un calendario **extraído** y standalone:
- Los datos se cargan desde variables JavaScript en memoria (no desde localStorage)
- Las funciones de planificación automática muestran alertas informativas
- No persiste cambios entre sesiones (es para demostración)
- Para funcionalidad completa, usar Gestión Taller.html original

### Integración con Sistema Principal

Este calendario es una **extracción exacta** del calendario en Gestión Taller.html:
- Mismo código HTML
- Mismos estilos CSS
- Mismas funciones JavaScript
- Mismas animaciones e interacciones

Para usar el calendario con datos reales, consulta la pestaña "Planificación" en Gestión Taller.html.

### Compatibilidad

- **Navegadores Modernos**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Tecnologías Requeridas**:
  - HTML5
  - CSS3 (Grid, Flexbox, Variables)
  - JavaScript ES6+ (Arrow functions, Template literals, Destructuring)
  - Drag and Drop API

