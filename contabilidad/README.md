Plantilla de contabilidad para Google Sheets + Apps Script

Descripción
Esta carpeta contiene todo lo necesario para crear una plantilla local de contabilidad en Google Sheets con scripts de Apps Script. El usuario instalará el script en su propia cuenta de Google y ejecutará las funciones para crear las hojas y procesos.

Contenido
- contabilidad/apps_script/Code.gs: Código Apps Script principal (pegar en el editor de Apps Script del spreadsheet).
- contabilidad/apps_script/appsscript.json: Manifest (opcional) con scopes. Ver instrucciones más abajo.
- contabilidad/templates/: plantillas CSV y plan contable simplificado.

Instrucciones de instalación (resumen)
1. Crea una nueva Google Sheet en tu cuenta (Drive).
2. Abre el editor de Apps Script: Extensiones -> Apps Script.
3. Crea un nuevo proyecto y pega el contenido de contabilidad/apps_script/Code.gs en el archivo Code.gs.
4. Manifest (opcional): Si quieres aplicar el manifest appsscript.json, tienes dos opciones:
   - Usar clasp para desplegar el proyecto desde tu máquina y reemplazar el manifest.
   - O bien en la nueva interfaz de Apps Script, ve a "Project settings" -> "Show "appsscript.json" file" y pega el contenido de contabilidad/apps_script/appsscript.json.
5. Guarda y vuelve a la hoja. En el menú del Spreadsheet aparecerá el menú "Contabilidad".
6. Ejecuta Contabilidad -> Crear estructura inicial (createTemplateSheets). Esto creará las hojas: 00_Config, 01_Proveedores, 02_Facturas_Recibidas, 03_Banco_Extractos, 04_Asientos, 05_Plan_Contable, 06_Activos_Fijos, 07_Nominas, 08_Backups, 09_Auditoria, bank_csv_import, facturas_import, IVA_Report.
7. Usa las plantillas en contabilidad/templates/ para importar CSV (pegar en sheet bank_csv_import y ejecutar importBankCSVFromSheet), y facturas (facturas_import).

Notas importantes
- Esta plantilla está pensada para uso local y manual-asistido. Revisa siempre los asientos sugeridos antes de aceptarlos.
- No contiene datos reales.
- Haz backups periódicos (el script incluye backupToDrive()).
