-- Tabla de configuración de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE,
    rol TEXT DEFAULT 'admin',
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de plan contable simplificado
CREATE TABLE IF NOT EXISTS plan_contable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('activo', 'pasivo', 'gasto', 'ingreso', 'patrimonio')),
    descripcion TEXT,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    cif TEXT UNIQUE NOT NULL,
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    contacto TEXT,
    notas TEXT,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de facturas recibidas
CREATE TABLE IF NOT EXISTS facturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proveedor_id INTEGER NOT NULL,
    numero_factura TEXT NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    base_imponible REAL NOT NULL,
    tipo_iva REAL DEFAULT 21.0,
    cuota_iva REAL NOT NULL,
    total REAL NOT NULL,
    descripcion TEXT,
    categoria TEXT,
    pagado INTEGER DEFAULT 0,
    fecha_pago DATE,
    notas TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    UNIQUE(proveedor_id, numero_factura)
);

-- Tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATE NOT NULL,
    categoria TEXT NOT NULL,
    subcategoria TEXT,
    descripcion TEXT NOT NULL,
    importe REAL NOT NULL,
    factura_id INTEGER,
    proveedor_id INTEGER,
    forma_pago TEXT DEFAULT 'efectivo',
    notas TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

-- Tabla de asientos contables (generados automáticamente desde facturas)
CREATE TABLE IF NOT EXISTS asientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATE NOT NULL,
    numero_asiento INTEGER NOT NULL,
    cuenta_debe TEXT NOT NULL,
    cuenta_haber TEXT NOT NULL,
    importe REAL NOT NULL,
    concepto TEXT NOT NULL,
    factura_id INTEGER,
    tipo TEXT DEFAULT 'automatico' CHECK(tipo IN ('automatico', 'manual')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas(id),
    -- Using codigo (account code) for FK to maintain accounting standard references
    -- Account codes are stable identifiers in accounting practice (e.g., 472, 600, 400)
    FOREIGN KEY (cuenta_debe) REFERENCES plan_contable(codigo),
    FOREIGN KEY (cuenta_haber) REFERENCES plan_contable(codigo)
);

-- Tabla de backups
CREATE TABLE IF NOT EXISTS backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_archivo TEXT NOT NULL,
    ruta TEXT NOT NULL,
    tamano_bytes INTEGER,
    descripcion TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_facturas_proveedor ON facturas(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);
CREATE INDEX IF NOT EXISTS idx_asientos_fecha ON asientos(fecha);
CREATE INDEX IF NOT EXISTS idx_asientos_factura ON asientos(factura_id);

-- Datos iniciales: plan contable básico
INSERT OR IGNORE INTO plan_contable (codigo, nombre, tipo, descripcion) VALUES
    -- Activos
    ('570', 'Caja, euros', 'activo', 'Efectivo en caja'),
    ('572', 'Bancos c/c', 'activo', 'Cuenta corriente bancaria'),
    ('430', 'Clientes', 'activo', 'Clientes por cobrar'),
    ('406', 'Proveedores, facturas pendientes de recibir', 'activo', 'Facturas en tránsito'),
    ('216', 'Mobiliario', 'activo', 'Mobiliario y equipamiento'),
    ('217', 'Equipos proceso información', 'activo', 'Equipos informáticos'),
    ('218', 'Elementos de transporte', 'activo', 'Vehículos'),
    ('219', 'Otro inmovilizado material', 'activo', 'Otras herramientas y equipos'),
    
    -- Pasivos
    ('400', 'Proveedores', 'pasivo', 'Proveedores'),
    ('410', 'Acreedores por prestación de servicios', 'pasivo', 'Servicios pendientes de pago'),
    ('465', 'Remuneraciones pendientes de pago', 'pasivo', 'Nóminas pendientes'),
    ('475', 'Hacienda Pública, acreedora por IVA', 'pasivo', 'IVA repercutido'),
    ('476', 'Organismos de la Seguridad Social, acreedores', 'pasivo', 'Seguridad Social a pagar'),
    ('520', 'Deudas a corto plazo con entidades de crédito', 'pasivo', 'Préstamos bancarios'),
    
    -- Gastos
    ('600', 'Compras de mercaderías', 'gasto', 'Compras de repuestos y materiales'),
    ('621', 'Arrendamientos y cánones', 'gasto', 'Alquileres'),
    ('622', 'Reparaciones y conservación', 'gasto', 'Mantenimiento'),
    ('623', 'Servicios de profesionales independientes', 'gasto', 'Asesoría, gestoría'),
    ('624', 'Transportes', 'gasto', 'Gastos de transporte'),
    ('625', 'Primas de seguros', 'gasto', 'Seguros'),
    ('626', 'Servicios bancarios', 'gasto', 'Comisiones bancarias'),
    ('627', 'Publicidad, propaganda y relaciones públicas', 'gasto', 'Marketing'),
    ('628', 'Suministros', 'gasto', 'Luz, agua, gas, internet'),
    ('629', 'Otros servicios', 'gasto', 'Otros servicios externos'),
    ('640', 'Sueldos y salarios', 'gasto', 'Salarios del personal'),
    ('642', 'Seguridad Social a cargo de la empresa', 'gasto', 'Cuotas de Seguridad Social'),
    ('681', 'Amortización del inmovilizado material', 'gasto', 'Depreciación de activos'),
    
    -- IVA
    ('472', 'Hacienda Pública, IVA soportado', 'activo', 'IVA de compras deducible'),
    
    -- Ingresos
    ('700', 'Ventas de mercaderías', 'ingreso', 'Ventas de productos'),
    ('705', 'Prestaciones de servicios', 'ingreso', 'Servicios de taller'),
    
    -- Patrimonio
    ('100', 'Capital social', 'patrimonio', 'Capital del negocio'),
    ('129', 'Resultado del ejercicio', 'patrimonio', 'Beneficio o pérdida del ejercicio');

-- Usuario administrador por defecto
INSERT OR IGNORE INTO usuarios (nombre, email, rol) VALUES
    ('Administrador', 'admin@taller.local', 'admin');
