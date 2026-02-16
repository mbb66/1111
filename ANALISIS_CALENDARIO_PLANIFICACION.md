# Análisis del Calendario de Planificación

## Gestión Taller - Pestaña de Planificación

**Fecha del Análisis:** 16 de febrero de 2026  
**Archivo Analizado:** `Gestión Taller.html`  
**Secciones Revisadas:** Pestaña "Planificación" (líneas 2873-3067)

---

## 📋 Resumen Ejecutivo

El calendario de planificación es una herramienta visual interactiva que permite gestionar la producción de vestidos en el taller. Se encuentra en la pestaña "Planificación" y muestra los vestidos asignados a cada día del mes con funcionalidades de drag-and-drop, filtros múltiples y visualización de carga de trabajo.

### Componentes Principales:

1. **Vista de Calendario Mensual** - Grid de 7x5 días con navegación entre meses
2. **Sistema de Filtros Multi-selección** - 7 filtros independientes para controlar visibilidad
3. **Gestión de Horas** - Cálculo automático de horas disponibles vs. utilizadas por día
4. **Drag & Drop** - Mover vestidos entre días laborables
5. **Planificación Automática** - Algoritmo para distribuir vestidos automáticamente

---

## 🏗️ Arquitectura del Calendario

### Funciones Principales

#### 1. `generarCalendarioPlanificacion()` (Línea 7926)
**Propósito:** Genera el HTML del calendario mensual con todos los vestidos asignados.

**Responsabilidades:**
- Crear grid de 7 columnas (L-D) × días del mes
- Obtener vestidos para cada fecha
- Calcular horas totales por día
- Renderizar vestidos clasificados por estado
- Aplicar estilos según proveedor
- Mostrar badges de horas libres/usadas

**Variables Globales Utilizadas:**
- `mesActualCalendario` - Mes actual visualizado
- `anioActualCalendario` - Año actual visualizado
- `vestidos[]` - Array de todos los vestidos
- `horasConfeccion{}` - Objeto con intervalos de trabajo por vestido
- `planificacion{}` - Objeto con planificación automática por fecha
- `vestidosGrupos{}` - Grupos de vestidos para trabajo conjunto

#### 2. `obtenerVestidosParaFecha(fechaStr)` (Línea 8451)
**Propósito:** Obtiene todos los vestidos que deben mostrarse en una fecha específica.

**Lógica de Agregación:**
1. Vestidos con planificación automática (`planificacion[fechaStr]`)
2. Vestidos con intervalos asignados para esa fecha
3. Vestidos enviados en esa fecha (si filtro activo)
4. Albaranes sin producción (si filtro activo)
5. Vestidos con fecha límite en esa fecha (si filtro activo)
6. Vestidos con fecha inicio sugerida
7. Vestidos con planificación sugerida

**Filtrado Final:**
- Por categoría (enviados, albaranes, fecha fin, en proceso, producción)
- Por proveedor (Pronovias, Rosa Clará, Traka)

---

## 🎨 Sistema de Filtros

### Filtros Disponibles

| Filtro | ID | Comportamiento | Default |
|--------|-----|----------------|---------|
| **✨ Todos** | `filtro-todos` | Activa todos los filtros simultáneamente | ❌ |
| **📦 Vestidos Enviados** | `filtro-enviados` | Muestra vestidos enviados en su fecha de envío | ✅ |
| **🚚 Albaranes** | `filtro-albaranes` | Muestra envíos sin producción (solo albarán) | ✅ |
| **⏰ Fecha Fin** | `filtro-fecha-fin` | Muestra vestidos según fecha límite | ✅ |
| **⚙️ En Proceso** | `filtro-en-proceso-calendario` | Vestidos con intervalos de trabajo | ✅ |
| **👗 Todos en Producción** | `filtro-produccion` | Vista general (solo referencia) | ❌ |
| **❌ Ninguno** | `filtro-ninguno` | Desactiva todos los filtros | ❌ |
| **🏢 Proveedor** | `filtro-calendario-proveedor` | Filtra por proveedor específico | Todos |

