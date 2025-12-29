import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Proveedores from './pages/Proveedores';
import Facturas from './pages/Facturas';
import Gastos from './pages/Gastos';
import Informes from './pages/Informes';
import Settings from './pages/Settings';

function App() {
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className={`${menuOpen ? 'w-64' : 'w-20'} bg-primary-800 text-white transition-all duration-300 flex flex-col`}>
          <div className="p-4 border-b border-primary-700">
            <div className="flex items-center justify-between">
              {menuOpen && <h1 className="text-xl font-bold">Contabilidad</h1>}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-primary-700 rounded"
              >
                {menuOpen ? '«' : '»'}
              </button>
            </div>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <NavItem to="/" icon="📊" text="Dashboard" menuOpen={menuOpen} />
              <NavItem to="/proveedores" icon="🏢" text="Proveedores" menuOpen={menuOpen} />
              <NavItem to="/facturas" icon="📄" text="Facturas" menuOpen={menuOpen} />
              <NavItem to="/gastos" icon="💰" text="Gastos" menuOpen={menuOpen} />
              <NavItem to="/informes" icon="📈" text="Informes" menuOpen={menuOpen} />
              <NavItem to="/settings" icon="⚙️" text="Configuración" menuOpen={menuOpen} />
            </ul>
          </nav>
          
          <div className="p-4 border-t border-primary-700 text-sm">
            {menuOpen && <p className="text-primary-300">v1.0.0 - Fase 1 MVP</p>}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/facturas" element={<Facturas />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/informes" element={<Informes />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavItem({ to, icon, text, menuOpen }) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-primary-700 transition-colors"
      >
        <span className="text-xl">{icon}</span>
        {menuOpen && <span>{text}</span>}
      </Link>
    </li>
  );
}

export default App;
