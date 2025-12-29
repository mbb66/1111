# Sistema de Contabilidad para Taller - Google Sheets + Apps Script

## Propósito

Este sistema proporciona una plantilla completa de contabilidad local en Google Sheets con Apps Script para gestionar:
- Plan contable simplificado
- Importación de extractos bancarios
- Registro de facturas recibidas
- Generación de informes de IVA trimestral
- Conciliación básica entre banco y facturas
- Backups automáticos a Google Drive

**Nota importante**: Esta herramienta es un sistema de control y conciliación para verificar la información proporcionada por la gestoría. No sustituye el trabajo profesional de un gestor.

## Requisitos

- Cuenta de Google
- Acceso a Google Sheets y Google Drive

## Instalación Paso a Paso

### 1. Crear una Nueva Google Sheet

1. Accede a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo vacía
3. Nómbrala "Contabilidad Taller - [AñoActual]"

### 2. Abrir el Editor de Apps Script

1. En la hoja de cálculo, ve a **Extensiones > Apps Script**
2. Se abrirá el editor de Apps Script con un archivo `Code.gs` vacío

### 3. Copiar el Código Apps Script

1. Abre el archivo `apps_script/Code.gs` de este repositorio
2. Copia todo su contenido
3. Pega el contenido en el editor de Apps Script, reemplazando el código existente
4. Guarda el proyecto (Ctrl+S o Cmd+S)

### 4. Configurar el Manifest

1. En el editor de Apps Script, busca el archivo `appsscript.json` en el panel izquierdo
   - Si no lo ves, haz clic en el icono de configuración (⚙️) y activa "Mostrar archivo de manifiesto appsscript.json"
2. Abre el archivo `apps_script/appsscript.json` de este repositorio
3. Copia todo su contenido
4. Pega el contenido en el editor, reemplazando el contenido existente
5. Guarda los cambios

### 5. Crear las Hojas de Trabajo

1. Vuelve a tu Google Sheet
2. Recarga la página (F5)
3. Espera unos segundos y verás aparecer un nuevo menú "🧾 Contabilidad" en la barra superior
4. Haz clic en **🧾 Contabilidad > Crear Hojas de Plantilla**
5. La primera vez te pedirá autorización:
   - Haz clic en "Revisar permisos"
   - Selecciona tu cuenta de Google
   - Haz clic en "Avanzado" y luego en "Ir a [nombre del proyecto] (no seguro)"
   - Haz clic en "Permitir"
6. Una vez autorizado, ejecuta de nuevo **🧾 Contabilidad > Crear Hojas de Plantilla**
7. Se crearán automáticamente todas las hojas necesarias:
   - `00_Config` - Configuración general
   - `01_Proveedores` - Registro de proveedores
   - `02_Facturas_Recibidas` - Facturas de gastos
   - `03_Banco_Extractos` - Movimientos bancarios
   - `04_Asientos` - Asientos contables
   - `05_Plan_Contable` - Plan de cuentas
   - `06_Activos_Fijos` - Registro de activos
   - `07_Nominas` - Registro de nóminas
   - `08_Backups` - Registro de copias de seguridad
   - `09_Auditoria` - Log de acciones
   - `bank_csv_import` - Hoja temporal para importar CSV bancario
   - `facturas_import` - Hoja temporal para importar facturas

### 6. Configurar el Plan Contable (Opcional)

1. Abre el archivo `templates/plan_contable.csv` de este repositorio
2. Ve a la hoja `05_Plan_Contable`
3. Copia y pega los datos del CSV (sin encabezados, ya existen)
4. Personaliza las cuentas según tus necesidades

## Uso del Sistema

### Importar Extractos Bancarios

1. Descarga el extracto de tu banco en formato CSV
2. Abre el CSV y copia todas las filas (sin encabezados)
3. Ve a la hoja `bank_csv_import` en tu Google Sheet
4. Pega los datos a partir de la fila 2 (la fila 1 tiene los encabezados)
   - Asegúrate de que las columnas coincidan con: Fecha, Concepto, Importe, Referencia