### Objeto de Configuración de Filtros

```javascript
let filtrosCalendarioActivos = {
    proveedor: 'todos',
    mostrarEnviados: true,
    mostrarAlbaranes: true,
    mostrarFechaFin: true,
    mostrarEnProceso: true,
    mostrarProduccion: false
};
```

---

## 📊 Clasificación de Vestidos en el Calendario

### 1. Vestidos en Proceso (✅)
**Características:**
- Tienen intervalos de trabajo asignados (`horasConfeccion[id].intervalos`)
- O están en planificación automática (`planificacion[fecha]`)
- Se muestran con icono ✅
- **Draggable:** Sí (excepto si tienen `esManual: true`)
- **Color:** Según proveedor

**Código:**
```javascript
const vestidosEnProceso = vestidosEnFecha.filter(v => {
    const esAlbaranDelDia = /* lógica de albarán */;
    return horasConfeccion[v.id] && !esAlbaranDelDia;
});
```

### 2. Vestidos Pendientes (⏳ 🤖 📅)
**Características:**
- Sin intervalos asignados
- Mostrados por fecha límite, inicio sugerido o planificación sugerida
- **Iconos:**
  - 🤖 = Planificación automática
  - 📅 = Planificación sugerida
  - ⏳ = Solo fecha límite
- **Draggable:** Sí
- **Color:** Según proveedor

