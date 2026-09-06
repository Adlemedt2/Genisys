import {
    BrowserRouter,
    Routes,
    Route,
} from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import Catalogos from './pages/Catalogos';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';

import Inventario from './pages/Inventario';
import Compras from './pages/Compras';
import Ventas from './pages/Ventas';
import Produccion from './pages/Produccion';
import Contabilidad from './pages/Contabilidad';
import Reportes from './pages/Reportes';

import Configuracion from './pages/Configuracion';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import AccesoDenegado from './pages/AccesoDenegado';


function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =================================================
                    LOGIN
                ================================================= */}

                <Route
                    path="/"
                    element={<Login />}
                />

                {/* =================================================
                    ACCESO DENEGADO
                ================================================= */}

                <Route
                    path="/acceso-denegado"
                    element={
                        <ProtectedRoute>
                            <AccesoDenegado />
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    RUTAS PROTEGIDAS
                ================================================= */}

                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >

                    {/* =============================================
                        DASHBOARD
                    ============================================= */}

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    {/* =============================================
                        CATÁLOGOS
                    ============================================= */}

                    <Route
                        path="/catalogos"
                        element={
                            <ProtectedRoute
                                funcionalidad="catalogos"
                                permiso="productos.ver"
                            >
                                <Catalogos />
                            </ProtectedRoute>
                        }
                    />

                    {/* =============================================
                        PRODUCTOS
                    ============================================= */}

                    <Route
                        path="/catalogos/productos"
                        element={
                            <ProtectedRoute
                                funcionalidad="catalogos"
                                permiso="productos.ver"
                            >
                                <Productos />
                            </ProtectedRoute>
                        }
                    />

                    {/* =============================================
                        INVENTARIO
                    ============================================= */}

                    <Route
                        path="/inventario"
                        element={
                            <ProtectedRoute
                                funcionalidad="inventario"
                                permiso="inventario.ver"
                            >
                                <Inventario />
                            </ProtectedRoute>
                        }
                    />

                    {/* =============================================
                        COMPRAS
                    ============================================= */}

                    <Route
                        path="/compras"
                        element={
                            <ProtectedRoute
                                funcionalidad="compras"
                                permiso="compras.ver"
                            >
                                <Compras />
                            </ProtectedRoute>
                        }
                    />

                    {/* =============================================
                        VENTAS
                    ============================================= */}

                    <Route
                        path="/ventas"
                        element={
                            <ProtectedRoute
                                funcionalidad="ventas"
                                permiso="ventas.ver"
                            >
                                <Ventas />
                            </ProtectedRoute>
                        }
                    />

                    {/* =============================================
                        PRODUCCIÓN
                    ============================================= */}

                    <Route
                        path="/produccion"
                        element={
                            <ProtectedRoute
                                funcionalidad="produccion"
                                permiso="produccion.ver"
                            >
                                <Produccion />
                            </ProtectedRoute>
                        }
                    />

                    {/* =============================================
                        CONTABILIDAD
                    ============================================= */}

                    <Route
                        path="/contabilidad"
                        element={
                            <ProtectedRoute
                                funcionalidad="contabilidad"
                                permiso="contabilidad.ver"
                            >
                                <Contabilidad />
                            </ProtectedRoute>
                        }
                    />

                    {/* =============================================
                        REPORTES
                    ============================================= */}

                    <Route
                        path="/reportes"
                        element={
                            <ProtectedRoute
                                funcionalidad="reportes"
                                permiso="reportes.ver"
                            >
                                <Reportes />
                            </ProtectedRoute>
                        }
                    />

                    {/* =============================================
                        CLIENTES
                    ============================================= */}

                    <Route
                        path="/catalogos/clientes"
                        element={
                            <ProtectedRoute
                                funcionalidad="catalogos"
                                permiso="clientes.ver"
                            >
                                <Clientes />
                            </ProtectedRoute>
                        }
                    />

                    {/* =============================================
                        CONFIGURACIÓN
                    ============================================= */}

                    <Route
                        path="/configuracion"
                        element={
                            <Configuracion />
                        }
                    />

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;