# Documentación de Estructura de Hojas

Este documento describe las columnas esperadas en cada hoja del sistema de contabilidad.

## 00_Config - Configuración del Sistema

| Columna | Tipo | Descripción |
|---------|------|-------------|
| Parámetro | Texto | Nombre del parámetro de configuración |
| Valor | Variado | Valor del parámetro |
| Descripción | Texto | Descripción del parámetro |

**Parámetros disponibles:**
- `empresa_nombre`: Nombre de la empresa
- `empresa_cif`: CIF/NIF de la empresa
- `ejercicio_fiscal`: Año fiscal actual (número)
- `tolerancia_conciliacion`: Tolerancia en EUR para conciliación automática (decimal)
- `backup_folder_id`: ID de carpeta de Google Drive para backups (texto)

## 01_Proveedores - Registro de Proveedores

| Columna | Tipo | Descripción |
|---------|------|-------------|
| ID | Número | Identificador único del proveedor (auto) |
| Nombre | Texto | Nombre o razón social del proveedor |
| CIF | Texto | CIF/NIF del proveedor |
| Dirección | Texto | Dirección del proveedor |
| Teléfono | Texto | Teléfono de contacto |
| Email | Texto | Email de contacto |
| Forma_Pago | Texto | Forma de pago habitual (Transferencia, Efectivo, etc.) |
| Días_Pago | Número | Plazo de pago habitual en días |
| Activo | Booleano | Si el proveedor está activo |
| Notas | Texto | Observaciones adicionales |

## 02_Facturas_Recibidas - Facturas de Proveedores

| Columna | Tipo | Descripción |
|---------|------|-------------|
| ID | Número | Identificador único de la factura (auto) |
| Fecha | Fecha | Fecha de emisión de la factura |
| Proveedor_ID | Número | ID del proveedor (referencia a 01_Proveedores) |
| Proveedor_Nombre | Texto | Nombre del proveedor |
| Num_Factura | Texto | Número de factura del proveedor |
| Base_Imponible | Número | Base imponible (sin IVA) |
| IVA_% | Número | Porcentaje de IVA aplicado (21, 10, 4, etc.) |
| IVA_Importe | Número | Importe del IVA calculado |
| Total | Número | Importe total de la factura (Base + IVA) |
| Forma_Pago | Texto | Forma de pago (Transferencia, Efectivo, etc.) |
| Fecha_Vencimiento | Fecha | Fecha de vencimiento calculada |
| Pagada | Booleano | Si la factura está pagada |
| Fecha_Pago | Fecha | Fecha en que se pagó la factura |
| Conciliada | Booleano | Si está conciliada con banco |
| Notas | Texto | Observaciones |

**Importación desde CSV:**
Usar la hoja `facturas_import` con estas columnas:
- Fecha, Proveedor_Nombre, Num_Factura, Base_Imponible, IVA_%, Total, Forma_Pago, Días_Vencimiento

## 03_Banco_Extractos - Movimientos Bancarios

| Columna | Tipo | Descripción |
|---------|------|-------------|
| ID | Número | Identificador único del movimiento (auto) |
| Fecha | Fecha | Fecha del movimiento |
| Fecha_Valor | Fecha | Fecha valor del movimiento |
| Descripción | Texto | Descripción del movimiento (concepto) |
| Importe | Número | Importe (positivo=ingreso, negativo=gasto) |
| Saldo | Número | Saldo después del movimiento |
| Tipo | Texto | Tipo de movimiento (Ingreso/Gasto) |
| Conciliado | Booleano | Si está conciliado con factura |
| Factura_ID | Número | ID de factura vinculada |
| Notas | Texto | Observaciones |

**Importación desde CSV:**
Usar la hoja `bank_csv_import` con estas columnas:
- Fecha, Fecha_Valor, Descripción, Importe, Saldo

**Formato de importación:**
- Fechas: DD/MM/YYYY o YYYY-MM-DD
- Importes: Usar punto o coma como decimal (el sistema normaliza)
- Negativos: Los gastos/pagos deben ser negativos
- Saldo: Opcional, útil para verificación

## 04_Asientos - Asientos Contables

