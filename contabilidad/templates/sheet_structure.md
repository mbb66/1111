# Estructura de Hojas - Sistema de Contabilidad

Esta documentación describe en detalle las columnas, formatos y validaciones de cada hoja del sistema de contabilidad.

---

## 00_Config - Configuración

**Propósito**: Almacenar parámetros de configuración del sistema.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| Parámetro | Texto | Nombre del parámetro de configuración | `Empresa` |
| Valor | Texto/Número | Valor del parámetro | `Taller de Novias` |
| Descripción | Texto | Descripción del parámetro | `Nombre de la empresa` |

**Parámetros predefinidos**:
- `Empresa`: Nombre de la empresa
- `CIF`: CIF/NIF de la empresa
- `Ejercicio`: Año fiscal actual
- `Tolerancia_Conciliacion`: Tolerancia en EUR para conciliación automática (0.5 por defecto)
- `Carpeta_Backup`: ID de carpeta de Drive para backups (opcional)

---

## 01_Proveedores - Registro de Proveedores

**Propósito**: Mantener un catálogo de proveedores.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| ID | Número | Identificador único autogenerado | `1` |
| Nombre | Texto | Nombre o razón social del proveedor | `Textiles García SL` |
| CIF | Texto | CIF/NIF del proveedor | `B12345678` |
| Dirección | Texto | Dirección completa | `Calle Mayor 123, Madrid` |
| Teléfono | Texto | Teléfono de contacto | `912345678` |
| Email | Texto | Email de contacto | `info@textilesgarcia.com` |
| Cuenta_Contable | Texto | Cuenta contable asociada | `400` |
| Notas | Texto | Observaciones adicionales | - |

---

## 02_Facturas_Recibidas - Facturas de Gastos

**Propósito**: Registrar todas las facturas recibidas de proveedores.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| ID | Número | Identificador único autogenerado | `1` |
| Num_Factura | Texto | Número de factura del proveedor | `FAC-001/2024` |
| Proveedor_ID | Número | ID del proveedor (referencia a 01_Proveedores) | `1` |
| Proveedor_Nombre | Texto | Nombre del proveedor | `Textiles García SL` |
| Fecha | Fecha | Fecha de emisión de la factura | `2024-01-15` |
| Fecha_Vencimiento | Fecha | Fecha de vencimiento del pago | `2024-02-14` |
| Base_Imponible | Número | Base imponible sin IVA | `1000.00` |
| Tipo_IVA | Número | Porcentaje de IVA aplicado | `21` |
| Cuota_IVA | Número | Importe de la cuota de IVA (calculado) | `210.00` |
| Total | Número | Total factura (Base + IVA) | `1210.00` |
| Pagada | Texto | Si/No - Si la factura está pagada | `Sí` |
| Fecha_Pago | Fecha | Fecha en que se pagó la factura | `2024-01-20` |
| Conciliada | Texto | Si/No - Si está conciliada con banco | `Sí` |
| Cuenta_Contable | Texto | Cuenta de gasto asociada | `600` |
| Concepto | Texto | Descripción del gasto | `Compra telas y tejidos` |
| Notas | Texto | Observaciones adicionales | - |

**Importación**:
- Utilizar la hoja `facturas_import` para importación masiva
- Formato CSV: `Num_Factura, Proveedor_Nombre, Fecha, Base_Imponible, Tipo_IVA, Concepto`
- El sistema calcula automáticamente: Cuota_IVA, Total, Fecha_Vencimiento

**Asientos generados automáticamente**:
- DEBE: Cuenta 600 (Compras) por la Base_Imponible
- DEBE: Cuenta 472 (IVA Soportado) por la Cuota_IVA
- HABER: Cuenta 400 (Proveedores) por el Total

---

## 03_Banco_Extractos - Movimientos Bancarios

