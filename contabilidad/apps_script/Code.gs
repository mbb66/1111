// Contabilidad - Apps Script (simplified template)
// by Copilot

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Contabilidad')
    .addItem('Crear estructura inicial', 'createTemplateSheets')
    .addItem('Importar CSV bancario', 'importBankCSVFromSheet')
    .addItem('Importar facturas desde sheet', 'importFacturasFromSheet')
    .addItem('Conciliar banco con facturas', 'reconcileBankWithInvoices')
    .addItem('Generar informe IVA', 'promptGenerateIVAReport')
    .addItem('Backup a Drive', 'backupToDrive')
    .addToUi();
}

function createTemplateSheets() {
  var ss = SpreadsheetApp.getActive();
  var sheets = [
    {name: '00_Config', header: ['param','value']},
    {name: '01_Proveedores', header: ['id_prov','nombre','nif','direccion','email','telefono','cond_pago','notas']},
    {name: '02_Facturas_Recibidas', header: ['id','proveedor_id','fecha_emision','fecha_recepcion','n_factura','forma_pago','fecha_pago','base','tipo_iva','iva_importe','total','estado','tipo_operacion','enlace_pdf','conciliado']},
    {name: '03_Banco_Extractos', header: ['id_mov','fecha','concepto','contra_partida','importe','saldo','archivo_origen','conciliado','factura_vinculada']},
    {name: '04_Asientos', header: ['id_asiento','fecha','descripcion','cuenta_debe','cuenta_haber','importe','referencia_factura','conciliado']},
    {name: '05_Plan_Contable', header: ['codigo','cuenta','tipo','descripcion']},
    {name: '06_Activos_Fijos', header: ['id_activo','descripcion','fecha_compra','importe_sin_iva','iva_soportado','vida_util_anos','amort_acumulada','cuenta']},
    {name: '07_Nominas', header: ['id_nomina','mes','trabajador','base','irpf_retenido','cuota_empresa','neto_pagar','estado_pago']},
    {name: '08_Backups', header: ['fecha_backup','url_backup','observaciones']},
    {name: '09_Auditoria', header: ['fecha','usuario','accion','tabla','id_registro','detalle']},
    {name: 'bank_csv_import', header: ['fecha','concepto','importe','tipo','saldo','referencia']},
    {name: 'facturas_import', header: ['proveedor_id','fecha_emision','fecha_recepcion','n_factura','forma_pago','fecha_pago','base','tipo_iva','iva_importe','total','tipo_operacion','notas']},
    {name: 'IVA_Report', header: ['period_start','period_end','iva_soportado','iva_repercutido','iva_a_ingresar']}
  ];

  sheets.forEach(function(s) {
    var sh = ss.getSheetByName(s.name);
    if (!sh) sh = ss.insertSheet(s.name);
    sh.clear();
    sh.getRange(1,1,1,s.header.length).setValues([s.header]);
  });

  // Seed config
  var cfg = ss.getSheetByName('00_Config');
  cfg.getRange(2,1,6,2).setValues([
    ['periodo_actual',''],
    ['tipo_iva_default','21'],
    ['cuenta_banco','5720'],
    ['retencion_irpf_default','15'],
    ['usuario','mbb66'],
    ['ultimo_backup','']
  ]);

  // Seed Plan Contable with few accounts
  var pc = ss.getSheetByName('05_Plan_Contable');
  var rows = [
    ['1000','Caja','Activo','Caja y efectivo'],
    ['5720','Banco','Activo','Cuenta bancaria principal'],
    ['600','Compras','Gasto','Compras mercaderias/materiales'],
    ['620','Servicios exteriores','Gasto','Subcontratacion/confeccion'],
    ['630','Suministros','Gasto','Luz/agua/telefono/internet'],
    ['640','Sueldos y salarios','Gasto','Remuneraciones'],
    ['641','Seguridad Social a cargo empresa','Gasto','Cotizaciones empresa'],
    ['663','Gastos financieros','Gasto','Intereses y comisiones'],
    ['672','Seguros','Gasto','Seguros varios'],
    ['627','Gestoria','Gasto','Honorarios gestor'],
    ['472','IVA Soportado','Impuesto','IVA soportado'],
    ['477','IVA Repercutido','Impuesto','IVA repercutido'],
    ['400','Proveedores','Pasivo','Proveedores'],
    ['170','Prestamos','Pasivo','Prestamos a largo plazo'],
    ['129','Resultado ejercicio','Patrimonio','Resultado del ejercicio'],
    ['136','Retiros propietarios','Patrimonio','Retiros/retiradas']
  ];
  pc.getRange(2,1,rows.length,rows[0].length).setValues(rows);

  SpreadsheetApp.getUi().alert('Estructura creada. Revisa las hojas y completa la configuración en 00_Config.');
  logAudit('createTemplateSheets', 'Creada estructura inicial');
}