| Columna | Tipo | Descripción |
|---------|------|-------------|
| ID | Número | Identificador único del asiento (auto) |
| Fecha | Fecha | Fecha del asiento |
| Tipo | Texto | Tipo de asiento (Factura Recibida, Pago, etc.) |
| Referencia | Texto | Referencia al documento origen (FR-123, etc.) |
| Cuenta | Texto | Código de cuenta del plan contable |
| Debe | Número | Importe en el debe |
| Haber | Número | Importe en el haber |
| Descripción | Texto | Descripción del asiento |

**Nota:** Los asientos se generan automáticamente al importar facturas. Cada factura genera 3 líneas:
1. Debe - Cuenta 600 (Compras): Base imponible
2. Debe - Cuenta 472 (IVA Soportado): Importe IVA
3. Haber - Cuenta 400 (Proveedores): Total factura

## 05_Plan_Contable - Plan de Cuentas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| Código | Texto | Código de la cuenta (100, 400, 572, etc.) |
| Nombre | Texto | Nombre de la cuenta |
| Tipo | Texto | Tipo (Activo, Pasivo, Gasto, Ingreso, etc.) |
| Descripción | Texto | Descripción detallada |

**Cuentas principales incluidas:**
- **100-129**: Patrimonio Neto (Capital, Resultados)
- **170**: Deudas a Largo Plazo
- **400-410**: Proveedores y Acreedores
- **430**: Clientes
- **472**: HP IVA Soportado
- **477**: HP IVA Repercutido
- **520**: Deudas a Corto Plazo
- **572**: Bancos
- **600**: Compras
- **621-629**: Gastos de explotación (Alquiler, Servicios, etc.)
- **640-642**: Gastos de personal
- **700-759**: Ingresos

Puedes ampliar el plan contable añadiendo nuevas filas según tus necesidades.

## 06_Activos_Fijos - Registro de Activos Fijos

| Columna | Tipo | Descripción |
|---------|------|-------------|
| ID | Número | Identificador único del activo |
| Fecha_Adquisición | Fecha | Fecha de compra del activo |
| Descripción | Texto | Descripción del activo |
| Valor_Adquisición | Número | Precio de compra |
| Vida_Útil_Años | Número | Vida útil en años para amortización |
| Amortización_Anual | Número | Cuota anual de amortización |
| Amortización_Acumulada | Número | Total amortizado hasta la fecha |
| Valor_Neto | Número | Valor neto contable (Adquisición - Amortización) |
| Cuenta_Activo | Texto | Código de cuenta del activo |
| Cuenta_Amortización | Texto | Código de cuenta de amortización acumulada |

**Uso:** Para registrar maquinaria, equipos informáticos, mobiliario, etc.

## 07_Nominas - Registro de Nóminas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| ID | Número | Identificador único de la nómina |
| Fecha | Fecha | Fecha de la nómina |
| Empleado | Texto | Nombre del empleado |
| Salario_Bruto | Número | Salario bruto mensual |
| SS_Empresa | Número | Cotización Seguridad Social a cargo empresa |
| SS_Trabajador | Número | Cotización SS a cargo trabajador |
| IRPF | Número | Retención IRPF |
| Salario_Neto | Número | Salario neto a pagar |
| Pagada | Booleano | Si la nómina está pagada |
| Notas | Texto | Observaciones |

**Uso opcional:** Puedes usar esta hoja si gestionas nóminas, aunque normalmente lo hace la gestoría.

## 08_Backups - Registro de Copias de Seguridad

| Columna | Tipo | Descripción |
|---------|------|-------------|
| Fecha | Fecha/Hora | Timestamp del backup |
| Nombre_Archivo | Texto | Nombre del archivo de backup |
| URL | Texto | URL del archivo en Google Drive |
| Notas | Texto | Observaciones sobre el backup |

**Auto-generado:** Esta hoja se rellena automáticamente al ejecutar "Backup a Drive".

## 09_Auditoria - Log de Auditoría

| Columna | Tipo | Descripción |
|---------|------|-------------|
| Timestamp | Fecha/Hora | Momento de la acción |
| Usuario | Texto | Email del usuario que ejecutó la acción |
| Acción | Texto | Tipo de acción (Importar Banco, Crear Plantilla, etc.) |
| Hoja | Texto | Hoja afectada |
| Detalles | Texto | Información adicional sobre la acción |

**Auto-generado:** Esta hoja registra automáticamente todas las operaciones del sistema.

## bank_csv_import - Hoja Temporal para Importación Banco