**Propósito**: Registrar todos los movimientos de la cuenta bancaria.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| ID | Número | Identificador único autogenerado | `1` |
| Fecha | Fecha | Fecha del movimiento | `2024-01-15` |
| Concepto | Texto | Descripción del movimiento | `Pago factura proveedor` |
| Importe | Número | Importe (negativo=salida, positivo=entrada) | `-1210.00` |
| Referencia | Texto | Referencia bancaria | `TRF-001-2024` |
| Conciliado | Texto | Si/No - Si está conciliado | `Sí` |
| Factura_ID | Número | ID de factura conciliada (si aplica) | `1` |
| Cuenta_Contable | Texto | Cuenta contable asociada | `572` |
| Notas | Texto | Observaciones adicionales | - |
| Importado_El | Fecha/Hora | Timestamp de la importación | `2024-01-15 10:30:00` |

**Importación**:
- Utilizar la hoja `bank_csv_import` para importación masiva
- Formato CSV: `Fecha, Concepto, Importe, Referencia`
- Los importes negativos indican salidas de dinero (pagos)
- Los importes positivos indican entradas de dinero (cobros)

---

## 04_Asientos - Asientos Contables

**Propósito**: Registrar todos los asientos contables del sistema.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| ID | Número | Identificador único autogenerado | `1` |
| Fecha | Fecha | Fecha del asiento | `2024-01-15` |
| Num_Asiento | Número | Número de asiento (agrupa líneas del mismo asiento) | `1` |
| Cuenta | Texto | Código de cuenta contable | `600` |
| Debe | Número | Importe en el Debe | `1000.00` |
| Haber | Número | Importe en el Haber | `0` |
| Concepto | Texto | Descripción del asiento | `Compra telas FAC-001/2024` |
| Documento_Ref | Texto | Referencia al documento origen | `FAC-1` |
| Origen | Texto | Proceso que generó el asiento | `Importación Facturas` |
| Usuario | Texto | Email del usuario que generó el asiento | `user@example.com` |
| Timestamp | Fecha/Hora | Fecha y hora de creación | `2024-01-15 10:30:00` |

**Validación contable**:
- Cada asiento (mismo Num_Asiento) debe estar cuadrado: Σ(Debe) = Σ(Haber)
- Cada línea tiene importe en Debe o en Haber, nunca en ambos

**Estructura típica de asientos**:

*Factura recibida* (3 líneas, mismo Num_Asiento):
1. DEBE 600 (Compras) - Base
2. DEBE 472 (IVA Soportado) - Cuota
3. HABER 400 (Proveedores) - Total

---

## 05_Plan_Contable - Plan de Cuentas

**Propósito**: Catálogo de cuentas contables disponibles.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| Codigo | Texto | Código de la cuenta | `600` |
| Nombre | Texto | Nombre descriptivo de la cuenta | `Compras de Mercaderías` |
| Tipo | Texto | Clasificación de la cuenta | `Gastos` |
| Descripción | Texto | Descripción detallada | `Compras de productos para venta` |

**Tipos de cuenta**:
- `Activo`: Bienes y derechos de la empresa
- `Pasivo`: Obligaciones y deudas
- `Patrimonio Neto`: Capital y reservas
- `Gastos`: Gastos del ejercicio
- `Ingresos`: Ingresos del ejercicio
- `Existencias`: Mercaderías y materias primas
- `Activo Fijo`: Inmovilizado material

**Personalización**:
- Se puede ampliar el plan contable añadiendo nuevas filas
- Ver `templates/plan_contable.csv` para el plan inicial

---

## 06_Activos_Fijos - Registro de Activos

**Propósito**: Controlar el inmovilizado material y su amortización.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| ID | Número | Identificador único autogenerado | `1` |
| Descripción | Texto | Descripción del activo | `Máquina de coser industrial` |
| Fecha_Adquisicion | Fecha | Fecha de compra | `2024-01-10` |
| Valor_Adquisicion | Número | Precio de compra | `3500.00` |
| Cuenta_Activo | Texto | Cuenta contable del activo | `213` |
| Cuenta_Amortizacion | Texto | Cuenta de amortización acumulada | `281` |
| Vida_Util_Años | Número | Años de vida útil estimada | `10` |
| Amortizado_Acumulado | Número | Amortización acumulada hasta la fecha | `350.00` |
| Notas | Texto | Observaciones adicionales | - |

---

## 07_Nominas - Registro de Nóminas

