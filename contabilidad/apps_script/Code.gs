/**
 * Sistema de Contabilidad para Taller
 * Google Apps Script para gestión contable básica
 * 
 * Funcionalidades:
 * - Gestión de facturas recibidas
 * - Importación de extractos bancarios
 * - Conciliación banco-facturas
 * - Generación de informes IVA
 * - Backups automáticos
 */

// ============================================================================
// MENÚ PERSONALIZADO Y CONFIGURACIÓN INICIAL
// ============================================================================

/**
 * Crea el menú personalizado al abrir la hoja
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🧾 Contabilidad')
    .addItem('Crear Hojas de Plantilla', 'createTemplateSheets')
    .addSeparator()
    .addItem('Importar CSV Bancario', 'importBankCSVFromSheet')
    .addItem('Importar Facturas', 'importFacturasFromSheet')
    .addSeparator()
    .addItem('Conciliar Banco con Facturas', 'reconcileBankWithInvoices')
    .addItem('Generar Informe IVA', 'promptGenerateIVAReport')
    .addSeparator()
    .addItem('Crear Backup en Drive', 'backupToDrive')
    .addToUi();
}

/**
 * Crea todas las hojas de trabajo necesarias con sus encabezados
 */
function createTemplateSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Definición de hojas con sus encabezados
  const sheets = [
    {
      name: '00_Config',
      headers: ['Parámetro', 'Valor', 'Descripción'],
      data: [
        ['Empresa', 'Taller de Novias', 'Nombre de la empresa'],
        ['CIF', '', 'CIF/NIF de la empresa'],
        ['Ejercicio', new Date().getFullYear().toString(), 'Año fiscal actual'],
        ['Tolerancia_Conciliacion', '0.5', 'Tolerancia en EUR para conciliación automática'],
        ['Carpeta_Backup', '', 'ID de carpeta de Drive para backups (opcional)']
      ]
    },
    {
      name: '01_Proveedores',
      headers: ['ID', 'Nombre', 'CIF', 'Dirección', 'Teléfono', 'Email', 'Cuenta_Contable', 'Notas']
    },
    {
      name: '02_Facturas_Recibidas',
      headers: ['ID', 'Num_Factura', 'Proveedor_ID', 'Proveedor_Nombre', 'Fecha', 'Fecha_Vencimiento', 
                'Base_Imponible', 'Tipo_IVA', 'Cuota_IVA', 'Total', 'Pagada', 'Fecha_Pago', 
                'Conciliada', 'Cuenta_Contable', 'Concepto', 'Notas']
    },
    {
      name: '03_Banco_Extractos',
      headers: ['ID', 'Fecha', 'Concepto', 'Importe', 'Referencia', 'Conciliado', 
                'Factura_ID', 'Cuenta_Contable', 'Notas', 'Importado_El']
    },
    {
      name: '04_Asientos',
      headers: ['ID', 'Fecha', 'Num_Asiento', 'Cuenta', 'Debe', 'Haber', 'Concepto', 
                'Documento_Ref', 'Origen', 'Usuario', 'Timestamp']
    },
    {
      name: '05_Plan_Contable',
      headers: ['Codigo', 'Nombre', 'Tipo', 'Descripción']
    },
    {
      name: '06_Activos_Fijos',
      headers: ['ID', 'Descripción', 'Fecha_Adquisicion', 'Valor_Adquisicion', 
                'Cuenta_Activo', 'Cuenta_Amortizacion', 'Vida_Util_Años', 'Amortizado_Acumulado', 'Notas']
    },
    {
      name: '07_Nominas',
      headers: ['ID', 'Empleado', 'Mes', 'Año', 'Bruto', 'SS_Empresa', 'SS_Trabajador', 
                'IRPF', 'Neto', 'Pagada', 'Fecha_Pago', 'Notas']
    },
    {
      name: '08_Backups',
      headers: ['ID', 'Fecha', 'Nombre_Archivo', 'URL', 'Tamaño_Hojas', 'Usuario']
    },
    {
      name: '09_Auditoria',
      headers: ['ID', 'Timestamp', 'Usuario', 'Accion', 'Hoja', 'Detalles', 'Resultado']
    },
    {
      name: 'bank_csv_import',
      headers: ['Fecha', 'Concepto', 'Importe', 'Referencia'],
      note: 'Hoja temporal para pegar CSV bancario antes de importar'
    },
    {
      name: 'facturas_import',
      headers: ['Num_Factura', 'Proveedor_Nombre', 'Fecha', 'Base_Imponible', 'Tipo_IVA', 'Concepto'],
      note: 'Hoja temporal para pegar facturas antes de importar'
    }
  ];
  
  // Crear cada hoja si no existe
  sheets.forEach(sheetDef => {
    let sheet = ss.getSheetByName(sheetDef.name);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetDef.name);
      
      // Añadir encabezados
      if (sheetDef.headers) {
        sheet.getRange(1, 1, 1, sheetDef.headers.length)
          .setValues([sheetDef.headers])
          .setFontWeight('bold')
          .setBackground('#f3f3f3');
      }
      
      // Añadir datos iniciales si existen
      if (sheetDef.data) {
        sheet.getRange(2, 1, sheetDef.data.length, sheetDef.data[0].length)
          .setValues(sheetDef.data);
      }
      
      // Añadir nota si existe
      if (sheetDef.note) {
        sheet.getRange('A2').setNote(sheetDef.note);
      }
      
      // Autoajustar columnas
      sheet.autoResizeColumns(1, sheetDef.headers.length);
      
      // Congelar fila de encabezados
      sheet.setFrozenRows(1);
    }
  });
  
  SpreadsheetApp.getUi().alert('✅ Hojas de plantilla creadas correctamente.');
  logAudit('Sistema', 'Crear Hojas', 'createTemplateSheets ejecutado');
}

