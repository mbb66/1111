# Sistema de Contabilidad para Taller

Este directorio contiene un sistema de contabilidad básico implementado en Google Sheets con Apps Script. El sistema permite gestionar facturas recibidas, extractos bancarios, conciliación, informes de IVA y backups automáticos.

## 📋 Características

- **Gestión de Facturas Recibidas**: Importación y registro de facturas con generación automática de asientos contables
- **Extractos Bancarios**: Importación de movimientos bancarios desde CSV
- **Conciliación**: Vinculación automática entre pagos bancarios y facturas (tolerancia ±0.5 EUR)
- **Informe IVA**: Generación de resumen de IVA soportado por trimestre
- **Plan Contable**: Plan contable simplificado español preconfigurado
- **Backups**: Copias automáticas a Google Drive con timestamp
- **Auditoría**: Registro de todas las operaciones realizadas

## 🚀 Instalación Paso a Paso

### 1. Crear la Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Renómbrala como "Contabilidad Taller" o el nombre que prefieras

### 2. Configurar Apps Script

#### Opción A: Usando el Editor de Apps Script (Recomendado)

1. En tu Google Sheet, ve a **Extensiones > Apps Script**
2. Se abrirá el editor de Apps Script con un archivo `Code.gs` vacío
3. Borra todo el contenido del archivo `Code.gs`
4. Copia todo el contenido del archivo [`apps_script/Code.gs`](apps_script/Code.gs) de este repositorio
5. Pégalo en el editor de Apps Script
6. Guarda el proyecto (Ctrl+S o Cmd+S)

#### Opción B: Configurar el Manifest (Opcional, para usuarios avanzados)

El archivo `appsscript.json` contiene la configuración del proyecto Apps Script, incluyendo los permisos (scopes) necesarios.

**Usando el Editor Web:**
1. En el editor de Apps Script, haz clic en el icono de configuración ⚙️ (Project Settings)
2. Marca la opción "Show 'appsscript.json' manifest file in editor"
3. Vuelve al editor y verás el archivo `appsscript.json`
4. Reemplaza su contenido con el del archivo [`apps_script/appsscript.json`](apps_script/appsscript.json)

**Usando clasp (línea de comandos):**
```bash
# Instalar clasp si no lo tienes
npm install -g @google/clasp

# Login
clasp login

# Crear proyecto (en el directorio de tu sheet)
clasp create --type sheets --title "Contabilidad Taller"

# Copiar archivos
cp apps_script/Code.gs ./Code.gs
cp apps_script/appsscript.json ./appsscript.json

# Subir a Google
clasp push
```

### 3. Crear la Plantilla de Hojas

1. Cierra y vuelve a abrir la Google Sheet (para que se cargue el menú personalizado)
2. Verás un nuevo menú **"Contabilidad"** en la barra superior
3. Haz clic en **Contabilidad > 1. Crear Hojas de Plantilla**
4. Aparecerá un diálogo solicitando permisos. Haz clic en **Continuar**
5. Selecciona tu cuenta de Google
6. Haz clic en **Avanzado** y luego en **Ir a Contabilidad Taller (no seguro)**
7. Revisa los permisos y haz clic en **Permitir**
8. El sistema creará automáticamente las siguientes hojas:
   - `00_Config`: Configuración del sistema
   - `01_Proveedores`: Datos de proveedores
   - `02_Facturas_Recibidas`: Registro de facturas
   - `03_Banco_Extractos`: Movimientos bancarios
   - `04_Asientos`: Asientos contables
   - `05_Plan_Contable`: Plan contable simplificado
   - `06_Activos_Fijos`: Registro de activos
   - `07_Nominas`: Nóminas (opcional)
   - `08_Backups`: Registro de copias de seguridad
   - `09_Auditoria`: Log de operaciones
   - `bank_csv_import`: Hoja temporal para pegar CSV bancario
   - `facturas_import`: Hoja temporal para pegar facturas

### 4. Configurar Parámetros Iniciales

