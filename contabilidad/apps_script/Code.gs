/**
 * Sistema de Contabilidad para Taller
 * Google Apps Script para gestión contable básica
 * 
 * Funcionalidades:
 * - Creación de plantilla de hojas de cálculo
 * - Importación de extractos bancarios desde CSV
 * - Registro de facturas recibidas
 * - Conciliación bancaria básica
 * - Generación de informes IVA trimestrales
 * - Backups automáticos a Drive
 */

// ========================================
// MENÚ PERSONALIZADO
// ========================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Contabilidad')
    .addItem('1. Crear Hojas de Plantilla', 'createTemplateSheets')
    .addSeparator()
    .addItem('2. Importar Extracto Bancario', 'importBankCSVFromSheet')
    .addItem('3. Importar Facturas', 'importFacturasFromSheet')
    .addSeparator()
    .addItem('4. Conciliar Banco/Facturas', 'reconcileBankWithInvoices')
    .addItem('5. Generar Informe IVA', 'generateIVAReportPrompt')
    .addSeparator()
    .addItem('6. Backup a Drive', 'backupToDrive')
    .addToUi();
}

// ========================================
// CREACIÓN DE PLANTILLA
// ========================================

function createTemplateSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Definición de hojas y sus encabezados
  const sheets = [
    {
      name: '00_Config',
      headers: ['Parámetro', 'Valor', 'Descripción'],
      data: [
        ['empresa_nombre', 'Mi Taller', 'Nombre de la empresa'],
        ['empresa_cif', '', 'CIF/NIF de la empresa'],
        ['ejercicio_fiscal', new Date().getFullYear(), 'Año fiscal actual'],
        ['tolerancia_conciliacion', 0.5, 'Tolerancia en EUR para conciliación'],
        ['backup_folder_id', '', 'ID de carpeta Drive para backups']
      ]
    },
    {
      name: '01_Proveedores',
      headers: ['ID', 'Nombre', 'CIF', 'Dirección', 'Teléfono', 'Email', 'Forma_Pago', 'Días_Pago', 'Activo', 'Notas']
    },
    {
      name: '02_Facturas_Recibidas',
      headers: ['ID', 'Fecha', 'Proveedor_ID', 'Proveedor_Nombre', 'Num_Factura', 'Base_Imponible', 'IVA_%', 'IVA_Importe', 'Total', 'Forma_Pago', 'Fecha_Vencimiento', 'Pagada', 'Fecha_Pago', 'Conciliada', 'Notas']
    },
    {
      name: '03_Banco_Extractos',
      headers: ['ID', 'Fecha', 'Fecha_Valor', 'Descripción', 'Importe', 'Saldo', 'Tipo', 'Conciliado', 'Factura_ID', 'Notas']
    },
    {
      name: '04_Asientos',
      headers: ['ID', 'Fecha', 'Tipo', 'Referencia', 'Cuenta', 'Debe', 'Haber', 'Descripción']
    },
    {
      name: '05_Plan_Contable',
      headers: ['Código', 'Nombre', 'Tipo', 'Descripción']
    },
    {
      name: '06_Activos_Fijos',
      headers: ['ID', 'Fecha_Adquisición', 'Descripción', 'Valor_Adquisición', 'Vida_Útil_Años', 'Amortización_Anual', 'Amortización_Acumulada', 'Valor_Neto', 'Cuenta_Activo', 'Cuenta_Amortización']
    },
    {
      name: '07_Nominas',
      headers: ['ID', 'Fecha', 'Empleado', 'Salario_Bruto', 'SS_Empresa', 'SS_Trabajador', 'IRPF', 'Salario_Neto', 'Pagada', 'Notas']
    },
    {
      name: '08_Backups',
      headers: ['Fecha', 'Nombre_Archivo', 'URL', 'Notas']
    },
    {
      name: '09_Auditoria',
      headers: ['Timestamp', 'Usuario', 'Acción', 'Hoja', 'Detalles']
    },
    {
      name: 'bank_csv_import',
      headers: ['Fecha', 'Fecha_Valor', 'Descripción', 'Importe', 'Saldo'],
      note: 'Pegar aquí los datos del CSV bancario (sin encabezados, o con encabezados en fila 1)'
    },
    {
      name: 'facturas_import',
      headers: ['Fecha', 'Proveedor_Nombre', 'Num_Factura', 'Base_Imponible', 'IVA_%', 'Total', 'Forma_Pago', 'Días_Vencimiento'],
      note: 'Pegar aquí los datos de facturas para importar'
    }
  ];
  
  sheets.forEach(sheetDef => {
    let sheet = ss.getSheetByName(sheetDef.name);
    if (!sheet) {
      sheet = ss.insertSheet(sheetDef.name);
    }
    
    // Añadir encabezados
    if (sheetDef.headers) {
      sheet.getRange(1, 1, 1, sheetDef.headers.length).setValues([sheetDef.headers]);
      sheet.getRange(1, 1, 1, sheetDef.headers.length).setFontWeight('bold').setBackground('#E8EAED');
      sheet.setFrozenRows(1);
    }
    
    // Añadir datos iniciales si existen
    if (sheetDef.data && sheetDef.data.length > 0) {
      sheet.getRange(2, 1, sheetDef.data.length, sheetDef.data[0].length).setValues(sheetDef.data);
    }
    
    // Añadir nota si existe
    if (sheetDef.note) {
      sheet.getRange('A2').setNote(sheetDef.note);
    }
  });
  
  // Cargar plan contable si existe
  loadPlanContable();
  
  logAudit('Sistema', 'Plantilla creada', 'Sistema', 'Hojas iniciales creadas');
  SpreadsheetApp.getUi().alert('Plantilla creada correctamente.\n\nSiguientes pasos:\n1. Configurar parámetros en 00_Config\n2. Importar plan contable si no está cargado\n3. Registrar proveedores en 01_Proveedores');
}