// ============================================================================
// IMPORTACIÓN DE EXTRACTOS BANCARIOS
// ============================================================================

/**
 * Importa CSV bancario desde la hoja 'bank_csv_import'
 * Formato esperado: Fecha | Concepto | Importe | Referencia
 */
function importBankCSVFromSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const importSheet = ss.getSheetByName('bank_csv_import');
  const bankSheet = ss.getSheetByName('03_Banco_Extractos');
  
  if (!importSheet) {
    SpreadsheetApp.getUi().alert('❌ Error: No se encuentra la hoja "bank_csv_import"');
    return;
  }
  
  if (!bankSheet) {
    SpreadsheetApp.getUi().alert('❌ Error: No se encuentra la hoja "03_Banco_Extractos"');
    return;
  }
  
  // Obtener datos de la hoja de importación (desde fila 2)
  const lastRow = importSheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('⚠️ No hay datos para importar en "bank_csv_import"');
    return;
  }
  
  const data = importSheet.getRange(2, 1, lastRow - 1, 4).getValues();
  const importedRows = [];
  let importCount = 0;
  
  // Procesar cada fila
  data.forEach(row => {
    const [fecha, concepto, importe, referencia] = row;
    
    // Saltar filas vacías
    if (!fecha && !concepto && !importe) return;
    
    // Obtener siguiente ID
    const nextId = findNextId(bankSheet);
    
    // Normalizar fecha
    let fechaNormalizada = fecha;
    if (fecha instanceof Date) {
      fechaNormalizada = fecha;
    } else if (typeof fecha === 'string' && fecha.trim()) {
      fechaNormalizada = new Date(fecha);
    }
    
    // Normalizar importe
    const importeNum = normalizeNumber(importe);
    
    // Preparar fila para insertar
    importedRows.push([
      nextId,                          // ID
      fechaNormalizada,                // Fecha
      concepto || '',                  // Concepto
      importeNum,                      // Importe
      referencia || '',                // Referencia
      'No',                            // Conciliado
      '',                              // Factura_ID
      '',                              // Cuenta_Contable
      '',                              // Notas
      new Date()                       // Importado_El
    ]);
    
    importCount++;
  });
  
  // Insertar todas las filas en 03_Banco_Extractos
  if (importedRows.length > 0) {
    const lastBankRow = bankSheet.getLastRow();
    bankSheet.getRange(lastBankRow + 1, 1, importedRows.length, 10).setValues(importedRows);
    
    logAudit('Importación', 'Banco CSV', `${importCount} movimientos importados`);
    SpreadsheetApp.getUi().alert(`✅ Se importaron ${importCount} movimientos bancarios correctamente.`);
  } else {
    SpreadsheetApp.getUi().alert('⚠️ No se encontraron datos válidos para importar.');
  }
}