1. Ve a la hoja `00_Config`
2. Completa los siguientes parámetros:
   - **empresa_nombre**: Nombre de tu empresa
   - **empresa_cif**: CIF/NIF de la empresa
   - **ejercicio_fiscal**: Año fiscal actual (por defecto el año actual)
   - **tolerancia_conciliacion**: Tolerancia en EUR para conciliación automática (por defecto 0.5)
   - **backup_folder_id**: (Opcional) ID de carpeta de Google Drive para backups
     - Para obtener el ID: abre la carpeta en Drive, copia el ID de la URL (la parte después de `/folders/`)

## 📊 Uso del Sistema

### Importar Extracto Bancario

1. Descarga el extracto bancario de tu banco en formato CSV
2. Abre el archivo CSV con un editor de texto o Excel
3. Copia las filas de datos (sin encabezados o con encabezados)
4. Ve a la hoja `bank_csv_import` en tu Google Sheet
5. Pega los datos a partir de la fila 1 o 2
6. Las columnas esperadas son: `Fecha | Fecha_Valor | Descripción | Importe | Saldo`
   - Ver [`templates/bank_sample.csv`](templates/bank_sample.csv) para ver el formato
7. Ve al menú **Contabilidad > 2. Importar Extracto Bancario**
8. Los movimientos se importarán a la hoja `03_Banco_Extractos`
9. Revisa los datos importados

**Notas:**
- Los importes negativos se clasifican como "Gasto"
- Los importes positivos se clasifican como "Ingreso"
- Todos los movimientos inician como "No conciliado"

### Importar Facturas Recibidas

1. Prepara un archivo CSV con tus facturas
2. Las columnas deben ser: `Fecha | Proveedor_Nombre | Num_Factura | Base_Imponible | IVA_% | Total | Forma_Pago | Días_Vencimiento`
   - Ver [`templates/facturas_sample.csv`](templates/facturas_sample.csv) para ver el formato
3. Copia los datos del CSV
4. Pega en la hoja `facturas_import`
5. Ve al menú **Contabilidad > 3. Importar Facturas**
6. El sistema:
   - Creará registros en `02_Facturas_Recibidas`
   - Generará asientos contables automáticos en `04_Asientos`
   - Calculará la fecha de vencimiento según los días especificados
7. Revisa las facturas y asientos generados

**Asientos generados automáticamente:**
- **Debe**: Cuenta 600 (Compras) por el importe de la base imponible
- **Debe**: Cuenta 472 (HP IVA Soportado) por el importe del IVA
- **Haber**: Cuenta 400 (Proveedores) por el total de la factura

### Conciliar Banco con Facturas

1. Ve al menú **Contabilidad > 4. Conciliar Banco/Facturas**
2. El sistema buscará automáticamente:
   - Movimientos bancarios negativos (pagos) no conciliados
   - Facturas no pagadas
   - Vinculará aquellos cuyo importe coincida (±tolerancia configurada)
3. Los registros conciliados se marcarán automáticamente:
   - En `03_Banco_Extractos`: columna "Conciliado" = TRUE, "Factura_ID" = ID de factura
   - En `02_Facturas_Recibidas`: columna "Pagada" = TRUE, "Conciliada" = TRUE, "Fecha_Pago" = fecha del movimiento
4. Revisa los resultados y ajusta manualmente si es necesario

### Generar Informe IVA Trimestral

1. Ve al menú **Contabilidad > 5. Generar Informe IVA**
2. Introduce el periodo en formato `YYYY-Q` (ejemplo: `2024-1` para primer trimestre de 2024)
3. El sistema generará un informe en la hoja `IVA_Report` con:
   - Resumen por tipo de IVA (21%, 10%, 4%, etc.)
   - Total de base imponible
   - Total de IVA soportado
   - Número de facturas por tipo de IVA
4. Usa este informe para verificar la información de tu gestoría

**Periodos trimestrales:**
- Trimestre 1: Enero - Marzo
- Trimestre 2: Abril - Junio
- Trimestre 3: Julio - Septiembre
- Trimestre 4: Octubre - Diciembre

### Crear Backup

1. Ve al menú **Contabilidad > 6. Backup a Drive**
2. El sistema creará una copia completa de tu hoja de cálculo
3. El backup se guardará:
   - En la carpeta configurada en `00_Config` (si especificaste un `backup_folder_id`)
   - En la raíz de tu Google Drive (si no especificaste carpeta)
