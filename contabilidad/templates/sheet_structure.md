Estructura de hojas y columnas

00_Config:
- param, value

01_Proveedores:
- id_prov, nombre, nif, direccion, email, telefono, cond_pago, notas

02_Facturas_Recibidas:
- id, proveedor_id, fecha_emision, fecha_recepcion, n_factura, forma_pago, fecha_pago, base, tipo_iva, iva_importe, total, estado, tipo_operacion, enlace_pdf, conciliado

03_Banco_Extractos:
- id_mov, fecha, concepto, contra_partida, importe, saldo, archivo_origen, conciliado, factura_vinculada

04_Asientos:
- id_asiento, fecha, descripcion, cuenta_debe, cuenta_haber, importe, referencia_factura, conciliado

05_Plan_Contable:
- codigo, cuenta, tipo, descripcion

06_Activos_Fijos:
- id_activo, descripcion, fecha_compra, importe_sin_iva, iva_soportado, vida_util_anos, amort_acumulada, cuenta

07_Nominas:
- id_nomina, mes, trabajador, base, irpf_retenido, cuota_empresa, neto_pagar, estado_pago

08_Backups:
- fecha_backup, url_backup, observaciones

09_Auditoria:
- fecha, usuario, accion, tabla, id_registro, detalle

bank_csv_import:
- fecha, concepto, importe, tipo, saldo, referencia

facturas_import:
- proveedor_id, fecha_emision, fecha_recepcion, n_factura, forma_pago, fecha_pago, base, tipo_iva, iva_importe, total, tipo_operacion, notas
