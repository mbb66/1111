# Sistema de Contabilidad para Taller - Proyecto 1111

Este repositorio contiene dos implementaciones del sistema de contabilidad para talleres:

## 📁 Estructura del Repositorio

```
1111/
├── contabilidad/          # Solución Google Sheets + Apps Script (existente)
│   ├── apps_script/       # Código de Google Apps Script
│   ├── templates/         # Plantillas CSV y documentación
│   └── README.md          # Documentación de la solución Sheets
│
├── electron-app/          # 🆕 Aplicación de escritorio Electron (Fase 1 MVP)
│   ├── main.js            # Proceso principal de Electron
│   ├── preload.js         # Bridge IPC seguro
│   ├── package.json       # Configuración y scripts
│   ├── db/                # Esquema de base de datos SQLite
│   │   ├── init.sql       # Script de inicialización
│   │   └── seed.sql       # Datos de prueba opcionales
│   ├── app/               # Aplicación React
│   │   ├── src/           # Código fuente React
│   │   │   ├── pages/     # Páginas de la aplicación
│   │   │   └── styles/    # Estilos Tailwind CSS
│   │   └── dist/          # Build de producción (generado)
│   └── README.md          # Documentación completa de la app Electron
│
└── Gestión Taller.html    # Archivo HTML del proyecto original
```

## 🎯 Dos Soluciones Disponibles

### 1. Google Sheets + Apps Script (`/contabilidad`)

**Estado**: Implementado y funcional  
**Tecnología**: Google Sheets, Google Apps Script  
**Ventajas**:
- ✅ Accesible desde cualquier dispositivo con internet
- ✅ Sin instalación requerida
- ✅ Colaboración en tiempo real
- ✅ Backups automáticos en Google Drive
- ✅ Integración nativa con Gmail y Drive

**Ideal para**:
- Usuarios que prefieren hojas de cálculo
- Acceso multi-dispositivo desde la nube
- Colaboración entre múltiples usuarios

**Ver**: [contabilidad/README.md](contabilidad/README.md)

---

### 2. Aplicación de Escritorio Electron (`/electron-app`) 🆕

**Estado**: Fase 1 MVP completado (sin OCR)  
**Tecnología**: Electron, React, SQLite  
**Ventajas**:
- ✅ Datos 100% locales y privados
- ✅ Funciona sin conexión a internet
- ✅ Interfaz moderna y responsiva
- ✅ Mayor control sobre los datos
- ✅ Rendimiento superior
- ✅ Multiplataforma (Windows, macOS, Linux)

**Ideal para**:
- Usuarios que valoran la privacidad
- Trabajo sin conexión
- Gestión de datos sensibles
- Mayor personalización

**Ver**: [electron-app/README.md](electron-app/README.md)

## 🚀 Fase 1 vs Fase 2

### Fase 1 - MVP (✅ Completado)
Implementación funcional completa sin OCR:

- **Gestión de Proveedores**: CRUD completo
- **Facturas Recibidas**: Entrada manual con generación automática de asientos
- **Gastos**: Registro y categorización
- **Informes**: P&L mensual y resumen IVA con exportación a CSV
- **Backups**: Sistema de copias de seguridad
- **Base de Datos**: SQLite con plan contable precargado

### Fase 2 - OCR (🔜 Planificado)
Mejoras previstas:

- **OCR con Tesseract**: Extracción automática de datos de PDFs
- **Procesamiento de Facturas**: Importación automática desde archivos
- **Validación Inteligente**: Revisión y corrección de datos extraídos
- **Mejoras UI**: Dashboard mejorado con gráficos
- **Gestión de Ingresos**: Módulo de facturación
- **Clientes**: Gestión de clientes y facturas emitidas

## 🔄 ¿Cuál Usar?

| Característica | Google Sheets | Electron App |
|----------------|---------------|--------------|
| **Instalación** | No requerida | Sí (Node.js) |
| **Internet** | Necesario | No necesario |
| **Privacidad** | En la nube | 100% local |
| **Colaboración** | Sí, nativa | No (por ahora) |
| **Personalización** | Limitada | Alta |
| **Automatización** | Apps Script | IPC nativo |
| **Backups** | Automáticos | Manuales |
| **OCR** | No | Fase 2 |
| **Rendimiento** | Bueno | Excelente |

## 📚 Documentación

- **Google Sheets Solution**: [contabilidad/README.md](contabilidad/README.md)
- **Electron App**: [electron-app/README.md](electron-app/README.md)
  - Instalación y configuración
  - Guía de uso detallada
  - Scripts de desarrollo y empaquetado
  - Solución de problemas
  - Roadmap Fase 2

## 🤝 Contribución

Este es un proyecto en desarrollo activo. Para contribuir:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/MiMejora`)
3. Commit tus cambios (`git commit -m 'Añadir MiMejora'`)
4. Push a la rama (`git push origin feature/MiMejora`)
5. Abre un Pull Request

## 📝 Estado del Proyecto

- **Google Sheets Solution**: ✅ Estable y en uso
- **Electron App Fase 1**: ✅ MVP completo - Listo para revisión
- **Electron App Fase 2**: 🔜 En planificación - OCR pendiente

## 👨‍💻 Autor

**mbb66**
- GitHub: [@mbb66](https://github.com/mbb66)

## 📄 Licencia

MIT License - Ver LICENSE para detalles

## ⚠️ Aviso Legal

Ambas herramientas son sistemas de control y registro contable para uso interno. **No sustituyen el trabajo profesional de un gestor o asesor fiscal**. Siempre consulta con tu gestoría para:

- Liquidaciones de IVA
- Declaraciones fiscales
- Interpretación de normativa contable
- Optimización fiscal

---

**¿Tienes preguntas?** Abre un [issue en GitHub](https://github.com/mbb66/1111/issues)