**Propósito**: Registrar las nóminas del personal.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| ID | Número | Identificador único autogenerado | `1` |
| Empleado | Texto | Nombre del empleado | `María García` |
| Mes | Número | Mes de la nómina (1-12) | `1` |
| Año | Número | Año de la nómina | `2024` |
| Bruto | Número | Salario bruto | `1800.00` |
| SS_Empresa | Número | Cotización Seguridad Social empresa | `540.00` |
| SS_Trabajador | Número | Cotización Seguridad Social trabajador | `108.00` |
| IRPF | Número | Retención IRPF | `180.00` |
| Neto | Número | Salario neto a pagar | `1512.00` |
| Pagada | Texto | Si/No - Si la nómina está pagada | `Sí` |
| Fecha_Pago | Fecha | Fecha de pago | `2024-01-31` |
| Notas | Texto | Observaciones adicionales | - |

---

## 08_Backups - Registro de Copias de Seguridad

**Propósito**: Mantener un historial de los backups realizados.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| ID | Número | Identificador único autogenerado | `1` |
| Fecha | Fecha/Hora | Fecha y hora del backup | `2024-01-31 23:59:00` |
| Nombre_Archivo | Texto | Nombre del archivo de backup | `Backup_Contabilidad_2024-01-31_235900` |
| URL | Texto | URL del archivo en Drive | `https://docs.google.com/...` |
| Tamaño_Hojas | Número | Número de hojas en el backup | `12` |
| Usuario | Texto | Usuario que creó el backup | `user@example.com` |

---

## 09_Auditoria - Log de Acciones

**Propósito**: Registrar todas las operaciones realizadas en el sistema para auditoría.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| ID | Número | Identificador único autogenerado | `1` |
| Timestamp | Fecha/Hora | Fecha y hora de la acción | `2024-01-15 10:30:00` |
| Usuario | Texto | Email del usuario | `user@example.com` |
| Accion | Texto | Tipo de acción realizada | `Importación` |
| Hoja | Texto | Hoja afectada | `Facturas` |
| Detalles | Texto | Descripción detallada | `2 facturas importadas` |
| Resultado | Texto | Resultado de la operación | `OK` |

**Acciones registradas**:
- Creación de hojas
- Importaciones (banco, facturas)
- Conciliaciones
- Generación de informes
- Backups
- Errores del sistema

---

## bank_csv_import - Hoja Temporal para Importación Bancaria

**Propósito**: Hoja auxiliar donde el usuario pega datos CSV del banco antes de importar.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| Fecha | Fecha o Texto | Fecha del movimiento | `2024-01-15` o `15/01/2024` |
| Concepto | Texto | Descripción del movimiento | `Pago factura proveedor` |
| Importe | Número o Texto | Importe (negativo=pago, positivo=cobro) | `-1210.00` o `1210,00` |
| Referencia | Texto | Referencia bancaria | `TRF-001-2024` |

**Instrucciones de uso**:
1. Descargar CSV del banco
2. Copiar filas (sin encabezados)
3. Pegar en esta hoja a partir de la fila 2
4. Ejecutar menú: `🧾 Contabilidad > Importar CSV Bancario`
5. Los datos se procesarán y se añadirán a `03_Banco_Extractos`
6. Limpiar esta hoja después de la importación

**Normalización automática**:
- Fechas: Se convierten al formato interno de Google Sheets
- Importes: Se aceptan comas como separador decimal y se convierten a números
- Referencias vacías se permiten

---

## facturas_import - Hoja Temporal para Importación de Facturas

**Propósito**: Hoja auxiliar donde el usuario pega facturas para importación masiva.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| Num_Factura | Texto | Número de factura | `FAC-001/2024` |
| Proveedor_Nombre | Texto | Nombre del proveedor | `Textiles García SL` |
| Fecha | Fecha o Texto | Fecha de la factura | `2024-01-15` |
| Base_Imponible | Número o Texto | Base sin IVA | `1000.00` o `1000,00` |
| Tipo_IVA | Número o Texto | % de IVA | `21` o `21%` |
| Concepto | Texto | Descripción del gasto | `Compra telas y tejidos` |