### 3. Albaranes/Vestidos Enviados (📦)
**Características:**
- Estado `enviado` o `pagado`
- Se muestran en su `fechaEnvio`
- Agrupados en un card especial
- **Draggable:** No
- **Color:** Degradado rojo (#FEE2E2 → #FCA5A5)

**Código:**
```javascript
vestidosHtml += `<div draggable="false" 
    onclick="mostrarModalVestidosEnviados('${fechaStr}', [${vestidosIds}]);"
    style="background: linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%);">
    📦 ${count} Enviado${count > 1 ? 's' : ''}
</div>`;
```

### 4. Vestidos Solo en Producción (👗)
**Características:**
- Estado `en_taller` o `con_tara`
- Sin planificación, sin fecha límite, sin horas
- Solo para referencia (read-only)
- **Draggable:** No
- **Color:** Degradado con opacidad reducida
- **Estilo:** Borde discontinuo (dashed)

---

## 🎯 Gestión de Grupos

### Agrupación de Vestidos
Los vestidos pueden agruparse para trabajar conjuntamente. Los grupos:

**Identificación Visual:**
- Prefijo `🔗` en el nombre
- Sufijo `S` si son múltiples vestidos del mismo modelo
- Ejemplo: `🔗 ALESSIAS (3) [L1,L2,L3]`

**Características:**
- Los grupos comparten intervalos de trabajo
- Badge `🔒 MANUAL` si tienen intervalos manuales (no arrastrables)
- Horas totales calculadas sumando todos los vestidos del grupo
- Click abre modal para dividir horas entre vestidos del grupo

**Código de Renderizado:**
```javascript
const nombreDisplay = vestidosDelGrupoEnFecha.length > 1 
    ? `${vestidosDelGrupoEnFecha[0].nombreModelo}S (${vestidosDelGrupoEnFecha.length}) [${lotesGrupo}]` 
    : `${vestidosDelGrupoEnFecha[0].nombreModelo} [${lote}]`;
```

---

## ⏱️ Cálculo de Horas por Día

### Sistema de Límites de Horas

**Función:** `obtenerLimiteHoras(fechaStr)`

Cada día laboral tiene un límite de horas disponibles basado en:
- Número de trabajadoras activas
- Jornada laboral configurada
- Festivos y calendario laboral
- Ausencias (vacaciones, bajas)

### Visualización de Horas

**Badge de Horas por Día:**
```javascript
// Cuando hay horas asignadas
"8.5h usado / 2.5h libre"  // Verde si hay horas libres
"12.0h usado / -1.0h exceso"  // Rojo si hay exceso

// Cuando no hay horas asignadas
"11.0h libres"
```

**Cálculo de Horas Totales:**
```javascript
let horasTotales = 0;
vestidosEnProceso.forEach(v => {
    const horas = horasConfeccion[v.id];
    if (horas && horas.intervalos) {
        horas.intervalos.forEach(intervalo => {
            if (intervalo.inicio.split('T')[0] === fechaStr) {
                const diffHours = (finDate - inicioDate) / (1000 * 60 * 60);
                horasTotales += diffHours;
            }
        });
    }
});

// Añadir horas de planificación automática
if (planificacion[fechaStr]) {
    planificacion[fechaStr].forEach(entrada => {
        if (!tieneIntervalosManual) {
            horasTotales += entrada.horas;
        }
    });
}
```

**⚠️ Deduplicación de Grupos:**
Los grupos se procesan una sola vez para evitar contar horas múltiples veces:
```javascript
const gruposProcesados = new Set();
if (grupoId && gruposProcesados.has(grupoId)) {
    return; // Ya contado
}
gruposProcesados.add(grupoId);
```

---

## 🎨 Codificación de Colores

### Colores por Proveedor

| Proveedor | Color de Fondo | Color de Borde |
|-----------|----------------|----------------|
| **Pronovias** | `#E0F2FE` (Azul claro) | `#7DD3FC` (Azul) |
| **Rosa Clará** | `#FCE7F3` (Rosa claro) | `#F9A8D4` (Rosa) |
| **Traka** | `#DCFCE7` (Verde claro) | `#86EFAC` (Verde) |

### Variables CSS Utilizadas
```css
--color-pronovias: #E0F2FE;
--color-pronovias-borde: #7DD3FC;
--color-traka: #DCFCE7;
--color-traka-borde: #86EFAC;
--color-rosa_clara: #FCE7F3;
--color-rosa_clara-borde: #F9A8D4;
```

### Estados Especiales

**Intervalos Manuales:**
- Borde verde doble: `border: 2px solid var(--color-exito)`
- Sombra verde: `box-shadow: 0 0 6px var(--color-exito)`
- Badge: `🔒 MANUAL`

**Vestidos Enviados:**
- Icono: `↗️` prefijo
- Opacidad: Normal (no reducida)

**Vestidos de Producción Solo:**
- Opacidad: `0.6`
- Borde: `2px dashed` (discontinuo)
- Degradado: `linear-gradient(135deg, ${colorBg}, #F9FAFB)`

---

## 🖱️ Funcionalidades de Drag & Drop

### Eventos de Arrastre

#### 1. `onDragStartCalendario(event, vestidoId, fechaStr)`
**Acción:** Inicia el arrastre de un vestido individual
**Almacena:**
- `event.dataTransfer.setData('vestidoId', vestidoId)`
- `event.dataTransfer.setData('fechaOrigen', fechaStr)`

#### 2. `onDragStartCalendarioGrupo(event, grupoId, fechaStr)`
**Acción:** Inicia el arrastre de un grupo completo
**Almacena:**
- `event.dataTransfer.setData('grupoId', grupoId)`
- `event.dataTransfer.setData('fechaOrigen', fechaStr)`

#### 3. `onDropCalendario(event, fechaDestino)`
**Acción:** Procesa el drop en un día
**Validaciones:**
- ❌ Rechaza drops en fines de semana (sábado/domingo)
- ❌ Rechaza si es la misma fecha origen/destino
- ✅ Mueve intervalos de trabajo a nueva fecha
- ✅ Actualiza planificación automática si aplica

**Código de Validación:**
```javascript
const fecha = new Date(fechaDestino + 'T00:00:00');
const diaSemana = fecha.getUTCDay();
if (diaSemana === 0 || diaSemana === 6) {
    alert('No se puede asignar trabajo en fines de semana');
    return;
}
```

### Restricciones de Draggable

**No Arrastrables:**
- Vestidos con `esManual: true` (intervalos manuales)
- Grupos con algún vestido con intervalo manual
- Albaranes/vestidos enviados
- Vestidos de producción solo (referencia)

**Arrastrables:**
- Vestidos en proceso sin marca manual
- Vestidos pendientes (⏳ 🤖 📅)
- Grupos sin intervalos manuales

---

## 🔧 Problemas Identificados

### 🔴 CRÍTICO: Rendimiento en `obtenerVestidosParaFecha()`

**Problema:** Uso ineficiente de `.find()` en bucles anidados

**Código Problemático:**
```javascript
vestidos.forEach(vestido => {
    if (!resultado.find(v => v.id === vestido.id)) { // O(n) por cada iteración
        resultado.push(vestido);
    }
});
```

**Impacto:**
- Para 300 vestidos × 31 días = **9,300+ operaciones `.find()`** por generación de calendario
- Complejidad: O(n²) en lugar de O(n)
- Ralentización perceptible con >200 vestidos

**Solución Propuesta:**
```javascript
const addedIds = new Set();
vestidos.forEach(vestido => {
    if (!addedIds.has(vestido.id)) { // O(1) - constante
        addedIds.add(vestido.id);
        resultado.push(vestido);
    }
});
```

### 🟡 MEDIO: Lógica Compleja de Filtros

**Problema:** Los filtros tienen solapamiento y pueden causar confusión

**Ejemplo de Solapamiento:**
- Un vestido enviado CON producción aparece en "Vestidos Enviados"
- El mismo vestido también aparece en "En Proceso" si tiene intervalos
- Puede confundir al usuario sobre el estado real

**Categorización Actual:**
```javascript
// Un vestido puede estar en MÚLTIPLES categorías
if (esEnviado && fechaEnvio === fechaStr) {
    categorias.push('enviados');
    if (!tieneIntervalos) {
        categorias.push('albaranes'); // Doble categoría
    }
}
if (tieneIntervalos) {
    categorias.push('en_proceso'); // Tercera categoría posible
}
```

**Sugerencia:** Clarificar en la UI que las categorías no son exclusivas

### 🟡 MEDIO: Cálculo de Horas en Grupos

**Problema:** La deduplicación solo procesa el primer vestido encontrado del grupo

**Código:**
```javascript
vestidosEnProceso.forEach(v => {
    const grupoId = horas.grupoId;
    if (grupoId && gruposProcesados.has(grupoId)) {
        return; // ⚠️ Salta el resto del grupo
    }
    // ... calcula horas solo del primer vestido
});
```

**Impacto Potencial:**
- Si los intervalos no son idénticos entre vestidos del grupo, puede haber subcalculo
- En la práctica, los grupos deberían compartir intervalos idénticos, pero no está garantizado

**Solución:** Verificar que TODOS los vestidos de un grupo compartan intervalos

### 🟢 BAJO: Complejidad en `obtenerVestidosParaFecha()`

**Problema:** La función tiene 7 bucles separados sobre el array `vestidos`

**Impacto:**
- Difícil de mantener
- Posibles bugs por lógica duplicada
- Rendimiento subóptimo (7 iteraciones completas)

**Sugerencia:** Refactorizar en un único bucle con lógica condicional

---

## 📈 Flujo de Usuario Típico

### Caso de Uso 1: Asignar Vestido a un Día

**Pasos:**
1. Usuario navega al mes deseado con botones `◀ Anterior` / `Siguiente ▶`
2. Filtra por proveedor si es necesario (ej: solo Pronovias)
3. Arrastra vestido desde lista "En Taller" al día deseado
4. Sistema valida que no sea fin de semana
5. Se abre modal para dividir horas entre trabajadoras
6. Usuario asigna horas y confirma
7. Calendario se regenera mostrando el vestido en el día

### Caso de Uso 2: Planificación Automática

**Pasos:**
1. Usuario hace click en `🤖 Planificación Automática`
2. Sistema ejecuta algoritmo de distribución de carga
3. Vestidos se asignan automáticamente según:
   - Fecha límite
   - Horas disponibles por día
   - Prioridad (más urgentes primero)
4. Vestidos planificados muestran icono `🤖`
5. Usuario puede ajustar manualmente si necesario
6. Click en `🗑️ Limpiar Automático` para resetear

### Caso de Uso 3: Trabajo en Grupo

**Pasos:**
1. Usuario activa "Modo Agrupar" en sección "En Taller"
2. Selecciona 2+ vestidos similares
3. Click en `✅ Crear Grupo`
4. Grupo aparece con prefijo `🔗` y sufijo `S`
5. Usuario arrastra grupo completo a un día
6. Asigna horas totales que se dividen entre vestidos
7. Todos los vestidos del grupo comparten intervalos

---

## 🎯 Métricas de Rendimiento Estimadas

### Tiempo de Generación de Calendario

**Con 100 vestidos:**
- Generación HTML: ~50ms
- Renderizado DOM: ~30ms
- **Total: ~80ms** ✅ Aceptable

**Con 300 vestidos:**
- Generación HTML: ~180ms
- Renderizado DOM: ~90ms
- **Total: ~270ms** ⚠️ Perceptible

**Con 500+ vestidos:**
- Generación HTML: ~400ms
- Renderizado DOM: ~150ms
- **Total: ~550ms** ❌ Lento

**Factores que Impactan:**
- Número total de vestidos en `vestidos[]`
- Vestidos con múltiples intervalos
- Grupos grandes (>5 vestidos)
- Uso de múltiples filtros activos

---

## 🔒 Características de Seguridad y Validación

### Validaciones Implementadas

1. **Fines de Semana**
   - ❌ No permite asignar trabajo en sábados/domingos
   - Mensaje: "No se puede asignar trabajo en fines de semana"

2. **Fechas Pasadas**
   - ⚠️ Permite ver pero marca visualmente como pasadas
   - Vestidos enviados no se muestran en fechas futuras

3. **Intervalos Manuales**
   - 🔒 No arrastrables (protegidos)
   - Requiere edición manual en modal

4. **Horas Negativas**
   - ⚠️ Permite asignar más horas que disponibles
   - Muestra "exceso" en rojo para alertar

### Persistencia de Datos

**LocalStorage:**
- `vestidos` - Array de todos los vestidos
- `horasConfeccion` - Intervalos de trabajo por vestido
- `planificacion` - Planificación automática por fecha
- `vestidosGrupos` - Definición de grupos
- `modelos` - Catálogo de modelos con horas estimadas

**Guardado Automático:**
Cada cambio dispara `guardarDatos()` que sincroniza con localStorage.

---

## 📱 Responsive Design

### Adaptación a Pantallas

**Desktop (>1200px):**
- Grid completo 7×5 días
- Todos los detalles visibles
- Drag & drop fluido

**Tablet (768px - 1200px):**
- Grid reducido
- Nombres de vestidos truncados
- Scroll horizontal si necesario

**Mobile (<768px):**
- ⚠️ **Limitaciones:** El calendario no está completamente optimizado para móvil
- Vista de lista sería preferible
- Drag & drop difícil en táctil

---

## 🛠️ Recomendaciones de Mejora

### Alta Prioridad

1. **Optimizar `obtenerVestidosParaFecha()`**
   - Usar `Set` en lugar de `.find()` repetido
   - Consolidar bucles múltiples en uno solo
   - **Ganancia esperada:** 60-70% reducción en tiempo de generación

2. **Clarificar Filtros Solapados**
   - Añadir tooltip explicando que las categorías no son exclusivas
   - O hacer filtros mutuamente exclusivos (radio buttons en lugar de checkboxes)

3. **Validar Integridad de Grupos**
   - Asegurar que todos los vestidos de un grupo compartan intervalos idénticos
   - Añadir validación al crear/modificar grupos

### Media Prioridad

4. **Indicador de Carga**
   - Mostrar spinner durante regeneración de calendario con >300 vestidos
   - Mejora UX durante operaciones lentas

5. **Cache de Resultados**
   - Cachear `obtenerVestidosParaFecha()` por fecha
   - Invalidar solo cuando cambian datos relevantes
   - **Ganancia esperada:** 80% reducción en regeneraciones

6. **Vista Móvil Mejorada**
   - Crear vista de lista alternativa para pantallas <768px
   - Mantener funcionalidad esencial sin drag & drop

### Baja Prioridad

7. **Búsqueda en Calendario**
   - Añadir campo de búsqueda para resaltar vestidos específicos
   - Saltar automáticamente al mes donde está el vestido

8. **Atajos de Teclado**
   - `←` / `→` para navegar meses
   - `T` para ir a "Today" (Hoy)
   - `Esc` para cerrar modales

9. **Exportar Vista de Calendario**
   - Botón para exportar calendario mensual como PDF/imagen
   - Útil para impresiones o compartir con equipo

---

## 📊 Estadísticas del Código

### Tamaño y Complejidad

**Función `generarCalendarioPlanificacion()`:**
- Líneas: ~475 (7926-8400)
- Complejidad ciclomática: Alta (~35 rutas de ejecución)
- Anidamiento máximo: 5 niveles

**Función `obtenerVestidosParaFecha()`:**
- Líneas: ~180 (8451-8630)
- Bucles `forEach`: 7
- Complejidad ciclomática: Media (~20 rutas)

**Total de Código Relacionado con Calendario:**
- ~1,500 líneas (HTML + CSS + JavaScript)
- 15+ funciones auxiliares
- 8 event handlers

### Dependencias Externas

**Bibliotecas:**
- ✅ Ninguna - JavaScript Vanilla puro
- ✅ Sin jQuery ni frameworks

**APIs del Navegador:**
- Drag & Drop API (HTML5)
- localStorage
- Date API

---

## ✅ Conclusiones

### Fortalezas del Sistema

1. ✅ **Funcionalidad Completa:** Cubre todos los casos de uso de planificación
2. ✅ **Sin Dependencias:** Código vanilla, fácil de mantener
3. ✅ **Filtrado Flexible:** Sistema multi-filtro permite vistas personalizadas
4. ✅ **Integración Completa:** Sincroniza con inventario, facturación y finanzas
5. ✅ **Visual e Intuitivo:** Colores por proveedor, iconos descriptivos

### Áreas de Mejora

1. ⚠️ **Rendimiento:** Optimizar bucles y uso de `.find()`
2. ⚠️ **Complejidad:** Simplificar lógica de filtros solapados
3. ⚠️ **Validación:** Mejorar integridad de grupos
4. ⚠️ **Responsive:** Adaptar mejor a pantallas pequeñas
5. ⚠️ **Documentación:** Añadir comentarios en código complejo

### Estado General

El calendario de planificación es una herramienta **funcional y bien diseñada** que cumple con los requisitos del negocio. Las optimizaciones propuestas son mejoras incrementales que aumentarían el rendimiento y la experiencia de usuario, pero no son críticas para la operación actual del sistema.

**Calificación General:** ⭐⭐⭐⭐☆ (4/5)

---

## 📚 Glosario

- **Vestido:** Unidad de producción (vestido de novia)
- **Intervalo:** Período de trabajo asignado con trabajadora, inicio y fin
- **Grupo:** Conjunto de vestidos trabajados conjuntamente
- **Albarán:** Nota de entrega (vestido enviado sin producción previa)
- **Planificación Automática:** Algoritmo que distribuye vestidos según disponibilidad
- **Fecha Límite:** Deadline del vestido (fecha máxima de finalización)
- **Horas Estimadas:** Horas previstas según modelo
- **Horas Reales:** Horas efectivamente trabajadas (suma de intervalos)

---

**Documento generado automáticamente por análisis de código**  
**Autor:** Sistema de Análisis de Gestión Taller  
**Versión:** 1.0
