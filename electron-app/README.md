# Aplicación de Contabilidad para Taller - Electron + React + SQLite

> **Versión**: 1.0.0 - Fase 1 MVP (Sin OCR)  
> **Estado**: Draft - Pendiente de revisión e integración de Fase 2 (OCR)

## 📋 Descripción

Aplicación de escritorio multiplataforma para gestión contable de talleres, desarrollada con Electron, React y SQLite. Esta es la implementación de la Fase 1 (MVP) que incluye todas las funcionalidades básicas de contabilidad sin la integración de OCR (planificada para Fase 2).

## ✨ Funcionalidades Implementadas (Fase 1)

### Gestión de Proveedores
- ✅ CRUD completo de proveedores (Crear, Leer, Actualizar, Eliminar)
- ✅ Información completa: nombre, CIF, dirección, teléfono, email, contacto, notas
- ✅ Validación de datos y prevención de duplicados por CIF

### Facturas Recibidas
- ✅ Formulario manual de entrada de facturas
- ✅ Cálculo automático de IVA (21%, 10%, 4%, 0%)
- ✅ Generación automática de asientos contables (base + IVA)
- ✅ Prevención de duplicados por (proveedor + número de factura)
- ✅ Categorización de facturas
- ✅ Visualización de asientos generados

### Gestión de Gastos
- ✅ Registro manual de gastos
- ✅ Categorización y subcategorización
- ✅ Asociación opcional con proveedores
- ✅ Formas de pago: efectivo, tarjeta, transferencia, cheque
- ✅ Resumen de gastos por categoría

### Informes
- ✅ **P&L (Pérdidas y Ganancias) mensual**
  - Desglose de gastos por categoría
  - Cálculo de resultado del período
  - Exportación a CSV
- ✅ **Resumen de IVA soportado**
  - Detalle por tipo de IVA
  - Totales de base imponible y cuotas
  - Exportación a CSV

### Base de Datos y Seguridad
- ✅ SQLite local con esquema completo
- ✅ Plan contable simplificado precargado
- ✅ Sistema de backups manuales
- ✅ Datos completamente locales (sin conexión a internet)
- ✅ Opción para cifrado de DB (ver configuración avanzada)

### Interfaz de Usuario
- ✅ Dashboard con estadísticas rápidas
- ✅ Navegación intuitiva con menú lateral
- ✅ Diseño responsivo con Tailwind CSS
- ✅ Validación de formularios
- ✅ Feedback visual de acciones

## 📦 Requisitos del Sistema

### Sistema Operativo
- Windows 10 o superior
- macOS 10.14 (Mojave) o superior
- Linux (Ubuntu 18.04+, Debian 10+, o equivalente)

### Software Necesario
- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior

### Requisitos de Hardware
- RAM: Mínimo 4 GB
- Espacio en disco: 500 MB libres
- Resolución de pantalla: Mínimo 1024x768 (recomendado 1400x900)

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/mbb66/1111.git
cd 1111/electron-app
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias de la aplicación React
cd app
npm install
cd ..
```

### 3. Configuración (Opcional)

Copia el archivo `.env.example` a `.env` y ajusta la configuración si es necesario:

```bash
cp .env.example .env
```

Variables disponibles:
- `DB_PATH`: Ruta a la base de datos (por defecto: `./data/contabilidad.db`)
- `NODE_ENV`: Entorno de ejecución (development/production)
- `WINDOW_WIDTH`: Ancho de ventana inicial (por defecto: 1400)
- `WINDOW_HEIGHT`: Alto de ventana inicial (por defecto: 900)
- `ENABLE_DB_ENCRYPTION`: Habilitar cifrado de DB (false por defecto)

## 🏃‍♂️ Ejecución en Modo Desarrollo

```bash
# Desde la raíz del proyecto electron-app
npm run dev
```

Este comando:
1. Inicia el servidor de desarrollo de Vite (React) en `http://localhost:5173`
2. Espera a que el servidor esté listo
3. Lanza Electron con DevTools abierto

