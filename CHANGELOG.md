# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added - 2026-01-27

#### Calendar Filter Improvements
- **Multi-select Filter System**: Replaced single-select dropdowns with multi-select checkboxes for better control over calendar visibility
  - ✨ **Todos** (All): Select all filters at once
  - 📦 **Vestidos Enviados** (Sent Dresses): Show dresses that have been sent and have production hours
  - 🚚 **Albaranes** (Delivery Notes): Show dresses that were sent WITHOUT production (shipment only, no intervals)
  - ⏰ **Fecha Fin** (End Date): Show dresses based on their deadline date
  - ⚙️ **En Proceso** (In Process): Show dresses with assigned work intervals or in automatic planning
  - ❌ **Ninguno** (None): Deselect all filters to hide all dresses
- Multiple filters can be active simultaneously for granular control
- Filter state persists and updates calendar in real-time

#### Delete Button Validation
- **Enhanced Deletion Safety**: Added validation to prevent accidental deletion of important dresses
  - ❌ Cannot delete dresses already marked as "enviado" (sent) or "pagado" (paid)
  - ❌ Cannot delete dresses with assigned work intervals (horasConfeccion)
  - ✅ Can delete dresses from automatic planning if they meet criteria
  - ✅ Can delete dresses with "Fecha Fin" (deadline) if they have no intervals and are not sent
- Clear error messages inform users why deletion is blocked
- Error messages guide users to remove intervals first before deleting

### Technical Details

**Filter Implementation**:
- Filter state managed in `filtrosCalendarioActivos` object with boolean flags
- `aplicarFiltrosCalendario()` reads checkbox states and updates calendar display
- `toggleFiltroTodos()` enables all filters simultaneously
- `toggleFiltroNinguno()` disables all filters simultaneously
- `onIndividualFilterChange()` manages "Todos" and "Ninguno" state when individual filters change
- `obtenerVestidosParaFecha()` categorizes dresses and applies active filters

**Delete Button Validation**:
- `eliminarPartePlanificada()` now checks:
  1. Dress exists in system
  2. Dress state (not enviado/pagado)
  3. Assigned intervals (horasConfeccion)
- Validation occurs before confirmation dialog
- Users receive specific error messages indicating why deletion failed

### Testing

To test the new features:

1. **Testing Filters**:
   - Navigate to Planificación → Vista de Calendario
   - Click "✨ Todos" to enable all filters
   - Click "❌ Ninguno" to disable all filters
   - Select individual filters to see specific dress categories
   - Verify calendar updates in real-time as filters change

2. **Testing Delete Button**:
   - Add a dress to automatic planning
   - Verify you can delete it (no intervals, not sent)
   - Assign work intervals to a dress
   - Try to delete - should show error about intervals
   - Mark a dress as "enviado"
   - Try to delete - should show error about sent status

### Known Limitations

- "Albaranes" category shows dresses with `fechaEnvio` but WITHOUT `horasConfeccion` intervals
- Filters apply only to calendar view, not to "En Taller" or "En Proceso" panels
- Filter state is not persisted across page reloads
