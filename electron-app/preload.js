const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs de manera segura al proceso de renderizado
contextBridge.exposeInMainWorld('api', {
  // Proveedores
  proveedores: {
    getAll: () => ipcRenderer.invoke('proveedores:getAll'),
    getById: (id) => ipcRenderer.invoke('proveedores:getById', id),
    create: (proveedor) => ipcRenderer.invoke('proveedores:create', proveedor),
    update: (id, proveedor) => ipcRenderer.invoke('proveedores:update', id, proveedor),
    delete: (id) => ipcRenderer.invoke('proveedores:delete', id)
  },
  
  // Facturas
  facturas: {
    getAll: (filters) => ipcRenderer.invoke('facturas:getAll', filters),
    create: (factura) => ipcRenderer.invoke('facturas:create', factura),
    update: (id, factura) => ipcRenderer.invoke('facturas:update', id, factura)
  },
  
  // Gastos
  gastos: {
    getAll: (filters) => ipcRenderer.invoke('gastos:getAll', filters),
    create: (gasto) => ipcRenderer.invoke('gastos:create', gasto),
    getCategorias: () => ipcRenderer.invoke('gastos:getCategorias')
  },
  
  // Informes
  informes: {
    getPyL: (periodo) => ipcRenderer.invoke('informes:getPyL', periodo),
    getIVA: (periodo) => ipcRenderer.invoke('informes:getIVA', periodo)
  },
  
  // Plan Contable
  planContable: {
    getAll: () => ipcRenderer.invoke('planContable:getAll')
  },
  
  // Backups
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    getAll: () => ipcRenderer.invoke('backup:getAll')
  },
  
  // Exportar
  export: {
    csv: (data, fileName) => ipcRenderer.invoke('export:csv', { data, fileName })
  },
  
  // Asientos
  asientos: {
    getByFactura: (facturaId) => ipcRenderer.invoke('asientos:getByFactura', facturaId)
  }
});