function loadPlanContable() {
  // Si hay un plan contable básico predefinido, cargarlo
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('05_Plan_Contable');
  
  // Solo cargar si está vacío (sin datos más allá de encabezados)
  if (sheet.getLastRow() <= 1) {
    const planBasico = [
      ['100', 'Capital Social', 'Patrimonio Neto', 'Capital de la empresa'],
      ['129', 'Resultado del Ejercicio', 'Patrimonio Neto', 'Beneficio o pérdida del año'],
      ['170', 'Deudas a Largo Plazo', 'Pasivo No Corriente', 'Préstamos a más de un año'],
      ['400', 'Proveedores', 'Pasivo Corriente', 'Deudas con proveedores'],
      ['410', 'Acreedores', 'Pasivo Corriente', 'Otras deudas a corto plazo'],
      ['430', 'Clientes', 'Activo Corriente', 'Deudas de clientes'],
      ['472', 'HP IVA Soportado', 'Activo Corriente', 'IVA en compras'],
      ['477', 'HP IVA Repercutido', 'Pasivo Corriente', 'IVA en ventas'],
      ['520', 'Deudas a Corto Plazo', 'Pasivo Corriente', 'Préstamos a menos de un año'],
      ['572', 'Banco c/c', 'Activo Corriente', 'Cuenta corriente bancaria'],
      ['600', 'Compras', 'Gasto', 'Compras de mercaderías'],
      ['621', 'Arrendamientos', 'Gasto', 'Alquiler local'],
      ['622', 'Reparaciones', 'Gasto', 'Reparaciones y conservación'],
      ['623', 'Servicios Profesionales', 'Gasto', 'Gestoría, abogados, etc'],
      ['624', 'Transportes', 'Gasto', 'Gastos de transporte'],
      ['625', 'Primas de Seguros', 'Gasto', 'Seguros varios'],
      ['626', 'Servicios Bancarios', 'Gasto', 'Comisiones bancarias'],
      ['627', 'Publicidad', 'Gasto', 'Marketing y publicidad'],
      ['628', 'Suministros', 'Gasto', 'Luz, agua, gas, teléfono'],
      ['629', 'Otros Servicios', 'Gasto', 'Otros gastos de explotación'],
      ['640', 'Sueldos y Salarios', 'Gasto', 'Nóminas personal'],
      ['642', 'Seguridad Social', 'Gasto', 'Cotizaciones SS empresa'],
      ['700', 'Ventas', 'Ingreso', 'Ventas de productos/servicios'],
      ['705', 'Prestaciones de Servicios', 'Ingreso', 'Ingresos por servicios'],
      ['759', 'Ingresos Diversos', 'Ingreso', 'Otros ingresos']
    ];
    
    sheet.getRange(2, 1, planBasico.length, 4).setValues(planBasico);
  }
}

