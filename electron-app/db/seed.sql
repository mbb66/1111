-- Script para generar datos de ejemplo para testing
-- Este script es OPCIONAL y solo debe ejecutarse para testing

-- Proveedores de ejemplo
INSERT OR IGNORE INTO proveedores (nombre, cif, direccion, telefono, email, contacto, notas) VALUES
  ('Repuestos García SL', 'B12345678', 'Calle Mayor 123, Madrid', '912345678', 'info@repuestosgarcia.es', 'Juan García', 'Proveedor principal de repuestos'),
  ('Suministros Industriales SA', 'A87654321', 'Av. Industria 45, Barcelona', '934567890', 'ventas@suministros.com', 'María López', 'Materiales y herramientas'),
  ('Aceites y Lubricantes Norte', 'B11223344', 'Polígono Industrial 7, Bilbao', '944556677', 'pedidos@aceitesnorte.es', 'Pedro Martín', 'Aceites y lubricantes'),
  ('Servicios de Limpieza ProClean', 'B99887766', 'Calle Limpieza 12, Valencia', '963778899', 'contacto@proclean.es', 'Ana Ruiz', 'Servicios de limpieza mensual'),
  ('Compañía Eléctrica LocalLight', 'A55443322', 'Av. Energía 89, Sevilla', '954112233', 'clientes@locallight.es', 'Carlos Díaz', 'Suministro eléctrico');

-- Facturas de ejemplo (para el mes actual)
INSERT OR IGNORE INTO facturas (
  proveedor_id, numero_factura, fecha_emision, fecha_vencimiento,
  base_imponible, tipo_iva, cuota_iva, total, descripcion, categoria
) VALUES
  (1, 'FRA-2024-001', date('now', '-15 days'), date('now', '+15 days'), 250.00, 21, 52.50, 302.50, 'Filtros de aceite y aire', 'Compras'),
  (1, 'FRA-2024-002', date('now', '-10 days'), date('now', '+20 days'), 450.00, 21, 94.50, 544.50, 'Kit de distribución', 'Compras'),
  (2, 'SI-2024-123', date('now', '-8 days'), date('now', '+22 days'), 180.00, 21, 37.80, 217.80, 'Herramientas varias', 'Compras'),
  (3, 'ALN-2024-456', date('now', '-5 days'), date('now', '+25 days'), 320.00, 21, 67.20, 387.20, 'Aceite motor 5W30 x 20L', 'Compras'),
  (4, 'PC-2024-789', date('now', '-3 days'), date('now', '+27 days'), 85.00, 21, 17.85, 102.85, 'Servicio limpieza mensual', 'Servicios'),
  (5, 'EL-2024-555', date('now', '-1 day'), date('now', '+29 days'), 142.50, 21, 29.93, 172.43, 'Consumo eléctrico mes anterior', 'Suministros');

-- Gastos de ejemplo
INSERT OR IGNORE INTO gastos (fecha, categoria, subcategoria, descripcion, importe, proveedor_id, forma_pago) VALUES
  (date('now', '-20 days'), 'Suministros', 'Internet', 'Conexión fibra óptica mensual', 45.00, NULL, 'transferencia'),
  (date('now', '-18 days'), 'Suministros', 'Teléfono', 'Línea móvil empresa', 25.00, NULL, 'transferencia'),
  (date('now', '-12 days'), 'Transportes', 'Combustible', 'Gasoil furgoneta', 65.00, NULL, 'tarjeta'),
  (date('now', '-9 days'), 'Otros servicios', 'Gestoría', 'Cuota mensual gestoría', 120.00, NULL, 'transferencia'),
  (date('now', '-6 days'), 'Reparaciones', 'Mantenimiento', 'Revisión compresor', 85.00, NULL, 'efectivo'),
  (date('now', '-4 days'), 'Suministros', 'Agua', 'Consumo agua mensual', 28.50, NULL, 'domiciliación'),
  (date('now', '-2 days'), 'Publicidad', 'Online', 'Anuncios Google Ads', 75.00, NULL, 'tarjeta');

-- Nota: Los asientos se generan automáticamente al insertar facturas mediante la aplicación
-- Este script está pensado para ejecutarse manualmente si se desea poblar la BD con datos de prueba
