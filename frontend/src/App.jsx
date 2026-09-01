import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catalogos from './pages/Catalogos';
import Inventario from './pages/Inventario';
import Compras from './pages/Compras';
import Ventas from './pages/Ventas';
import Produccion from './pages/Produccion';
import Contabilidad from './pages/Contabilidad';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import TiposNegocio from './pages/TiposNegocio';

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Login />} />

                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/catalogos" element={<Catalogos />} />
                    <Route path="/inventario" element={<Inventario />} />
                    <Route path="/compras" element={<Compras />} />
                    <Route path="/ventas" element={<Ventas />} />
                    <Route path="/produccion" element={<Produccion />} />
                    <Route path="/contabilidad" element={<Contabilidad />} />
                    <Route path="/reportes" element={<Reportes />} />
                    <Route path="/configuracion" element={<Configuracion />} />
                    <Route path="/tipos-negocio" element={<TiposNegocio />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;