## 🔨 Compilar y Empaquetar

### Compilar la aplicación React

```bash
npm run build
```

### Empaquetar la aplicación para distribución

```bash
# Empaquetar para el sistema operativo actual
npm run package

# Los instaladores se generarán en la carpeta `dist/`
```

**Nota**: El proceso de empaquetado puede tardar varios minutos.

### Archivos Generados

Dependiendo del sistema operativo:

- **Windows**: 
  - `dist/*.exe` (instalador NSIS)
  - `dist/*.exe` (versión portable)

- **macOS**:
  - `dist/*.dmg` (imagen de disco)
  - `dist/*.zip` (aplicación comprimida)

- **Linux**:
  - `dist/*.AppImage` (aplicación portable)
  - `dist/*.deb` (paquete Debian)

## 📊 Uso de la Aplicación

### Primera Ejecución

1. Al iniciar la aplicación por primera vez, se creará automáticamente:
   - La base de datos SQLite
   - El plan contable simplificado
   - Un usuario administrador por defecto

2. La base de datos se crea en la carpeta de datos del usuario:
   - **Windows**: `%APPDATA%/taller-contabilidad/contabilidad.db`
   - **macOS**: `~/Library/Application Support/taller-contabilidad/contabilidad.db`
   - **Linux**: `~/.config/taller-contabilidad/contabilidad.db`

### Flujo de Trabajo Típico

1. **Registrar Proveedores**
   - Ir a "Proveedores" → "Nuevo Proveedor"
   - Completar los datos (nombre y CIF obligatorios)
   - Guardar

2. **Añadir Facturas**
   - Ir a "Facturas" → "Nueva Factura"
   - Seleccionar proveedor
   - Introducir datos de la factura
   - El IVA se calcula automáticamente
   - Al guardar, se generan asientos contables automáticamente

3. **Registrar Gastos**
   - Ir a "Gastos" → "Nuevo Gasto"
   - Completar información del gasto
   - Opcionalmente asociar a un proveedor

4. **Generar Informes**
   - Ir a "Informes"
   - Seleccionar tipo de informe (P&L o IVA)
   - Definir período
   - Generar y exportar a CSV si es necesario

5. **Crear Backups**
   - Ir a "Configuración"
   - Hacer clic en "Crear Backup"
   - Los backups se guardan en la carpeta de datos

## 🔧 Configuración Avanzada

### Cifrado de Base de Datos

Para habilitar el cifrado de la base de datos SQLite:

1. Instalar SQLCipher (depende del SO)
2. Modificar `.env`: `ENABLE_DB_ENCRYPTION=true`
3. Implementar la lógica de cifrado en `main.js` (pendiente Fase 2)

### Personalizar Plan Contable

Edita el archivo `db/init.sql` para añadir o modificar cuentas contables antes de la primera ejecución.

## 📝 Estructura del Proyecto

```
electron-app/
├── main.js                 # Proceso principal de Electron
├── preload.js             # Script de precarga (IPC bridge)
├── package.json           # Configuración del proyecto
├── .env.example           # Ejemplo de variables de entorno
├── .eslintrc.cjs          # Configuración de ESLint
├── .prettierrc            # Configuración de Prettier
├── db/
│   └── init.sql           # Script de inicialización de DB
├── resources/             # Iconos y recursos estáticos
├── app/                   # Aplicación React
│   ├── package.json       # Dependencias de React
│   ├── vite.config.js     # Configuración de Vite
│   ├── index.html         # HTML principal
│   ├── tailwind.config.js # Configuración de Tailwind
│   └── src/
│       ├── index.jsx      # Punto de entrada React
│       ├── App.jsx        # Componente principal
│       ├── pages/         # Páginas/vistas
│       │   ├── Dashboard.jsx
│       │   ├── Proveedores.jsx
│       │   ├── Facturas.jsx
│       │   ├── Gastos.jsx
│       │   ├── Informes.jsx
│       │   └── Settings.jsx
│       └── styles/        # Estilos CSS
│           └── index.css
└── dist/                  # Archivos compilados (generados)
```

