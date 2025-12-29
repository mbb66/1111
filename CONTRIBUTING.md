# Guía de Contribución

¡Gracias por tu interés en contribuir al proyecto de Contabilidad para Taller! 

## 📋 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código:

- Sé respetuoso y considerado
- Acepta críticas constructivas
- Enfócate en lo que es mejor para la comunidad
- Muestra empatía hacia otros miembros de la comunidad

## 🚀 Cómo Contribuir

### Reportar Bugs

Si encuentras un bug, por favor abre un issue con:

1. **Título descriptivo** del problema
2. **Pasos para reproducir** el bug
3. **Comportamiento esperado** vs comportamiento actual
4. **Screenshots** si es aplicable
5. **Entorno**: Sistema operativo, versión de Node.js, etc.

### Sugerir Mejoras

Para sugerir nuevas funcionalidades o mejoras:

1. Verifica que no exista un issue similar
2. Abre un issue describiendo:
   - El problema que resuelve
   - Cómo mejoraría la experiencia del usuario
   - Posible implementación (opcional)

### Pull Requests

1. **Fork** el repositorio
2. **Crea una rama** desde `main`:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```
3. **Haz tus cambios** siguiendo las guías de estilo
4. **Prueba tus cambios**:
   ```bash
   cd electron-app/app
   npm run lint
   npm run build
   ```
5. **Commit** con mensajes descriptivos:
   ```bash
   git commit -m "feat: añadir validación de CIF en proveedores"
   ```
6. **Push** a tu fork:
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```
7. **Abre un Pull Request** describiendo:
   - Qué cambia el PR
   - Por qué es necesario
   - Cómo se probó

## 💻 Configuración de Desarrollo

### Prerequisitos

- Node.js 18+ 
- npm 9+
- Git

### Setup

```bash
# Clonar el repositorio
git clone https://github.com/mbb66/1111.git
cd 1111/electron-app

# Instalar dependencias
npm install
cd app && npm install && cd ..

# Ejecutar en modo desarrollo
npm run dev
```

## 📝 Guías de Estilo

### JavaScript/React

- Usar ESLint y Prettier configurados en el proyecto
- Seguir convenciones de React Hooks
- Nombres de componentes en PascalCase
- Nombres de archivos coinciden con el componente principal
- Comentarios JSDoc para funciones complejas

### Git Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formato, punto y coma faltantes, etc.
- `refactor:` Refactorización de código
- `test:` Añadir tests
- `chore:` Mantenimiento, actualizar dependencias

Ejemplos:
```
feat(facturas): añadir validación de número de factura
fix(db): corregir migración de plan contable
docs(readme): actualizar instrucciones de instalación
```

### SQL

- Nombres de tablas en minúsculas y snake_case
- Usar `IF NOT EXISTS` en CREATE TABLE
- Siempre especificar tipos de datos
- Añadir índices para campos frecuentemente consultados

## 🧪 Tests

Actualmente el proyecto no tiene tests automatizados. Las contribuciones en esta área son muy bienvenidas.

Para futuras implementaciones:
- Tests unitarios con Jest
- Tests de integración con React Testing Library
- Tests E2E con Playwright

## 📚 Documentación

- Actualiza el README cuando cambies funcionalidad
- Añade comentarios para lógica compleja
- Documenta APIs y funciones públicas
- Mantén ejemplos de código actualizados

## 🔍 Proceso de Revisión

1. Un mantenedor revisará tu PR
2. Puede solicitar cambios
3. Una vez aprobado, se hará merge
4. Tu contribución será parte del proyecto 🎉

## 🙋 ¿Necesitas Ayuda?

- **Issues**: Para bugs y sugerencias
- **Discussions**: Para preguntas generales
- **Email**: Para temas privados o sensibles

## 📜 Licencia

Al contribuir, aceptas que tus contribuciones se licenciarán bajo la misma licencia MIT del proyecto.

---

¡Gracias por hacer este proyecto mejor! 🚀