// ========================================
// IMPORTACIÓN EXTRACTO BANCARIO
// ========================================

function importBankCSVFromSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const importSheet = ss.getSheetByName('bank_csv_import');
  const targetSheet = ss.getSheetByName('03_Banco_Extractos');
  
  if (!importSheet || !targetSheet) {
    SpreadsheetApp.getUi().alert('Error: Hojas necesarias no encontradas');
    return;
  }
  
  const lastRow = importSheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('No hay datos para importar en bank_csv_import');
    return;
  }
  
  // Leer datos (asumiendo que fila 1 son encabezados o primera fila de datos)
  const startRow = importSheet.getRange('A1').getValue().toString().toLowerCase().includes('fecha') ? 2 : 1;
  const dataRange = importSheet.getRange(startRow, 1, lastRow - startRow + 1, 5);
  const data = dataRange.getValues();
  
  const newRecords = [];
  const nextId = findNextId(targetSheet);
  
  data.forEach((row, idx) => {
    const [fecha, fechaValor, descripcion, importe, saldo] = row;
    
    // Validar que hay datos
    if (!fecha && !importe) return;
    
    const parsedFecha = parseDate(fecha);
    const parsedFechaValor = parseDate(fechaValor) || parsedFecha;
    const parsedImporte = normalizeNumber(importe);
    const parsedSaldo = normalizeNumber(saldo);
    
    // Determinar tipo (Ingreso/Gasto)
    const tipo = parsedImporte >= 0 ? 'Ingreso' : 'Gasto';
    
    newRecords.push([
      nextId + idx,
      parsedFecha,
      parsedFechaValor,
      descripcion || '',
      parsedImporte,
      parsedSaldo,
      tipo,
      false, // No conciliado
      '', // Factura_ID vacío
      '' // Notas
    ]);
  });
  
  if (newRecords.length === 0) {
    SpreadsheetApp.getUi().alert('No se encontraron registros válidos para importar');
    return;
  }
  
  // Insertar en hoja destino
  const targetLastRow = targetSheet.getLastRow();
  targetSheet.getRange(targetLastRow + 1, 1, newRecords.length, newRecords[0].length).setValues(newRecords);
  
  // Limpiar hoja de importación (opcional, dejar comentado para que usuario revise)
  // importSheet.getRange(startRow, 1, data.length, 5).clearContent();
  
  logAudit(Session.getActiveUser().getEmail(), 'Importar Banco', '03_Banco_Extractos', `${newRecords.length} registros importados`);
  SpreadsheetApp.getUi().alert(`Importación completada: ${newRecords.length} movimientos bancarios añadidos`);
}

// ========================================
// IMPORTACIÓN FACTURAS
// ========================================

function importFacturasFromSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const importSheet = ss.getSheetByName('facturas_import');
  const targetSheet = ss.getSheetByName('02_Facturas_Recibidas');
  const asientosSheet = ss.getSheetByName('04_Asientos');
  
  if (!importSheet || !targetSheet || !asientosSheet) {
    SpreadsheetApp.getUi().alert('Error: Hojas necesarias no encontradas');
    return;
  }
  
  const lastRow = importSheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('No hay datos para importar en facturas_import');
    return;
  }
  
  const startRow = importSheet.getRange('A1').getValue().toString().toLowerCase().includes('fecha') ? 2 : 1;
  const dataRange = importSheet.getRange(startRow, 1, lastRow - startRow + 1, 8);
  const data = dataRange.getValues();
  
  const newFacturas = [];
  const newAsientos = [];
  const nextFacturaId = findNextId(targetSheet);
  const nextAsientoId = findNextId(asientosSheet);
  let asientoCount = 0;
  
  data.forEach((row, idx) => {
    const [fecha, proveedorNombre, numFactura, baseImponible, ivaPct, total, formaPago, diasVencimiento] = row;
    
    if (!fecha && !proveedorNombre) return;
    
    const parsedFecha = parseDate(fecha);
    const parsedBase = normalizeNumber(baseImponible);
    const parsedIvaPct = normalizeNumber(ivaPct);
    const parsedTotal = normalizeNumber(total);
    const parsedDias = normalizeNumber(diasVencimiento) || 30;
    
    // Calcular IVA si no se proporciona total
    const ivaImporte = parsedBase * (parsedIvaPct / 100);
    const totalCalculado = parsedTotal || (parsedBase + ivaImporte);
    
    // Calcular fecha vencimiento
    const fechaVencimiento = new Date(parsedFecha);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + parsedDias);
    
    const facturaId = nextFacturaId + idx;
    
    newFacturas.push([
      facturaId,
      parsedFecha,
      '', // Proveedor_ID (vacío, se puede rellenar manualmente)
      proveedorNombre || '',
      numFactura || '',
      parsedBase,
      parsedIvaPct,
      ivaImporte,
      totalCalculado,
      formaPago || 'Transferencia',
      fechaVencimiento,
      false, // No pagada
      '', // Fecha_Pago
      false, // No conciliada
      '' // Notas
    ]);
    
    // Generar asiento contable (Gasto + IVA Soportado = Proveedor)
    // Debe: 600 Compras (base) + 472 IVA Soportado (IVA)
    // Haber: 400 Proveedores (total)
    
    newAsientos.push([
      nextAsientoId + asientoCount++,
      parsedFecha,
      'Factura Recibida',
      `FR-${facturaId}`,
      '600', // Cuenta Compras
      parsedBase,
      0,
      `Factura ${numFactura} - ${proveedorNombre}`
    ]);
    
    newAsientos.push([
      nextAsientoId + asientoCount++,
      parsedFecha,
      'Factura Recibida',
      `FR-${facturaId}`,
      '472', // IVA Soportado
      ivaImporte,
      0,
      `IVA Factura ${numFactura}`
    ]);
    
    newAsientos.push([
      nextAsientoId + asientoCount++,
      parsedFecha,
      'Factura Recibida',
      `FR-${facturaId}`,
      '400', // Proveedores
      0,
      totalCalculado,
      `A pagar ${proveedorNombre}`
    ]);
  });
  
  if (newFacturas.length === 0) {
    SpreadsheetApp.getUi().alert('No se encontraron registros válidos para importar');
    return;
  }
  
  // Insertar facturas
  const targetLastRow = targetSheet.getLastRow();
  targetSheet.getRange(targetLastRow + 1, 1, newFacturas.length, newFacturas[0].length).setValues(newFacturas);
  
  // Insertar asientos
  const asientosLastRow = asientosSheet.getLastRow();
  asientosSheet.getRange(asientosLastRow + 1, 1, newAsientos.length, newAsientos[0].length).setValues(newAsientos);
  
  logAudit(Session.getActiveUser().getEmail(), 'Importar Facturas', '02_Facturas_Recibidas', `${newFacturas.length} facturas y ${newAsientos.length} asientos creados`);
  SpreadsheetApp.getUi().alert(`Importación completada:\n${newFacturas.length} facturas añadidas\n${newAsientos.length} asientos contables generados`);
}

// ========================================
// CONCILIACIÓN BANCO/FACTURAS
// ========================================

