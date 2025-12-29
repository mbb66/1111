const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

let mainWindow;
let db;

// Configuración de la base de datos
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'contabilidad.db');
const backupsPath = path.join(userDataPath, 'backups');

// Crear directorio de backups si no existe
if (!fs.existsSync(backupsPath)) {
  fs.mkdirSync(backupsPath, { recursive: true });
}

function initializeDatabase() {
  try {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    
    // Leer y ejecutar el script de inicialización
    const initSqlPath = path.join(__dirname, 'db', 'init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf-8');
    
    // Ejecutar cada statement del SQL
    db.exec(initSql);
    
    console.log('Database initialized successfully at:', dbPath);
  } catch (error) {
    console.error('Error initializing database:', error);
    dialog.showErrorBox('Database Error', `Failed to initialize database: ${error.message}`);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'resources', 'icon.png')
  });

  // En desarrollo, cargar desde el servidor de Vite
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar el archivo HTML construido
    mainWindow.loadFile(path.join(__dirname, 'app', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicializar app
app.whenReady().then(() => {
  initializeDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) db.close();
    app.quit();
  }
});

app.on('before-quit', () => {
  if (db) db.close();
});

// ==================== IPC Handlers ====================

// PROVEEDORES
ipcMain.handle('proveedores:getAll', async () => {
  try {
    const proveedores = db.prepare('SELECT * FROM proveedores WHERE activo = 1 ORDER BY nombre').all();
    return { success: true, data: proveedores };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('proveedores:getById', async (event, id) => {
  try {
    const proveedor = db.prepare('SELECT * FROM proveedores WHERE id = ?').get(id);
    return { success: true, data: proveedor };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('proveedores:create', async (event, proveedor) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO proveedores (nombre, cif, direccion, telefono, email, contacto, notas)
      VALUES (@nombre, @cif, @direccion, @telefono, @email, @contacto, @notas)
    `);
    const result = stmt.run(proveedor);
    return { success: true, data: { id: result.lastInsertRowid } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('proveedores:update', async (event, id, proveedor) => {
  try {
    const stmt = db.prepare(`
      UPDATE proveedores 
      SET nombre = @nombre, cif = @cif, direccion = @direccion, 
          telefono = @telefono, email = @email, contacto = @contacto, 
          notas = @notas, updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);
    stmt.run({ ...proveedor, id });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('proveedores:delete', async (event, id) => {
  try {
    const stmt = db.prepare('UPDATE proveedores SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// FACTURAS
ipcMain.handle('facturas:getAll', async (event, filters = {}) => {
  try {
    let query = `
      SELECT f.*, p.nombre as proveedor_nombre, p.cif as proveedor_cif
      FROM facturas f
      LEFT JOIN proveedores p ON f.proveedor_id = p.id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.proveedorId) {
      query += ' AND f.proveedor_id = ?';
      params.push(filters.proveedorId);
    }
    if (filters.fechaDesde) {
      query += ' AND f.fecha_emision >= ?';
      params.push(filters.fechaDesde);
    }
    if (filters.fechaHasta) {
      query += ' AND f.fecha_emision <= ?';
      params.push(filters.fechaHasta);
    }
    
    query += ' ORDER BY f.fecha_emision DESC, f.id DESC';
    
    const facturas = db.prepare(query).all(...params);
    return { success: true, data: facturas };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('facturas:create', async (event, factura) => {
  const transaction = db.transaction((facturaData) => {
    // Insertar factura
    const insertFactura = db.prepare(`
      INSERT INTO facturas (
        proveedor_id, numero_factura, fecha_emision, fecha_vencimiento,
        base_imponible, tipo_iva, cuota_iva, total, descripcion, categoria, notas
      ) VALUES (
        @proveedor_id, @numero_factura, @fecha_emision, @fecha_vencimiento,
        @base_imponible, @tipo_iva, @cuota_iva, @total, @descripcion, @categoria, @notas
      )
    `);
    
    const result = insertFactura.run(facturaData);
    const facturaId = result.lastInsertRowid;
    
    // Obtener el próximo número de asiento
    const maxAsiento = db.prepare('SELECT COALESCE(MAX(numero_asiento), 0) as max FROM asientos').get();
    const numeroAsiento = maxAsiento.max + 1;
    
    // Generar asientos automáticos
    const insertAsiento = db.prepare(`
      INSERT INTO asientos (fecha, numero_asiento, cuenta_debe, cuenta_haber, importe, concepto, factura_id, tipo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'automatico')
    `);
    
    // Asiento 1: Base imponible (Debe: Gasto, Haber: Proveedor)
    insertAsiento.run(
      facturaData.fecha_emision,
      numeroAsiento,
      '600', // Compras (o código de gasto según categoría)
      '400', // Proveedores
      facturaData.base_imponible,
      `Factura ${facturaData.numero_factura} - Base imponible`,
      facturaId
    );
    
    // Asiento 2: IVA soportado (Debe: IVA soportado, Haber: Proveedor)
    insertAsiento.run(
      facturaData.fecha_emision,
      numeroAsiento,
      '472', // IVA soportado
      '400', // Proveedores
      facturaData.cuota_iva,
      `Factura ${facturaData.numero_factura} - IVA`,
      facturaId
    );
    
    return facturaId;
  });
  
  try {
    const facturaId = transaction(factura);
    return { success: true, data: { id: facturaId } };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'Ya existe una factura con este número para este proveedor' };
    }
    return { success: false, error: error.message };
  }
});

ipcMain.handle('facturas:update', async (event, id, factura) => {
  try {
    const stmt = db.prepare(`
      UPDATE facturas 
      SET proveedor_id = @proveedor_id, numero_factura = @numero_factura,
          fecha_emision = @fecha_emision, fecha_vencimiento = @fecha_vencimiento,
          base_imponible = @base_imponible, tipo_iva = @tipo_iva, cuota_iva = @cuota_iva,
          total = @total, descripcion = @descripcion, categoria = @categoria,
          pagado = @pagado, fecha_pago = @fecha_pago, notas = @notas,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);
    stmt.run({ ...factura, id });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// GASTOS
ipcMain.handle('gastos:getAll', async (event, filters = {}) => {
  try {
    let query = `
      SELECT g.*, p.nombre as proveedor_nombre
      FROM gastos g
      LEFT JOIN proveedores p ON g.proveedor_id = p.id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.categoria) {
      query += ' AND g.categoria = ?';
      params.push(filters.categoria);
    }
    if (filters.fechaDesde) {
      query += ' AND g.fecha >= ?';
      params.push(filters.fechaDesde);
    }
    if (filters.fechaHasta) {
      query += ' AND g.fecha <= ?';
      params.push(filters.fechaHasta);
    }
    
    query += ' ORDER BY g.fecha DESC, g.id DESC';
    
    const gastos = db.prepare(query).all(...params);
    return { success: true, data: gastos };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('gastos:create', async (event, gasto) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO gastos (fecha, categoria, subcategoria, descripcion, importe, proveedor_id, forma_pago, notas)
      VALUES (@fecha, @categoria, @subcategoria, @descripcion, @importe, @proveedor_id, @forma_pago, @notas)
    `);
    const result = stmt.run(gasto);
    return { success: true, data: { id: result.lastInsertRowid } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('gastos:getCategorias', async () => {
  try {
    const categorias = db.prepare('SELECT DISTINCT categoria FROM gastos WHERE categoria IS NOT NULL ORDER BY categoria').all();
    return { success: true, data: categorias.map(c => c.categoria) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// INFORMES
ipcMain.handle('informes:getPyL', async (event, { fechaDesde, fechaHasta }) => {
  try {
    // Obtener gastos agrupados por categoría
    const gastos = db.prepare(`
      SELECT categoria, SUM(importe) as total
      FROM gastos
      WHERE fecha BETWEEN ? AND ?
      GROUP BY categoria
      ORDER BY total DESC
    `).all(fechaDesde, fechaHasta);
    
    const totalGastos = gastos.reduce((sum, g) => sum + g.total, 0);
    
    // En este MVP no tenemos ingresos, pero dejamos la estructura preparada
    const ingresos = [];
    const totalIngresos = 0;
    
    const resultado = totalIngresos - totalGastos;
    
    return {
      success: true,
      data: {
        periodo: { desde: fechaDesde, hasta: fechaHasta },
        gastos,
        totalGastos,
        ingresos,
        totalIngresos,
        resultado
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('informes:getIVA', async (event, { fechaDesde, fechaHasta }) => {
  try {
    const facturas = db.prepare(`
      SELECT 
        tipo_iva,
        SUM(base_imponible) as total_base,
        SUM(cuota_iva) as total_cuota,
        COUNT(*) as num_facturas
      FROM facturas
      WHERE fecha_emision BETWEEN ? AND ?
      GROUP BY tipo_iva
      ORDER BY tipo_iva DESC
    `).all(fechaDesde, fechaHasta);
    
    const totales = db.prepare(`
      SELECT 
        SUM(base_imponible) as base_total,
        SUM(cuota_iva) as cuota_total,
        COUNT(*) as total_facturas
      FROM facturas
      WHERE fecha_emision BETWEEN ? AND ?
    `).get(fechaDesde, fechaHasta);
    
    return {
      success: true,
      data: {
        periodo: { desde: fechaDesde, hasta: fechaHasta },
        detallesPorTipo: facturas,
        totales
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// PLAN CONTABLE
ipcMain.handle('planContable:getAll', async () => {
  try {
    const cuentas = db.prepare('SELECT * FROM plan_contable WHERE activo = 1 ORDER BY codigo').all();
    return { success: true, data: cuentas };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// BACKUPS
ipcMain.handle('backup:create', async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFileName = `contabilidad_backup_${timestamp}.db`;
    const backupFilePath = path.join(backupsPath, backupFileName);
    
    // Cerrar WAL mode temporalmente para hacer backup
    db.pragma('wal_checkpoint(TRUNCATE)');
    
    // Copiar archivo de base de datos
    fs.copyFileSync(dbPath, backupFilePath);
    
    const stats = fs.statSync(backupFilePath);
    
    // Registrar backup en la base de datos
    const stmt = db.prepare(`
      INSERT INTO backups (nombre_archivo, ruta, tamano_bytes, descripcion)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(backupFileName, backupFilePath, stats.size, 'Backup manual');
    
    return {
      success: true,
      data: {
        fileName: backupFileName,
        path: backupFilePath,
        size: stats.size
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('backup:getAll', async () => {
  try {
    const backups = db.prepare('SELECT * FROM backups ORDER BY created_at DESC').all();
    return { success: true, data: backups };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// EXPORTAR A CSV
ipcMain.handle('export:csv', async (event, { data, fileName }) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Exportar a CSV',
      defaultPath: fileName,
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    });
    
    if (result.canceled) {
      return { success: false, error: 'Exportación cancelada' };
    }
    
    fs.writeFileSync(result.filePath, data, 'utf-8');
    return { success: true, data: { path: result.filePath } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ASIENTOS
ipcMain.handle('asientos:getByFactura', async (event, facturaId) => {
  try {
    const asientos = db.prepare('SELECT * FROM asientos WHERE factura_id = ? ORDER BY id').all(facturaId);
    return { success: true, data: asientos };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