// ============================================================================
// IMPORTACIÓN DE FACTURAS
// ============================================================================

/**
 * Importa facturas desde la hoja 'facturas_import' y genera asientos
 * Formato esperado: Num_Factura | Proveedor_Nombre | Fecha | Base_Imponible | Tipo_IVA | Concepto
 */
function importFacturasFromSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const importSheet = ss.getSheetByName('facturas_import');
  const facturasSheet = ss.getSheetByName('02_Facturas_Recibidas');
  const asientosSheet = ss.getSheetByName('04_Asientos');
  
  if (!importSheet || !facturasSheet || !asientosSheet) {
    SpreadsheetApp.getUi().alert('❌ Error: No se encuentran las hojas necesarias');
    return;
  }
  
  // Obtener datos de la hoja de importación
  const lastRow = importSheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('⚠️ No hay datos para importar en "facturas_import"');
    return;
  }
  
  const data = importSheet.getRange(2, 1, lastRow - 1, 6).getValues();
  let importCount = 0;
  
  // Procesar cada factura
  data.forEach(row => {
    const [numFactura, proveedorNombre, fecha, baseImponible, tipoIVA, concepto] = row;
    
    // Saltar filas vacías
    if (!numFactura && !proveedorNombre) return;
    
    // Obtener siguiente ID para factura
    const facturaId = findNextId(facturasSheet);
    
    // Normalizar datos
    let fechaNormalizada = fecha instanceof Date ? fecha : new Date(fecha);
    const baseNum = normalizeNumber(baseImponible);
    const ivaNum = normalizeNumber(tipoIVA);
    const cuotaIVA = baseNum * (ivaNum / 100);
    const total = baseNum + cuotaIVA;
    
    // Calcular fecha de vencimiento (30 días por defecto)
    const fechaVencimiento = new Date(fechaNormalizada);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
    
    // Insertar factura en 02_Facturas_Recibidas
    const facturaRow = [
      facturaId,                       // ID
      numFactura,                      // Num_Factura
      '',                              // Proveedor_ID
      proveedorNombre,                 // Proveedor_Nombre
      fechaNormalizada,                // Fecha
      fechaVencimiento,                // Fecha_Vencimiento
      baseNum,                         // Base_Imponible
      ivaNum,                          // Tipo_IVA
      cuotaIVA,                        // Cuota_IVA
      total,                           // Total
      'No',                            // Pagada
      '',                              // Fecha_Pago
      'No',                            // Conciliada
      '600',                           // Cuenta_Contable (Compras por defecto)
      concepto || '',                  // Concepto
      ''                               // Notas
    ];
    
    const lastFacturaRow = facturasSheet.getLastRow();
    facturasSheet.getRange(lastFacturaRow + 1, 1, 1, 16).setValues([facturaRow]);
    
    // Generar asiento contable
    generateInvoiceEntry(asientosSheet, facturaId, numFactura, fechaNormalizada, baseNum, cuotaIVA, total, concepto);
    
    importCount++;
  });
  
  if (importCount > 0) {
    logAudit('Importación', 'Facturas', `${importCount} facturas importadas con asientos`);
    SpreadsheetApp.getUi().alert(`✅ Se importaron ${importCount} facturas y se generaron sus asientos.`);
  } else {
    SpreadsheetApp.getUi().alert('⚠️ No se encontraron datos válidos para importar.');
  }
}

/**
 * Genera asiento contable para una factura
 */
