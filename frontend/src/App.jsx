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
import Usuarios from './pages/Usuarios';
import Productos from './pages/Productos';

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =========================================
                    LOGIN
                ========================================= */}

                <Route
                    path="/"
                    element={<Login />}
                />


                {/* =========================================
                    ÁREA PROTEGIDA
                ========================================= */}

                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >

                    {/* DASHBOARD */}

                    <Route
                        path="/dashboard"
                        element={
                            <Dashboard />
                        }
                    />


                    {/* CATÁLOGOS */}

                    <Route
                        path="/catalogos"
                        element={
                            <ProtectedRoute permiso="productos.ver">
                                <Catalogos />
                            </ProtectedRoute>
                        }
                    />


                    {/* INVENTARIO */}

                    <Route
                        path="/inventario"
                        element={
                            <ProtectedRoute permiso="inventario.ver">
                                <Inventario />
                            </ProtectedRoute>
                        }
                    />


                    {/* COMPRAS */}

                    <Route
                        path="/compras"
                        element={
                            <ProtectedRoute permiso="compras.ver">
                                <Compras />
                            </ProtectedRoute>
                        }
                    />


                    {/* VENTAS */}

                    <Route
                        path="/ventas"
                        element={
                            <ProtectedRoute permiso="ventas.ver">
                                <Ventas />
                            </ProtectedRoute>
                        }
                    />

                    {/* PRODUCTOS */}
                    <Route
                        path="/catalogos/productos"
                        element={
                            <ProtectedRoute permiso="productos.ver">
                                <Productos />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* PRODUCCIÓN */}

                    <Route
                        path="/produccion"
                        element={
                            <ProtectedRoute permiso="produccion.ver">
                                <Produccion />
                            </ProtectedRoute>
                        }
                    />


                    {/* CONTABILIDAD */}

                    <Route
                        path="/contabilidad"
                        element={
                            <ProtectedRoute permiso="contabilidad.ver">
                                <Contabilidad />
                            </ProtectedRoute>
                        }
                    />


                    {/* REPORTES */}

                    <Route
                        path="/reportes"
                        element={
                            <ProtectedRoute permiso="reportes.ver">
                                <Reportes />
                            </ProtectedRoute>
                        }
                    />


                    {/* CONFIGURACIÓN */}

                    <Route
                        path="/configuracion"
                        element={
                            <ProtectedRoute permiso="empresa.ver">
                                <Configuracion />
                            </ProtectedRoute>
                        }
                    />


                    {/* TIPOS DE NEGOCIO */}

                    <Route
                        path="/tipos-negocio"
                        element={
                            <ProtectedRoute permiso="tipos_negocio.ver">
                                <TiposNegocio />
                            </ProtectedRoute>
                        }
                    />


                    {/* USUARIOS */}

                    <Route
                        path="/usuarios"
                        element={
                            <ProtectedRoute permiso="usuarios.ver">
                                <Usuarios />
                            </ProtectedRoute>
                        }
                    />

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;