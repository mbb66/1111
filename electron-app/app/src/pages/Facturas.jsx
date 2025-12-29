import { useState, useEffect } from 'react';

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [formData, setFormData] = useState({
    proveedor_id: '',
    numero_factura: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    base_imponible: '',
    tipo_iva: '21',
    cuota_iva: '',
    total: '',
    descripcion: '',
    categoria: 'Compras',
    notas: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [facturasRes, proveedoresRes] = await Promise.all([
        window.api.facturas.getAll({}),
        window.api.proveedores.getAll(),
      ]);

      if (facturasRes.success) setFacturas(facturasRes.data);
      if (proveedoresRes.success) setProveedores(proveedoresRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularIVA = (base, tipoIva) => {
    const baseNum = parseFloat(base) || 0;
    const ivaNum = parseFloat(tipoIva) || 0;
    return (baseNum * ivaNum) / 100;
  };

  const handleBaseChange = (value) => {
    const base = parseFloat(value) || 0;
    const cuota = calcularIVA(base, formData.tipo_iva);
    setFormData({
      ...formData,
      base_imponible: value,
      cuota_iva: cuota,
      total: base + cuota,
    });
  };

  const handleTipoIvaChange = (value) => {
    const base = parseFloat(formData.base_imponible) || 0;
    const cuota = calcularIVA(base, value);
    setFormData({
      ...formData,
      tipo_iva: value,
      cuota_iva: cuota,
      total: base + cuota,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validar que el proveedor esté seleccionado
      if (!formData.proveedor_id) {
        alert('Debe seleccionar un proveedor');
        return;
      }

      const result = await window.api.facturas.create({
        ...formData,
        proveedor_id: parseInt(formData.proveedor_id),
        base_imponible: parseFloat(formData.base_imponible),
        tipo_iva: parseFloat(formData.tipo_iva),
        cuota_iva: parseFloat(formData.cuota_iva),
        total: parseFloat(formData.total),
      });

      if (result.success) {
        alert('Factura guardada y asientos generados correctamente');
        await loadData();
        resetForm();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving factura:', error);
      alert('Error al guardar la factura');
    }
  };

  const verAsientos = async (factura) => {
    try {
      const result = await window.api.asientos.getByFactura(factura.id);
      if (result.success) {
        setSelectedFactura({ ...factura, asientos: result.data });
      }
    } catch (error) {
      console.error('Error loading asientos:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      proveedor_id: '',
      numero_factura: '',
      fecha_emision: new Date().toISOString().split('T')[0],
      fecha_vencimiento: '',
      base_imponible: '',
      tipo_iva: '21',
      cuota_iva: '',
      total: '',
      descripcion: '',
      categoria: 'Compras',
      notas: '',
    });
    setShowForm(false);
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
        <h1 className="text-3xl font-bold text-gray-800">Facturas Recibidas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancelar' : '+ Nueva Factura'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Nueva Factura</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor *
                </label>
                <select
                  required
                  value={formData.proveedor_id}
                  onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Factura *
                </label>
                <input
                  type="text"
                  required
                  value={formData.numero_factura}
                  onChange={(e) =>
                    setFormData({ ...formData, numero_factura: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Emisión *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_emision}
                  onChange={(e) => setFormData({ ...formData, fecha_emision: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_vencimiento: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Imponible (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.base_imponible}
                  onChange={(e) => handleBaseChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo IVA (%) *
                </label>
                <select
                  required
                  value={formData.tipo_iva}
                  onChange={(e) => handleTipoIvaChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="21">21% (General)</option>
                  <option value="10">10% (Reducido)</option>
                  <option value="4">4% (Superreducido)</option>
                  <option value="0">0% (Exento)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuota IVA (€)
                </label>
                <input
                  type="text"
                  readOnly
                  value={(formData.cuota_iva || 0).toFixed(2)}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total (€)</label>
                <input
                  type="text"
                  readOnly
                  value={(formData.total || 0).toFixed(2)}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Compras">Compras</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Suministros">Suministros</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
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
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                ℹ️ Al guardar esta factura se generarán automáticamente los asientos contables
                (Base imponible + IVA soportado)
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
              >
                Guardar y Generar Asientos
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
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Base
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                IVA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {facturas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No hay facturas registradas
                </td>
              </tr>
            ) : (
              facturas.map((factura) => (
                <tr key={factura.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(factura.fecha_emision).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {factura.proveedor_nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {factura.numero_factura}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {factura.base_imponible.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {factura.cuota_iva.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {factura.total.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => verAsientos(factura)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Ver Asientos
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Asientos */}
      {selectedFactura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Asientos - Factura {selectedFactura.numero_factura}
                </h2>
                <button
                  onClick={() => setSelectedFactura(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Proveedor: <span className="font-medium">{selectedFactura.proveedor_nombre}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Fecha: <span className="font-medium">{new Date(selectedFactura.fecha_emision).toLocaleDateString('es-ES')}</span>
                </p>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Nº Asiento
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Debe
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Haber
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Importe
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Concepto
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedFactura.asientos?.map((asiento) => (
                    <tr key={asiento.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{asiento.numero_asiento}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{asiento.cuenta_debe}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{asiento.cuenta_haber}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {asiento.importe.toFixed(2)} €
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{asiento.concepto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