4. El nombre del archivo incluirá fecha y hora: `Contabilidad_Backup_YYYYMMDD_HHMMSS`
5. Se registrará en la hoja `08_Backups` con URL de acceso

**Recomendación:** Realiza backups antes de importaciones masivas o cambios importantes.

## 📁 Estructura de Archivos

```
contabilidad/
├── README.md                          # Este archivo
├── apps_script/
│   ├── Code.gs                        # Código principal de Apps Script
│   └── appsscript.json               # Manifest del proyecto
└── templates/
    ├── plan_contable.csv             # Plan contable simplificado
    ├── bank_sample.csv               # Ejemplo de CSV bancario
    ├── facturas_sample.csv           # Ejemplo de CSV de facturas
    └── sheet_structure.md            # Documentación de columnas
```

## 📖 Documentación de Hojas

Para más detalles sobre las columnas esperadas en cada hoja y cómo usar las plantillas, consulta [`templates/sheet_structure.md`](templates/sheet_structure.md).

## ⚙️ Plan Contable

El sistema incluye un plan contable simplificado basado en el PGC español. Puedes encontrar el listado completo en [`templates/plan_contable.csv`](templates/plan_contable.csv) o en la hoja `05_Plan_Contable` después de crear la plantilla.

Puedes ampliar o modificar el plan contable directamente en la hoja `05_Plan_Contable` según tus necesidades.

## 🔒 Permisos Necesarios

El script requiere los siguientes permisos de Google:
- **Spreadsheets**: Para leer y escribir en la hoja de cálculo
- **Drive**: Para crear backups

Estos permisos están definidos en `appsscript.json`.

## ⚠️ Consideraciones Importantes

1. **No sustituye a un asesor fiscal**: Este sistema es una herramienta de ayuda para control y verificación, no reemplaza el trabajo de tu gestoría.

2. **Validación manual**: Siempre revisa los datos importados y los asientos generados antes de considerarlos definitivos.

3. **Backups regulares**: Realiza copias de seguridad periódicas, especialmente antes de importaciones masivas.

4. **Datos sensibles**: Este sistema trabaja en tu cuenta personal de Google. No compartas la hoja con terceros sin revisar que no contenga información confidencial.

5. **Ampliación del plan contable**: El plan contable incluido es básico. Amplíalo según las necesidades específicas de tu negocio.

6. **Formato de CSV**: Asegúrate de que los CSV de tu banco coincidan con el formato esperado. Puede que necesites ajustar las columnas manualmente.

## 🛠️ Solución de Problemas

### No aparece el menú "Contabilidad"
- Cierra y vuelve a abrir la hoja de cálculo
- Verifica que el código de Apps Script se haya guardado correctamente
- Revisa que no haya errores en el código (Extensiones > Apps Script > Ver > Registros)

### Error al importar CSV
- Verifica que las columnas estén en el orden correcto
- Asegúrate de que las fechas estén en formato reconocible (DD/MM/YYYY o YYYY-MM-DD)
- Revisa que los importes usen punto o coma como separador decimal de forma consistente

### No se concilian automáticamente
- Verifica que los importes sean exactamente iguales (±0.5 EUR por defecto)
- Comprueba que las facturas no estén ya marcadas como pagadas
- Asegúrate de que los movimientos bancarios sean negativos (pagos)

### Error de permisos
- Verifica que hayas autorizado todos los permisos solicitados
- Intenta revocar y volver a autorizar: Google Account > Seguridad > Acceso de terceros > Contabilidad Taller

## 📝 Plantillas y Ejemplos

Las plantillas en el directorio `templates/` contienen estructuras vacías o con datos ficticios para que puedas entender el formato esperado:

- **bank_sample.csv**: Muestra el formato de CSV bancario esperado (sin datos reales)
- **facturas_sample.csv**: Muestra el formato para importar facturas (ejemplos anonimizados)
- **plan_contable.csv**: Plan contable completo que se carga automáticamente

## 🤝 Soporte

Este es un sistema básico de contabilidad. Para necesidades más complejas, considera:
- Ampliar el código de Apps Script según tus requisitos
- Usar software de contabilidad profesional
- Consultar con tu asesor fiscal

## 📄 Licencia

Este código se proporciona como herramienta de ayuda para uso personal. Úsalo bajo tu propia responsabilidad.