## 🧪 Testing

```bash
# Ejecutar linter
npm run lint

# Formatear código
npm run format
```

**Nota**: Los tests unitarios y de integración se añadirán en futuras versiones.

## 🐛 Solución de Problemas

### La aplicación no inicia

1. Verifica que tienes instalado Node.js 18+
2. Elimina `node_modules` y vuelve a instalar: `npm install`
3. Comprueba los logs en la consola de desarrollo

### Error de base de datos

1. Cierra la aplicación completamente
2. Elimina el archivo de base de datos (se recreará)
3. Reinicia la aplicación

### El servidor de desarrollo no inicia

1. Verifica que el puerto 5173 no esté en uso
2. Ejecuta `cd app && npm run dev` manualmente para ver errores
3. Elimina `app/node_modules` y reinstala

### Problemas de rendimiento

1. Crea un backup de la base de datos
2. Comprueba el tamaño del archivo `.db`
3. Si es muy grande (>100MB), considera limpiar datos antiguos

## 📚 Plan Contable Incluido

El sistema incluye un plan contable simplificado basado en el PGC español con las cuentas más comunes:

- **Activos**: Caja, Bancos, Clientes, Mobiliario, Equipos, Vehículos
- **Pasivos**: Proveedores, IVA repercutido, Seguridad Social, Préstamos
- **Gastos**: Compras, Servicios, Salarios, Suministros, etc.
- **Ingresos**: Ventas, Prestaciones de servicios (preparado para Fase 2)
- **IVA**: Cuenta de IVA soportado

Consulta `db/init.sql` para el listado completo.

## 🚧 Fase 2 (Próximas Mejoras)

La Fase 2 incluirá:

### OCR con Tesseract
- Instalación y configuración de Tesseract OCR
- Procesamiento automático de PDFs de facturas
- Extracción automática de datos: proveedor, número, fecha, importes
- Validación y corrección manual de datos extraídos

### Requisitos adicionales para Fase 2
- **Tesseract OCR** (Windows):
  1. Descargar desde: https://github.com/UB-Mannheim/tesseract/wiki
  2. Instalar en `C:\Program Files\Tesseract-OCR`
  3. Añadir al PATH del sistema
  4. Descargar datos de idioma español: `tesseract-ocr-spa.traineddata`

### Otras mejoras planificadas
- Gestión de clientes e ingresos
- Facturación (emisión de facturas)
- Dashboard mejorado con gráficos
- Más opciones de informes
- Importación/exportación de datos
- Sincronización en nube (opcional)

## 👥 Autor

- **mbb66** - Desarrollo inicial y Fase 1 MVP

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles

## 🤝 Contribuir

Este proyecto está en fase de desarrollo inicial. Para contribuciones o sugerencias:

1. Abre un issue describiendo la mejora o bug
2. Fork el repositorio
3. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
4. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
5. Push a la rama (`git push origin feature/AmazingFeature`)
6. Abre un Pull Request

## ⚠️ Disclaimer

Esta herramienta es un sistema de control y registro contable para uso interno del taller. **No sustituye el trabajo profesional de un gestor o asesor fiscal**. Siempre consulta con tu gestoría para:

- Liquidaciones de IVA
- Declaraciones fiscales
- Interpretación de normativa contable
- Optimización fiscal

El autor no se hace responsable de errores en la contabilidad derivados del uso de esta aplicación.

## 📞 Soporte

Para problemas, bugs o sugerencias:
- Abre un issue en GitHub: https://github.com/mbb66/1111/issues
- Incluye información detallada del problema
- Adjunta capturas de pantalla si es posible

---

**¡Gracias por usar la Aplicación de Contabilidad para Taller!** 🚀