function importBankCSVFromSheet() {
  var ss = SpreadsheetApp.getActive();
  var csv = ss.getSheetByName('bank_csv_import');
  var dest = ss.getSheetByName('03_Banco_Extractos');
  var data = csv.getDataRange().getValues();
  if (data.length <=1) { SpreadsheetApp.getUi().alert('Pega el CSV bancario en la hoja bank_csv_import.'); return; }
  var headers = data[0];
  var rows = data.slice(1);
  var nextId = findNextId(dest,1);
  var out = [];
  rows.forEach(function(r){
    if (r.join('').trim()=='') return;
    var fecha = r[0];
    var concepto = r[1];
    var importe = normalizeNumber(r[2]);
    var tipo = r[3] || (importe<0? 'D':'C');
    var saldo = r[4] || '';
    var ref = r[5] || '';
    out.push([nextId++, fecha, concepto, '', importe, saldo, 'import', '', '']);
  });
  if (out.length>0) dest.getRange(dest.getLastRow()+1,1,out.length,out[0].length).setValues(out);
  SpreadsheetApp.getUi().alert('Importación bancaria completada: ' + out.length + ' líneas');
  logAudit('importBankCSVFromSheet','Importadas '+out.length+' líneas');
}

function importFacturasFromSheet() {
  var ss = SpreadsheetApp.getActive();
  var csv = ss.getSheetByName('facturas_import');
  var dest = ss.getSheetByName('02_Facturas_Recibidas');
  var asiento = ss.getSheetByName('04_Asientos');
  var data = csv.getDataRange().getValues();
  if (data.length <=1) { SpreadsheetApp.getUi().alert('Pega las facturas en la hoja facturas_import.'); return; }
  var rows = data.slice(1);
  var nextId = findNextId(dest,1);
  var nextAsiento = findNextId(asiento,1);
  var out = [];
  var asientos = [];
  rows.forEach(function(r){
    if (r.join('').trim()=='') return;
    var proveedor_id=r[0];
    var fecha_em=r[1];
    var fecha_rec=r[2];
    var n_fact=r[3];
    var forma=r[4];
    var fecha_pago=r[5];
    var base=normalizeNumber(r[6]);
    var tipo_iva=normalizeNumber(r[7]);
    var iva_import=normalizeNumber(r[8]);
    var total=normalizeNumber(r[9]);
    var tipo_op=r[10]||'';
    var notas=r[11]||'';
    out.push([nextId,proveedor_id,fecha_em,fecha_rec,n_fact,forma,fecha_pago,base,tipo_iva,iva_import,total,'pendiente',tipo_op,'', 'N']);
    // Generar asiento simplificado
    // Debe: gasto (600) y IVA soportado (472); Haber: proveedores (400)
    asientos.push([nextAsiento, fecha_em, 'Factura '+n_fact+' prov:'+proveedor_id, '600', '400', base, n_fact, 'N']);
    asientos.push([nextAsiento+1, fecha_em, 'IVA '+n_fact, '472', '400', iva_import, n_fact, 'N']);
    nextId++; nextAsiento+=2;
  });
  if (out.length>0) dest.getRange(dest.getLastRow()+1,1,out.length,out[0].length).setValues(out);
  if (asientos.length>0) asiento.getRange(asiento.getLastRow()+1,1,asientos.length,asientos[0].length).setValues(asientos);
  SpreadsheetApp.getUi().alert('Importación de facturas completada: ' + out.length + ' facturas. Asientos generados: '+asientos.length);
  logAudit('importFacturasFromSheet','Importadas '+out.length+' facturas y generados '+asientos.length+' líneas de asiento');
}