function generateInvoiceEntry(asientosSheet, facturaId, numFactura, fecha, base, cuotaIVA, total, concepto) {
  const numAsiento = findNextId(asientosSheet);
  const timestamp = new Date();
  const usuario = Session.getActiveUser().getEmail();
  
  // Asiento: 
  // DEBE: 600 Compras (base) + 472 IVA soportado (cuota)
  // HABER: 400 Proveedores (total)
  
  const asientos = [
    // Línea 1: Compras (DEBE)
    [
      numAsiento,                      // ID
      fecha,                           // Fecha
      numAsiento,                      // Num_Asiento
      '600',                           // Cuenta (Compras)
      base,                            // Debe
      0,                               // Haber
      concepto || `Factura ${numFactura}`, // Concepto
      `FAC-${facturaId}`,              // Documento_Ref
      'Importación Facturas',          // Origen
      usuario,                         // Usuario
      timestamp                        // Timestamp
    ],
    // Línea 2: IVA Soportado (DEBE)
    [
      numAsiento + 1,
      fecha,
      numAsiento,
      '472',                           // Cuenta (IVA Soportado)
      cuotaIVA,                        // Debe
      0,                               // Haber
      `IVA ${concepto || numFactura}`,
      `FAC-${facturaId}`,
      'Importación Facturas',
      usuario,
      timestamp
    ],
    // Línea 3: Proveedores (HABER)
    [
      numAsiento + 2,
      fecha,
      numAsiento,
      '400',                           // Cuenta (Proveedores)
      0,                               // Debe
      total,                           // Haber
      concepto || `Factura ${numFactura}`,
      `FAC-${facturaId}`,
      'Importación Facturas',
      usuario,
      timestamp
    ]
  ];
  
  const lastAsientoRow = asientosSheet.getLastRow();
  asientosSheet.getRange(lastAsientoRow + 1, 1, 3, 11).setValues(asientos);
}

// ============================================================================
// CONCILIACIÓN BANCO-FACTURAS
// ============================================================================

/**
 * Concilia movimientos bancarios con facturas por coincidencia de importe
 */
function reconcileBankWithInvoices() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const bankSheet = ss.getSheetByName('03_Banco_Extractos');
  const facturasSheet = ss.getSheetByName('02_Facturas_Recibidas');
  const configSheet = ss.getSheetByName('00_Config');
  
  if (!bankSheet || !facturasSheet) {
    SpreadsheetApp.getUi().alert('❌ Error: No se encuentran las hojas necesarias');
    return;
  }
  
  // Obtener tolerancia de configuración
  let tolerance = 0.5;
  if (configSheet) {
    const configData = configSheet.getRange(2, 1, configSheet.getLastRow() - 1, 2).getValues();
    const toleranceRow = configData.find(row => row[0] === 'Tolerancia_Conciliacion');
    if (toleranceRow) {
      tolerance = parseFloat(toleranceRow[1]) || 0.5;
    }
  }
  
  // Obtener movimientos bancarios no conciliados
  const bankLastRow = bankSheet.getLastRow();
  if (bankLastRow < 2) {
    SpreadsheetApp.getUi().alert('⚠️ No hay movimientos bancarios para conciliar');
    return;
  }
  
  const bankData = bankSheet.getRange(2, 1, bankLastRow - 1, 10).getValues();
  
  // Obtener facturas no conciliadas
  const facturasLastRow = facturasSheet.getLastRow();
  if (facturasLastRow < 2) {
    SpreadsheetApp.getUi().alert('⚠️ No hay facturas para conciliar');
    return;
  }
  
  const facturasData = facturasSheet.getRange(2, 1, facturasLastRow - 1, 16).getValues();
  
  let conciliacionesRealizadas = 0;
  
  // Buscar coincidencias
  bankData.forEach((bankRow, bankIdx) => {
    const [id, fecha, concepto, importe, referencia, conciliado, facturaId] = bankRow;
    
    // Saltar si ya está conciliado
    if (conciliado === 'Sí' || conciliado === 'Si') return;
    
    // Buscar facturas con importe similar (negativos para pagos)
    const importeAbs = Math.abs(normalizeNumber(importe));
    
    facturasData.forEach((facturaRow, facturaIdx) => {
      const [fId, numFactura, provId, provNombre, fFecha, fVencimiento, 
             base, tipoIVA, cuotaIVA, total, pagada, fechaPago, fConciliada] = facturaRow;
      
      // Saltar si ya está conciliada
      if (fConciliada === 'Sí' || fConciliada === 'Si') return;
      
      const totalFactura = normalizeNumber(total);
      
      // Verificar si el importe coincide (con tolerancia)
      if (Math.abs(importeAbs - totalFactura) <= tolerance) {
        // Marcar banco como conciliado
        bankSheet.getRange(bankIdx + 2, 6).setValue('Sí');  // Conciliado
        bankSheet.getRange(bankIdx + 2, 7).setValue(fId);    // Factura_ID
        
        // Marcar factura como conciliada y pagada
        facturasSheet.getRange(facturaIdx + 2, 11).setValue('Sí');  // Pagada
        facturasSheet.getRange(facturaIdx + 2, 12).setValue(fecha); // Fecha_Pago
        facturasSheet.getRange(facturaIdx + 2, 13).setValue('Sí');  // Conciliada
        
        conciliacionesRealizadas++;
      }
    });
  });
  
  if (conciliacionesRealizadas > 0) {
    logAudit('Conciliación', 'Banco-Facturas', `${conciliacionesRealizadas} conciliaciones realizadas`);
    SpreadsheetApp.getUi().alert(`✅ Se realizaron ${conciliacionesRealizadas} conciliaciones automáticas.`);
  } else {
    SpreadsheetApp.getUi().alert('⚠️ No se encontraron coincidencias para conciliar automáticamente.');
  }
}