function reconcileBankWithInvoices() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('00_Config');
  const bancoSheet = ss.getSheetByName('03_Banco_Extractos');
  const facturasSheet = ss.getSheetByName('02_Facturas_Recibidas');
  
  if (!bancoSheet || !facturasSheet) {
    SpreadsheetApp.getUi().alert('Error: Hojas necesarias no encontradas');
    return;
  }
  
  // Obtener tolerancia de configuración
  const configData = configSheet.getRange(2, 1, configSheet.getLastRow() - 1, 2).getValues();
  const toleranciaRow = configData.find(row => row[0] === 'tolerancia_conciliacion');
  const tolerancia = toleranciaRow ? parseFloat(toleranciaRow[1]) : 0.5;
  
  // Leer movimientos bancarios no conciliados (negativos = gastos/pagos)
  const bancoData = bancoSheet.getRange(2, 1, bancoSheet.getLastRow() - 1, 10).getValues();
  const facturaData = facturasSheet.getRange(2, 1, facturasSheet.getLastRow() - 1, 15).getValues();
  
  let conciliados = 0;
  
  bancoData.forEach((bancoRow, bancoIdx) => {
    const [bancoId, fecha, fechaValor, descripcion, importe, saldo, tipo, conciliado, facturaId, notas] = bancoRow;
    
    // Solo procesar gastos no conciliados
    if (conciliado || importe >= 0) return;
    
    const importeAbs = Math.abs(importe);
    
    // Buscar factura con importe similar
    facturaData.forEach((facturaRow, facturaIdx) => {
      const [fId, fFecha, provId, provNombre, numFactura, base, ivaPct, ivaImporte, total, formaPago, vencimiento, pagada, fechaPago, fConciliada, fNotas] = facturaRow;
      
      // Solo procesar facturas no conciliadas y no pagadas
      if (fConciliada || pagada) return;
      
      // Verificar si el importe coincide (con tolerancia)
      const diferencia = Math.abs(importeAbs - total);
      
      if (diferencia <= tolerancia) {
        // Marcar como conciliados
        bancoSheet.getRange(bancoIdx + 2, 8).setValue(true); // Conciliado
        bancoSheet.getRange(bancoIdx + 2, 9).setValue(fId); // Factura_ID
        
        facturasSheet.getRange(facturaIdx + 2, 12).setValue(true); // Pagada
        facturasSheet.getRange(facturaIdx + 2, 13).setValue(fecha); // Fecha_Pago
        facturasSheet.getRange(facturaIdx + 2, 14).setValue(true); // Conciliada
        
        conciliados++;
      }
    });
  });
  
  logAudit(Session.getActiveUser().getEmail(), 'Conciliación', 'Banco/Facturas', `${conciliados} registros conciliados`);
  SpreadsheetApp.getUi().alert(`Conciliación completada.\n${conciliados} movimientos bancarios vinculados con facturas.`);
}

// ========================================
// INFORME IVA
// ========================================

function generateIVAReportPrompt() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    'Generar Informe IVA',
    'Introduce el periodo en formato: YYYY-Q (ej: 2024-1 para primer trimestre 2024)',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result.getSelectedButton() === ui.Button.OK) {
    const periodo = result.getResponseText();
    const match = periodo.match(/(\d{4})-(\d)/);
    
    if (!match) {
      ui.alert('Formato incorrecto. Usa: YYYY-Q (ej: 2024-1)');
      return;
    }
    
    const year = parseInt(match[1]);
    const quarter = parseInt(match[2]);
    
    if (quarter < 1 || quarter > 4) {
      ui.alert('El trimestre debe ser entre 1 y 4');
      return;
    }
    
    // Calcular fechas inicio y fin del trimestre
    const startMonth = (quarter - 1) * 3;
    const periodStart = new Date(year, startMonth, 1);
    const periodEnd = new Date(year, startMonth + 3, 0); // Último día del trimestre
    
    generateIVAReport(periodStart, periodEnd);
  }
}

function generateIVAReport(periodStart, periodEnd) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const facturasSheet = ss.getSheetByName('02_Facturas_Recibidas');
  
  if (!facturasSheet) {
    SpreadsheetApp.getUi().alert('Error: Hoja de facturas no encontrada');
    return;
  }
  
  // Crear o limpiar hoja de informe
  let reportSheet = ss.getSheetByName('IVA_Report');
  if (!reportSheet) {
    reportSheet = ss.insertSheet('IVA_Report');
  } else {
    reportSheet.clear();
  }
  
  // Leer facturas del periodo
  const facturaData = facturasSheet.getRange(2, 1, facturasSheet.getLastRow() - 1, 15).getValues();
  
  const facturasPeriodo = facturaData.filter(row => {
    const fecha = new Date(row[1]);
    return fecha >= periodStart && fecha <= periodEnd;
  });
  
  // Agrupar por tipo de IVA
  const ivaGroups = {};
  let totalBase = 0;
  let totalIVA = 0;
  
  facturasPeriodo.forEach(row => {
    const [id, fecha, provId, provNombre, numFactura, base, ivaPct, ivaImporte, total] = row;
    const ivaPctStr = ivaPct.toString();
    
    if (!ivaGroups[ivaPctStr]) {
      ivaGroups[ivaPctStr] = { base: 0, iva: 0, count: 0 };
    }
    
    ivaGroups[ivaPctStr].base += base;
    ivaGroups[ivaPctStr].iva += ivaImporte;
    ivaGroups[ivaPctStr].count++;
    
    totalBase += base;
    totalIVA += ivaImporte;
  });
  
  // Construir informe
  const reportData = [
    ['INFORME IVA SOPORTADO'],
    [`Periodo: ${formatDate(periodStart)} - ${formatDate(periodEnd)}`],
    [''],
    ['Tipo IVA %', 'Número Facturas', 'Base Imponible', 'Cuota IVA']
  ];
  
  Object.keys(ivaGroups).sort((a, b) => parseFloat(b) - parseFloat(a)).forEach(ivaPct => {
    const group = ivaGroups[ivaPct];
    reportData.push([
      `${ivaPct}%`,
      group.count,
      group.base.toFixed(2),
      group.iva.toFixed(2)
    ]);
  });
  
  reportData.push(['']);
  reportData.push(['TOTAL', facturasPeriodo.length, totalBase.toFixed(2), totalIVA.toFixed(2)]);
  
  // Escribir informe
  reportSheet.getRange(1, 1, reportData.length, 4).setValues(reportData);
  
  // Formato
  reportSheet.getRange(1, 1).setFontSize(14).setFontWeight('bold');
  reportSheet.getRange(4, 1, 1, 4).setFontWeight('bold').setBackground('#E8EAED');
  reportSheet.getRange(reportData.length, 1, 1, 4).setFontWeight('bold').setBackground('#FFF4C6');
  
  logAudit(Session.getActiveUser().getEmail(), 'Informe IVA', 'IVA_Report', `Periodo ${formatDate(periodStart)} - ${formatDate(periodEnd)}`);
  SpreadsheetApp.getUi().alert(`Informe IVA generado correctamente.\nTotal facturas: ${facturasPeriodo.length}\nIVA Soportado: ${totalIVA.toFixed(2)} EUR`);
}