function reconcileBankWithInvoices() {
  var ss = SpreadsheetApp.getActive();
  var bank = ss.getSheetByName('03_Banco_Extractos');
  var inv = ss.getSheetByName('02_Facturas_Recibidas');
  var bankData = bank.getDataRange().getValues();
  var invData = inv.getDataRange().getValues();
  var tol = 0.5;
  var matches = 0;
  for (var i=1;i<bankData.length;i++){
    var b = bankData[i]; if (!b[0]) continue;
    var bImp = Number(b[4]);
    if (b[7]=='S') continue;
    for (var j=1;j<invData.length;j++){
      var f = invData[j]; if (!f[0]) continue;
      var fTotal = Number(f[10]);
      if (f[14]=='S') continue;
      if (Math.abs(bImp - fTotal) <= tol) {
        // mark both as reconciled
        bank.getRange(i+1,8).setValue('S');
        bank.getRange(i+1,9).setValue(f[0]);
        inv.getRange(j+1,15).setValue('S');
        inv.getRange(j+1,13).setValue('conciliado via import');
        matches++; break;
      }
    }
  }
  SpreadsheetApp.getUi().alert('Conciliación completada: '+matches+' coincidencias encontradas.');
  logAudit('reconcileBankWithInvoices','Conciliadas '+matches+' líneas');
}

function promptGenerateIVAReport(){
  var ui = SpreadsheetApp.getUi();
  var res = ui.prompt('Informe IVA','Introduce fecha inicio (YYYY-MM-DD) y fecha fin (YYYY-MM-DD) separadas por coma:','');
  if (res.getSelectedButton()!=ui.Button.OK) return;
  var parts = res.getResponseText().split(',');
  if (parts.length<2) { ui.alert('Formato incorrecto'); return; }
  generateIVAReport(parts[0].trim(), parts[1].trim());
}

function generateIVAReport(periodStart, periodEnd) {
  var ss = SpreadsheetApp.getActive();
  var inv = ss.getSheetByName('02_Facturas_Recibidas');
  var data = inv.getDataRange().getValues();
  var ivaSoportado = 0;
  var ivaRepercutido = 0; // unlikely here but keep
  for (var i=1;i<data.length;i++){
    var row = data[i];
    var fecha = row[2];
    if (!fecha) continue;
    var f = new Date(fecha);
    var start = new Date(periodStart);
    var end = new Date(periodEnd);
    if (f>=start && f<=end) {
      ivaSoportado += Number(row[9]) || 0;
    }
  }
  var report = ss.getSheetByName('IVA_Report');
  report.appendRow([periodStart, periodEnd, ivaSoportado, ivaRepercutido, ivaRepercutido-ivaSoportado]);
  SpreadsheetApp.getUi().alert('Informe IVA generado. IVA soportado: '+ivaSoportado.toFixed(2));
  logAudit('generateIVAReport','Periodo '+periodStart+' a '+periodEnd+' -> IVA soportado '+ivaSoportado);
}

function backupToDrive(){
  var ss = SpreadsheetApp.getActive();
  var file = DriveApp.getFileById(ss.getId());
  var name = ss.getName() + ' - backup - ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  var copy = file.makeCopy(name);
  var url = copy.getUrl();
  var b = ss.getSheetByName('08_Backups');
  b.appendRow([new Date(), url, 'Backup creado por script']);
  ss.getRange('00_Config!B5').setValue(new Date());
  SpreadsheetApp.getUi().alert('Backup creado en Drive: ' + url);
  logAudit('backupToDrive','Backup creado: '+url);
}

// Utilities
function normalizeNumber(v){
  if (v==null || v==undefined || v=='') return 0;
  if (typeof v=='number') return v;
  var s = String(v).replace(/[^0-9\-.,]/g,'').replace(/,/g,'.');
  var n = parseFloat(s);
  return isNaN(n)?0:n;
}

function findNextId(sheet, colIndex) {
  var data = sheet.getRange(2, colIndex, sheet.getLastRow()).getValues();
  var maxId = 0;
  for (var i=0;i<data.length;i++){
    var v = Number(data[i][0]); if (!isNaN(v) && v>maxId) maxId=v;
  }
  return maxId+1;
}

function logAudit(action, detail){
  var ss = SpreadsheetApp.getActive();
  var a = ss.getSheetByName('09_Auditoria');
  a.appendRow([new Date(), Session.getActiveUser().getEmail(), action, '', '', detail]);
}