// ============================================================================
// GENERACIÓN DE INFORMES IVA
// ============================================================================

/**
 * Solicita fechas y genera informe IVA
 */
function promptGenerateIVAReport() {
  const ui = SpreadsheetApp.getUi();
  
  // Solicitar fecha de inicio
  const startResponse = ui.prompt(
    'Generar Informe IVA',
    'Introduce la fecha de inicio del periodo (YYYY-MM-DD):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (startResponse.getSelectedButton() !== ui.Button.OK) return;
  const periodStart = startResponse.getResponseText();
  
  // Solicitar fecha de fin
  const endResponse = ui.prompt(
    'Generar Informe IVA',
    'Introduce la fecha de fin del periodo (YYYY-MM-DD):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (endResponse.getSelectedButton() !== ui.Button.OK) return;
  const periodEnd = endResponse.getResponseText();
  
  // Validar fechas
  const startDate = new Date(periodStart);
  const endDate = new Date(periodEnd);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    ui.alert('❌ Error: Fechas inválidas. Usa formato YYYY-MM-DD');
    return;
  }
  
  generateIVAReport(periodStart, periodEnd);
}

/**
 * Genera informe de IVA soportado para un periodo
 */
function generateIVAReport(periodStart, periodEnd) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const facturasSheet = ss.getSheetByName('02_Facturas_Recibidas');
  
  if (!facturasSheet) {
    SpreadsheetApp.getUi().alert('❌ Error: No se encuentra la hoja "02_Facturas_Recibidas"');
    return;
  }
  
  const startDate = new Date(periodStart);
  const endDate = new Date(periodEnd);
  
  // Obtener facturas del periodo
  const lastRow = facturasSheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('⚠️ No hay facturas para generar el informe');
    return;
  }
  
  const data = facturasSheet.getRange(2, 1, lastRow - 1, 16).getValues();
  
  // Agrupar por tipo de IVA
  const ivaGroups = {};
  let totalBase = 0;
  let totalCuota = 0;
  
  data.forEach(row => {
    const [id, numFactura, provId, provNombre, fecha, fechaVenc, 
           base, tipoIVA, cuotaIVA, total] = row;
    
    const facturaDate = new Date(fecha);
    
    // Verificar si está en el periodo
    if (facturaDate >= startDate && facturaDate <= endDate) {
      const baseNum = normalizeNumber(base);
      const cuotaNum = normalizeNumber(cuotaIVA);
      const tipoNum = normalizeNumber(tipoIVA);
      
      if (!ivaGroups[tipoNum]) {
        ivaGroups[tipoNum] = { base: 0, cuota: 0, count: 0 };
      }
      
      ivaGroups[tipoNum].base += baseNum;
      ivaGroups[tipoNum].cuota += cuotaNum;
      ivaGroups[tipoNum].count++;
      
      totalBase += baseNum;
      totalCuota += cuotaNum;
    }
  });
  
  // Crear hoja de informe
  let reportSheet = ss.getSheetByName('IVA_Report');
  if (reportSheet) {
    ss.deleteSheet(reportSheet);
  }
  reportSheet = ss.insertSheet('IVA_Report');
  
  // Encabezado del informe
  const headers = [
    ['INFORME DE IVA SOPORTADO'],
    [`Periodo: ${periodStart} a ${periodEnd}`],
    [''],
    ['Tipo IVA (%)', 'Base Imponible', 'Cuota IVA', 'Nº Facturas']
  ];
  
  reportSheet.getRange(1, 1, headers.length, 4).setValues(headers);
  reportSheet.getRange(1, 1).setFontSize(14).setFontWeight('bold');
  reportSheet.getRange(4, 1, 1, 4).setFontWeight('bold').setBackground('#f3f3f3');
  
  // Datos agrupados
  let rowNum = 5;
  Object.keys(ivaGroups).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach(tipo => {
    const grupo = ivaGroups[tipo];
    reportSheet.getRange(rowNum, 1, 1, 4).setValues([[
      `${tipo}%`,
      grupo.base.toFixed(2),
      grupo.cuota.toFixed(2),
      grupo.count
    ]]);
    rowNum++;
  });
  
  // Totales
  reportSheet.getRange(rowNum, 1, 1, 4).setValues([[
    'TOTAL',
    totalBase.toFixed(2),
    totalCuota.toFixed(2),
    ''
  ]]).setFontWeight('bold').setBackground('#e8f5e9');
  
  // Formato
  reportSheet.autoResizeColumns(1, 4);
  reportSheet.setFrozenRows(4);
  
  logAudit('Informes', 'IVA Report', `Periodo ${periodStart} a ${periodEnd}`);
  SpreadsheetApp.getUi().alert(`✅ Informe de IVA generado en la hoja "IVA_Report".\n\nTotal Base: ${totalBase.toFixed(2)} €\nTotal Cuota: ${totalCuota.toFixed(2)} €`);
}