// ========================================
// BACKUP A DRIVE
// ========================================

function backupToDrive() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('00_Config');
  const backupSheet = ss.getSheetByName('08_Backups');
  
  // Obtener folder ID de configuración
  const configData = configSheet.getRange(2, 1, configSheet.getLastRow() - 1, 2).getValues();
  const folderRow = configData.find(row => row[0] === 'backup_folder_id');
  const folderId = folderRow ? folderRow[1] : '';
  
  let folder;
  if (folderId) {
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      SpreadsheetApp.getUi().alert('Error: ID de carpeta no válido en configuración');
      return;
    }
  } else {
    // Usar carpeta raíz del Drive
    folder = DriveApp.getRootFolder();
  }
  
  // Crear copia con timestamp
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const backupName = `Contabilidad_Backup_${timestamp}`;
  
  const file = DriveApp.getFileById(ss.getId());
  const backup = file.makeCopy(backupName, folder);
  
  // Registrar en hoja de backups
  const lastRow = backupSheet.getLastRow();
  backupSheet.getRange(lastRow + 1, 1, 1, 3).setValues([[
    new Date(),
    backupName,
    backup.getUrl()
  ]]);
  
  logAudit(Session.getActiveUser().getEmail(), 'Backup', '08_Backups', `Copia creada: ${backupName}`);
  SpreadsheetApp.getUi().alert(`Backup creado correctamente:\n${backupName}\n\nURL: ${backup.getUrl()}`);
}

// ========================================
// UTILIDADES
// ========================================

function normalizeNumber(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Convertir string a número (manejar comas como separador decimal)
  const str = value.toString().replace(/\./g, '').replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function parseDate(value) {
  if (value instanceof Date) return value;
  if (!value) return new Date();
  
  // Intentar parsear diferentes formatos
  const date = new Date(value);
  return isNaN(date.getTime()) ? new Date() : date;
}

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd/MM/yyyy');
}

function findNextId(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 1;
  
  // Buscar último ID en columna A
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const maxId = Math.max(...ids.map(row => typeof row[0] === 'number' ? row[0] : 0));
  return maxId + 1;
}

function logAudit(usuario, accion, hoja, detalles) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const auditSheet = ss.getSheetByName('09_Auditoria');
  
  if (!auditSheet) return;
  
  const lastRow = auditSheet.getLastRow();
  auditSheet.getRange(lastRow + 1, 1, 1, 5).setValues([[
    new Date(),
    usuario,
    accion,
    hoja,
    detalles
  ]]);
}

function getConfig(parameter) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('00_Config');
  
  if (!configSheet) return null;
  
  const configData = configSheet.getRange(2, 1, configSheet.getLastRow() - 1, 2).getValues();
  const row = configData.find(r => r[0] === parameter);
  return row ? row[1] : null;
}