5. Haz clic en **🧾 Contabilidad > Importar CSV Bancario**
6. Los movimientos se importarán a la hoja `03_Banco_Extractos`
7. Revisa los datos importados y limpia la hoja `bank_csv_import`

**Nota**: Consulta `templates/bank_sample.csv` para ver el formato esperado.

### Importar Facturas Recibidas

1. Prepara tus facturas en formato CSV según `templates/facturas_sample.csv`
2. Copia las filas de facturas (sin encabezados)
3. Ve a la hoja `facturas_import` en tu Google Sheet
4. Pega los datos a partir de la fila 2
5. Haz clic en **🧾 Contabilidad > Importar Facturas**
6. El sistema:
   - Añadirá las facturas a `02_Facturas_Recibidas`
   - Generará asientos automáticos en `04_Asientos`
   - Registrará la acción en `09_Auditoria`
7. Revisa los datos importados y limpia la hoja `facturas_import`

### Conciliar Banco con Facturas

1. Haz clic en **🧾 Contabilidad > Conciliar Banco con Facturas**
2. El sistema buscará coincidencias automáticas entre:
   - Movimientos bancarios en `03_Banco_Extractos`
   - Facturas en `02_Facturas_Recibidas`
3. Se marcarán como conciliados los movimientos que coincidan en importe (tolerancia ±0.5 EUR)
4. Revisa manualmente y ajusta según sea necesario

### Generar Informe de IVA

1. Haz clic en **🧾 Contabilidad > Generar Informe IVA**
2. Introduce las fechas del periodo (formato: YYYY-MM-DD):
   - Fecha de inicio (ej: 2024-01-01)
   - Fecha de fin (ej: 2024-03-31)
3. El sistema generará un resumen de IVA soportado en una nueva hoja `IVA_Report`
4. Incluirá el total de base imponible y cuotas de IVA por tipo

### Hacer Backup

1. Haz clic en **🧾 Contabilidad > Crear Backup en Drive**
2. Se creará una copia completa de la hoja con timestamp en tu Google Drive
3. El registro del backup se guardará en la hoja `08_Backups`

## Archivos de Ejemplo

En la carpeta `templates/` encontrarás:

- **plan_contable.csv**: Plan contable simplificado para comenzar
- **bank_sample.csv**: Ejemplo de formato de extracto bancario
- **facturas_sample.csv**: Ejemplos de facturas (incluye facturas 1176 y 1290)
- **sheet_structure.md**: Documentación detallada de las columnas de cada hoja

## Estructura de Hojas

Consulta `templates/sheet_structure.md` para una descripción completa de:
- Columnas esperadas en cada hoja
- Formatos de datos
- Validaciones automáticas
- Relaciones entre hojas

## Personalización

El código en `apps_script/Code.gs` está documentado y puede ser modificado según tus necesidades:
- Ajustar la tolerancia de conciliación
- Añadir nuevas validaciones
- Modificar el formato de los informes
- Añadir nuevos tipos de importación

## Solución de Problemas

**Error: "No se encuentra la hoja X"**
- Asegúrate de haber ejecutado "Crear Hojas de Plantilla" primero

**Error de permisos**
- Revisa que has autorizado todos los permisos necesarios
- Intenta revocar y volver a autorizar desde [myaccount.google.com/permissions](https://myaccount.google.com/permissions)

**Los importadores no funcionan**
- Verifica que los datos estén en las hojas correctas (`bank_csv_import` o `facturas_import`)
- Comprueba que el formato coincida con los ejemplos en `templates/`

**Las conciliaciones no funcionan**
- Revisa que los importes estén en formato numérico (no texto)
- Verifica que las fechas estén en formato válido

## Mantenimiento

- **Backups**: Ejecuta backups periódicos (se recomienda mensualmente)
- **Auditoría**: Revisa la hoja `09_Auditoria` para verificar todas las operaciones
- **Limpieza**: Limpia regularmente las hojas de importación temporal después de usarlas

## Soporte

Para problemas, sugerencias o mejoras, abre un issue en el repositorio de GitHub.

## Licencia

Este código es proporcionado como está, para uso personal del taller. Úsalo bajo tu propia responsabilidad.