| Columna | Tipo | Descripción |
|---------|------|-------------|
| Fecha | Fecha | Fecha del movimiento (DD/MM/YYYY o YYYY-MM-DD) |
| Fecha_Valor | Fecha | Fecha valor (opcional, si no se proporciona = Fecha) |
| Descripción | Texto | Concepto del movimiento |
| Importe | Número | Importe (negativo para gastos, positivo para ingresos) |
| Saldo | Número | Saldo resultante (opcional) |

**Instrucciones:**
1. Descarga tu extracto bancario en CSV
2. Copia las filas de datos (puedes incluir o no los encabezados)
3. Pega en esta hoja
4. Ejecuta "Contabilidad > Importar Extracto Bancario"
5. Los datos se procesarán y moverán a `03_Banco_Extractos`

**Notas:**
- Si tu banco usa formato diferente, ajusta las columnas manualmente antes de pegar
- Ejemplo disponible en `templates/bank_sample.csv`

## facturas_import - Hoja Temporal para Importación Facturas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| Fecha | Fecha | Fecha de emisión de la factura |
| Proveedor_Nombre | Texto | Nombre del proveedor |
| Num_Factura | Texto | Número de factura |
| Base_Imponible | Número | Base sin IVA |
| IVA_% | Número | Porcentaje de IVA (21, 10, 4, etc.) |
| Total | Número | Total de la factura (opcional, se calculará si no se da) |
| Forma_Pago | Texto | Transferencia, Efectivo, etc. |
| Días_Vencimiento | Número | Días para calcular fecha vencimiento (30, 60, 90, etc.) |

**Instrucciones:**
1. Prepara tus facturas en formato CSV o Excel
2. Copia las filas de datos
3. Pega en esta hoja
4. Ejecuta "Contabilidad > Importar Facturas"
5. Se crearán registros en `02_Facturas_Recibidas` y asientos en `04_Asientos`

**Notas:**
- El sistema calcula automáticamente: IVA_Importe, Total (si falta), Fecha_Vencimiento
- Genera asientos contables automáticamente
- Ejemplo disponible en `templates/facturas_sample.csv`

## IVA_Report - Informe IVA (generado automáticamente)

Esta hoja se crea automáticamente al ejecutar "Generar Informe IVA" y contiene:

| Sección | Contenido |
|---------|-----------|
| Encabezado | Título del informe y periodo |
| Resumen por tipo | Tabla con: Tipo IVA %, Número Facturas, Base Imponible, Cuota IVA |
| Total | Suma total de todas las bases y cuotas |

**Uso:**
- Compara con los datos de tu gestoría
- Verifica que todos los tipos de IVA estén correctos
- Útil para preparar liquidaciones trimestrales

---

## Consejos de Uso

### Importación de Datos

1. **Preparación de CSV:**
   - Usa codificación UTF-8 para evitar problemas con tildes
   - Asegúrate de que las fechas sean consistentes
   - Verifica que los decimales usen punto o coma de forma uniforme

2. **Validación:**
   - Siempre revisa los datos importados antes de continuar
   - Verifica los asientos generados automáticamente
   - Comprueba que las fechas y importes sean correctos

3. **Conciliación:**
   - Ejecuta la conciliación después de cada importación de banco
   - Revisa las facturas no conciliadas manualmente
   - Ajusta la tolerancia si es necesario en `00_Config`

### Mantenimiento

1. **Backups:**
   - Realiza backups antes de importaciones masivas
   - Guarda backups al final de cada mes/trimestre
   - Configura una carpeta específica en Drive para backups

2. **Auditoría:**
   - Revisa periódicamente la hoja `09_Auditoria`
   - Úsala para rastrear cambios y operaciones

3. **Plan Contable:**
   - Amplía el plan según tus necesidades específicas
   - Mantén la coherencia con tu gestoría
   - Documenta cuentas personalizadas en la columna Descripción

### Solución de Problemas

- **Fechas incorrectas:** Verifica el formato regional de tu Google Sheet (Archivo > Configuración)
- **Importes mal calculados:** Revisa que los CSV usen el separador decimal correcto
- **Conciliación no funciona:** Ajusta la tolerancia o revisa que los importes coincidan exactamente
- **Asientos descuadrados:** Verifica que Debe = Haber en cada grupo de asientos (mismo ID de referencia)
