import { useState, useEffect } from 'react';

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    categoria: '',
    subcategoria: '',
    descripcion: '',
    importe: '',
    proveedor_id: '',
    forma_pago: 'efectivo',
    notas: '',
  });

  const CATEGORIAS_DEFAULT = [
    'Suministros',
    'Reparaciones',
    'Servicios profesionales',
    'Transportes',
    'Seguros',
    'Publicidad',
    'Otros servicios',
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gastosRes, proveedoresRes, categoriasRes] = await Promise.all([
        window.api.gastos.getAll({}),
        window.api.proveedores.getAll(),
        window.api.gastos.getCategorias(),
      ]);

      if (gastosRes.success) setGastos(gastosRes.data);
      if (proveedoresRes.success) setProveedores(proveedoresRes.data);
      
      // Combinar categorías de la BD con las por defecto
      const allCategorias = categoriasRes.success 
        ? [...new Set([...CATEGORIAS_DEFAULT, ...categoriasRes.data])]
        : CATEGORIAS_DEFAULT;
      setCategorias(allCategorias);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await window.api.gastos.create({
        ...formData,
        importe: parseFloat(formData.importe),
        proveedor_id: formData.proveedor_id ? parseInt(formData.proveedor_id) : null,
      });

      if (result.success) {
        alert('Gasto guardado correctamente');
        await loadData();
        resetForm();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving gasto:', error);
      alert('Error al guardar el gasto');
    }
  };

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      categoria: '',
      subcategoria: '',
      descripcion: '',
      importe: '',
      proveedor_id: '',
      forma_pago: 'efectivo',
      notas: '',
    });
    setShowForm(false);
  };

  const getTotalGastos = () => {
    return gastos.reduce((sum, gasto) => sum + gasto.importe, 0);
  };

  const getGastosPorCategoria = () => {
    const grupos = {};
    gastos.forEach((gasto) => {
      const cat = gasto.categoria || 'Sin categoría';
      if (!grupos[cat]) {
        grupos[cat] = { total: 0, count: 0 };
      }
      grupos[cat].total += gasto.importe;
      grupos[cat].count += 1;
    });
    return Object.entries(grupos).map(([categoria, data]) => ({
      categoria,
      total: data.total,
      count: data.count,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Gastos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Gasto'}
        </button>
      </div>

      {/* Resumen de gastos por categoría */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Total Gastos</p>
          <p className="text-2xl font-bold text-gray-800">{getTotalGastos().toFixed(2)} €</p>
        </div>
        {getGastosPorCategoria()
          .slice(0, 3)
          .map((cat) => (
            <div key={cat.categoria} className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">{cat.categoria}</p>
              <p className="text-2xl font-bold text-gray-800">{cat.total.toFixed(2)} €</p>
              <p className="text-xs text-gray-500">{cat.count} gastos</p>
            </div>
          ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Nuevo Gasto</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Importe (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.importe}
                  onChange={(e) => setFormData({ ...formData, importe: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <input
                  type="text"
                  required
                  list="categorias"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <datalist id="categorias">
                  {categorias.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategoría
                </label>
                <input
                  type="text"
                  value={formData.subcategoria}
                  onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <input
                  type="text"
                  required
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor (opcional)
                </label>
                <select
                  value={formData.proveedor_id}
                  onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Sin proveedor</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pago
                </label>
                <select
                  value={formData.forma_pago}
                  onChange={(e) => setFormData({ ...formData, forma_pago: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Importe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Forma Pago
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gastos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No hay gastos registrados
                </td>
              </tr>
            ) : (
              gastos.map((gasto) => (
                <tr key={gasto.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(gasto.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{gasto.descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {gasto.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {gasto.proveedor_nombre || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {gasto.importe.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {gasto.forma_pago}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
