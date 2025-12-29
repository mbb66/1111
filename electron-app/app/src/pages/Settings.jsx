import { useState, useEffect } from 'react';

export default function Settings() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const result = await window.api.backup.getAll();
      if (result.success) {
        setBackups(result.data);
      }
    } catch (error) {
      console.error('Error loading backups:', error);
    }
  };

  const crearBackup = async () => {
    try {
      setLoading(true);
      const result = await window.api.backup.create();
      if (result.success) {
        alert(
          `Backup creado correctamente:\n${result.data.fileName}\nTamaño: ${(result.data.size / 1024).toFixed(2)} KB`
        );
        await loadBackups();
      } else {
        alert('Error al crear backup: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Error al crear el backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Configuración</h1>

      {/* Información de la aplicación */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Información de la Aplicación</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Versión:</span>
            <span className="font-medium">1.0.0 - Fase 1 MVP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fase:</span>
            <span className="font-medium">Fase 1 (Sin OCR)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Base de datos:</span>
            <span className="font-medium">SQLite (local)</span>
          </div>
        </div>
      </div>

      {/* Backups */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Copias de Seguridad</h2>
          <button
            onClick={crearBackup}
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? 'Creando...' : '💾 Crear Backup'}
          </button>
        </div>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            ℹ️ Se recomienda crear backups periódicamente. Los backups se guardan en la carpeta
            de datos de la aplicación.
          </p>
        </div>

        {backups.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay backups creados aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre de Archivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descripción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(backup.created_at).toLocaleString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono text-xs">
                      {backup.nombre_archivo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {backup.tamano_bytes ? (backup.tamano_bytes / 1024).toFixed(2) + ' KB' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.descripcion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nota sobre Fase 2 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2 text-yellow-800">🚧 Próxima Fase</h2>
        <p className="text-sm text-yellow-700 mb-2">
          Este es el MVP de la Fase 1. La Fase 2 incluirá:
        </p>
        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
          <li>Integración de OCR con Tesseract para extracción automática de datos de facturas</li>
          <li>Procesamiento automático de PDFs de facturas</li>
          <li>Mejoras en la interfaz de usuario</li>
          <li>Gestión de ingresos y clientes</li>
          <li>Más opciones de informes y análisis</li>
        </ul>
      </div>

      {/* Seguridad */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Seguridad y Privacidad</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-green-600 text-xl">✓</span>
            <div>
              <p className="font-medium">Datos locales</p>
              <p className="text-sm text-gray-600">
                Toda la información se almacena localmente en tu equipo
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-600 text-xl">✓</span>
            <div>
              <p className="font-medium">Sin conexión a internet requerida</p>
              <p className="text-sm text-gray-600">
                La aplicación funciona completamente offline
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gray-400 text-xl">○</span>
            <div>
              <p className="font-medium text-gray-600">Cifrado de base de datos (opcional)</p>
              <p className="text-sm text-gray-600">
                Disponible mediante configuración manual (ver README)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