**Instrucciones de uso**:
1. Preparar facturas en formato CSV (ver `templates/facturas_sample.csv`)
2. Copiar filas (sin encabezados)
3. Pegar en esta hoja a partir de la fila 2
4. Ejecutar menú: `🧾 Contabilidad > Importar Facturas`
5. El sistema:
   - Calculará automáticamente la cuota de IVA y el total
   - Añadirá las facturas a `02_Facturas_Recibidas`
   - Generará asientos contables en `04_Asientos`
6. Limpiar esta hoja después de la importación

**Cálculos automáticos**:
- `Cuota_IVA = Base_Imponible × (Tipo_IVA / 100)`
- `Total = Base_Imponible + Cuota_IVA`
- `Fecha_Vencimiento = Fecha + 30 días` (por defecto)

---

## Relaciones Entre Hojas

```
01_Proveedores
    ↓ (Proveedor_ID)
02_Facturas_Recibidas ←→ 03_Banco_Extractos
    ↓                    (conciliación)
04_Asientos
    ↑
05_Plan_Contable (Códigos de cuenta)
```

**Flujo de trabajo típico**:
1. Configurar proveedores en `01_Proveedores` (opcional)
2. Importar facturas en `facturas_import` → `02_Facturas_Recibidas` + `04_Asientos`
3. Importar extracto bancario en `bank_csv_import` → `03_Banco_Extractos`
4. Ejecutar conciliación automática
5. Revisar y ajustar conciliaciones manuales
6. Generar informes de IVA cuando sea necesario
7. Realizar backup periódico

---

## Validaciones y Controles

### Validaciones Automáticas
- **IDs únicos**: Los IDs se generan automáticamente y son consecutivos
- **Formato numérico**: Los importes se normalizan (comas → puntos)
- **Fechas**: Se aceptan múltiples formatos y se convierten internamente
- **Asientos cuadrados**: Se recomienda validar que Σ(Debe) = Σ(Haber) por asiento

### Controles Manuales Recomendados
- Revisar movimientos bancarios no conciliados periódicamente
- Verificar facturas pendientes de pago
- Comprobar que los asientos estén cuadrados
- Revisar el log de auditoría para detectar errores

### Indicadores de Estado
- **Conciliado**: `Sí` / `No` - Indica si un movimiento/factura está conciliado
- **Pagada**: `Sí` / `No` - Indica si una factura/nómina está pagada
- **Resultado**: `OK` / `Error` - Resultado de operaciones en auditoría

---

## Personalización

El sistema permite personalización en varios niveles:

1. **Plan contable**: Añadir cuentas específicas en `05_Plan_Contable`
2. **Parámetros**: Ajustar configuración en `00_Config`
3. **Código**: Modificar `Code.gs` para cambiar lógica de negocio
4. **Validaciones**: Añadir validaciones de datos en celdas

---

## Mantenimiento

### Tareas Periódicas
- **Diaria**: Importar movimientos bancarios
- **Semanal**: Importar facturas recibidas
- **Mensual**: 
  - Conciliar banco con facturas
  - Revisar facturas pendientes
  - Crear backup
- **Trimestral**: 
  - Generar informe IVA
  - Revisar asientos y plan contable

### Limpieza
- Limpiar hojas de importación (`bank_csv_import`, `facturas_import`) después de cada uso
- Mantener backups de al menos 12 meses
- Revisar y archivar datos de años anteriores

---

## Formatos de Fecha Aceptados

El sistema acepta fechas en varios formatos:
- ISO: `2024-01-15`
- Europeo: `15/01/2024`
- Objeto Date de Google Sheets

Se recomienda usar formato ISO (YYYY-MM-DD) para mayor consistencia.

---

## Formatos Numéricos

El sistema normaliza automáticamente:
- Coma como separador decimal: `1.234,56` → `1234.56`
- Punto como separador decimal: `1,234.56` → `1234.56`
- Espacios: `1 234,56` → `1234.56`

Se recomienda usar punto como separador decimal y sin separadores de miles.

---

*Última actualización: 2024-12-29*
