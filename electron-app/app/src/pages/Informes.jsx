import { useState } from 'react';

export default function Informes() {
  const [activeTab, setActiveTab] = useState('pyl');
  const [pylData, setPylData] = useState(null);
  const [ivaData, setIvaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState({
    desde: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    hasta: new Date().toISOString().split('T')[0],
  });

  const generarInformePyL = async () => {
    try {
      setLoading(true);
      const result = await window.api.informes.getPyL(periodo);
      if (result.success) {
        setPylData(result.data);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error generating P&L report:', error);
      alert('Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

  const generarInformeIVA = async () => {
    try {
      setLoading(true);
      const result = await window.api.informes.getIVA(periodo);
      if (result.success) {
        setIvaData(result.data);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error generating IVA report:', error);
      alert('Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

  const exportarPyLACSV = async () => {
    if (!pylData) return;

    let csv = 'Informe de Pérdidas y Ganancias\n\n';
    csv += `Periodo: ${new Date(periodo.desde).toLocaleDateString('es-ES')} - ${new Date(periodo.hasta).toLocaleDateString('es-ES')}\n\n`;
    csv += 'GASTOS\n';
    csv += 'Categoría,Total\n';
    pylData.gastos.forEach((g) => {
      csv += `${g.categoria},${g.total.toFixed(2)}\n`;
    });
    csv += `\nTotal Gastos,${pylData.totalGastos.toFixed(2)}\n\n`;
    csv += 'INGRESOS\n';
    csv += 'Concepto,Total\n';
    csv += `Total Ingresos,${pylData.totalIngresos.toFixed(2)}\n\n`;
    csv += `\nRESULTADO DEL PERIODO,${pylData.resultado.toFixed(2)}\n`;

    try {
      const result = await window.api.export.csv(
        csv,
        `informe_pyl_${periodo.desde}_${periodo.hasta}.csv`
      );
      if (result.success) {
        alert('Informe exportado correctamente');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error al exportar el informe');
    }
  };

  const exportarIVAACSV = async () => {
    if (!ivaData) return;

    let csv = 'Informe de IVA Soportado\n\n';
    csv += `Periodo: ${new Date(periodo.desde).toLocaleDateString('es-ES')} - ${new Date(periodo.hasta).toLocaleDateString('es-ES')}\n\n`;
    csv += 'DETALLE POR TIPO DE IVA\n';
    csv += 'Tipo IVA (%),Base Imponible,Cuota IVA,Número Facturas\n';
    ivaData.detallesPorTipo.forEach((d) => {
      csv += `${d.tipo_iva},${d.total_base.toFixed(2)},${d.total_cuota.toFixed(2)},${d.num_facturas}\n`;
    });
    csv += `\nTOTALES\n`;
    csv += `Total Base,${ivaData.totales.base_total?.toFixed(2) || '0.00'}\n`;
    csv += `Total Cuota IVA,${ivaData.totales.cuota_total?.toFixed(2) || '0.00'}\n`;
    csv += `Total Facturas,${ivaData.totales.total_facturas || 0}\n`;

    try {
      const result = await window.api.export.csv(
        csv,
        `informe_iva_${periodo.desde}_${periodo.hasta}.csv`
      );
      if (result.success) {
        alert('Informe exportado correctamente');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error al exportar el informe');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Informes</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pyl')}
            className={`${
              activeTab === 'pyl'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pérdidas y Ganancias
          </button>
          <button
            onClick={() => setActiveTab('iva')}
            className={`${
              activeTab === 'iva'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Resumen IVA
          </button>
        </nav>
      </div>

      {/* Selector de período */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Seleccionar Período</h2>
        <div className="grid grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={periodo.desde}
              onChange={(e) => setPeriodo({ ...periodo, desde: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={periodo.hasta}
              onChange={(e) => setPeriodo({ ...periodo, hasta: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <button
              onClick={activeTab === 'pyl' ? generarInformePyL : generarInformeIVA}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded disabled:bg-gray-400"
            >
              {loading ? 'Generando...' : 'Generar Informe'}
            </button>
          </div>
        </div>
      </div>

      {/* Informe P&L */}
      {activeTab === 'pyl' && pylData && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Informe de Pérdidas y Ganancias</h2>
            <button
              onClick={exportarPyLACSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              📥 Exportar CSV
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Período: {new Date(pylData.periodo.desde).toLocaleDateString('es-ES')} -{' '}
              {new Date(pylData.periodo.hasta).toLocaleDateString('es-ES')}
            </p>
          </div>

          {/* Gastos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-red-600">GASTOS</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pylData.gastos.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                      Sin gastos en este período
                    </td>
                  </tr>
                ) : (
                  pylData.gastos.map((gasto, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {gasto.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {gasto.total.toFixed(2)} €
                      </td>
                    </tr>
                  ))
                )}
                <tr className="bg-red-50 font-semibold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Total Gastos
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {pylData.totalGastos.toFixed(2)} €
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Ingresos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-green-600">INGRESOS</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Concepto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-gray-500 text-sm">
                    No se registran ingresos en la Fase 1 MVP
                  </td>
                </tr>
                <tr className="bg-green-50 font-semibold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Total Ingresos
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {pylData.totalIngresos.toFixed(2)} €
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Resultado */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">RESULTADO DEL PERÍODO</span>
              <span
                className={`text-2xl font-bold ${
                  pylData.resultado >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {pylData.resultado.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Informe IVA */}
      {activeTab === 'iva' && ivaData && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Resumen de IVA Soportado</h2>
            <button
              onClick={exportarIVAACSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              📥 Exportar CSV
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Período: {new Date(ivaData.periodo.desde).toLocaleDateString('es-ES')} -{' '}
              {new Date(ivaData.periodo.hasta).toLocaleDateString('es-ES')}
            </p>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo IVA (%)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Base Imponible
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Cuota IVA
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Nº Facturas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ivaData.detallesPorTipo.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Sin facturas en este período
                  </td>
                </tr>
              ) : (
                ivaData.detallesPorTipo.map((detalle, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {detalle.tipo_iva}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {detalle.total_base.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {detalle.total_cuota.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {detalle.num_facturas}
                    </td>
                  </tr>
                ))
              )}
              <tr className="bg-primary-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TOTALES</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {ivaData.totales.base_total?.toFixed(2) || '0.00'} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {ivaData.totales.cuota_total?.toFixed(2) || '0.00'} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {ivaData.totales.total_facturas || 0}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              ℹ️ Este resumen muestra el IVA soportado (facturas de compras) que puede ser
              deducible. Consulta con tu gestoría para la liquidación de IVA.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