// ============================================================================
// BACKUPS
// ============================================================================

/**
 * Crea una copia de seguridad del spreadsheet en Drive
 */
function backupToDrive() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const backupsSheet = ss.getSheetByName('08_Backups');
  
  // Generar nombre con timestamp
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss');
  const backupName = `Backup_Contabilidad_${timestamp}`;
  
  try {
    // Crear copia
    const file = DriveApp.getFileById(ss.getId());
    const backup = file.makeCopy(backupName);
    
    // Registrar en hoja de backups
    if (backupsSheet) {
      const nextId = findNextId(backupsSheet);
      const numSheets = ss.getSheets().length;
      const usuario = Session.getActiveUser().getEmail();
      
      const backupRow = [
        nextId,
        new Date(),
        backupName,
        backup.getUrl(),
        numSheets,
        usuario
      ];
      
      const lastRow = backupsSheet.getLastRow();
      backupsSheet.getRange(lastRow + 1, 1, 1, 6).setValues([backupRow]);
    }
    
    logAudit('Backup', 'Drive', `Backup creado: ${backupName}`);
    SpreadsheetApp.getUi().alert(`✅ Backup creado correctamente:\n\n${backupName}\n\nURL: ${backup.getUrl()}`);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(`❌ Error al crear backup: ${error.message}`);
    logAudit('Backup', 'Drive', `Error: ${error.message}`, 'Error');
  }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Normaliza un valor numérico (convierte strings, maneja comas, etc.)
 */
function normalizeNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Reemplazar comas por puntos y eliminar espacios
    const cleaned = value.replace(/,/g, '.').replace(/\s/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * Encuentra el siguiente ID disponible en una hoja
 */
function findNextId(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 1;
  
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let maxId = 0;
  
  ids.forEach(row => {
    const id = parseInt(row[0]);
    if (!isNaN(id) && id > maxId) {
      maxId = id;
    }
  });
  
  return maxId + 1;
}

/**
 * Registra una acción en la hoja de auditoría
 */
function logAudit(accion, hoja, detalles, resultado = 'OK') {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const auditSheet = ss.getSheetByName('09_Auditoria');
  
  if (!auditSheet) return;
  
  const nextId = findNextId(auditSheet);
  const usuario = Session.getActiveUser().getEmail() || 'Sistema';
  
  const auditRow = [
    nextId,
    new Date(),
    usuario,
    accion,
    hoja,
    detalles,
    resultado
  ];
  
  const lastRow = auditSheet.getLastRow();
  auditSheet.getRange(lastRow + 1, 1, 1, 7).setValues([auditRow]);
}
