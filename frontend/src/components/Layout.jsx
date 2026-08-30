import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    ShoppingBag,
    Factory,
    Calculator,
    BarChart3,
    Tags,
    Settings,
    LogOut,
    Bell,
    ChevronDown,
} from 'lucide-react';

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Layout() {
    const navigate = useNavigate();

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');

    const cerrarSesion = async () => {
        try {
            await api.post(
                '/logout',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');

            navigate('/', { replace: true });
        }
    };

    const menuPrincipal = [
        {
            nombre: 'Dashboard',
            ruta: '/dashboard',
            icono: LayoutDashboard,
        },
        {
            nombre: 'Catálogos',
            ruta: '/catalogos',
            icono: Tags,
        },
        {
            nombre: 'Inventario',
            ruta: '/inventario',
            icono: Package,
        },
        {
            nombre: 'Compras',
            ruta: '/compras',
            icono: ShoppingBag,
        },
        {
            nombre: 'Ventas',
            ruta: '/ventas',
            icono: ShoppingCart,
        },
        {
            nombre: 'Producción',
            ruta: '/produccion',
            icono: Factory,
        },
        {
            nombre: 'Contabilidad',
            ruta: '/contabilidad',
            icono: Calculator,
        },
        {
            nombre: 'Reportes',
            ruta: '/reportes',
            icono: BarChart3,
        },
    ];

    return (
        <div className="app-layout">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="sidebar-logo">

                    <div className="logo-icon">
                        G
                    </div>

                    <div>
                        <h1>GENISYS</h1>
                        <span>Gestión empresarial</span>
                    </div>

                </div>


                <div className="menu-title">
                    MENÚ PRINCIPAL
                </div>


                <nav className="sidebar-menu">

                    {menuPrincipal.map((item) => {

                        const Icono = item.icono;

                        return (
                            <NavLink
                                key={item.ruta}
                                to={item.ruta}
                                className={({ isActive }) =>
                                    isActive
                                        ? 'menu-item active'
                                        : 'menu-item'
                                }
                            >

                                <Icono size={19} />

                                <span>
                                    {item.nombre}
                                </span>

                            </NavLink>
                        );

                    })}

                </nav>


                <div className="sidebar-bottom">

                    <NavLink
                        to="/configuracion"
                        className="menu-item"
                    >
                        <Settings size={19} />
                        <span>Configuración</span>
                    </NavLink>


                    <button
                        className="logout-button"
                        onClick={cerrarSesion}
                    >
                        <LogOut size={19} />
                        <span>Cerrar sesión</span>
                    </button>

                </div>

            </aside>


            {/* ÁREA PRINCIPAL */}

            <div className="main-area">

                {/* HEADER */}

                <header className="topbar">

                    <div className="topbar-left">
                        <span className="topbar-title">
                            Sistema de gestión empresarial
                        </span>
                    </div>


                    <div className="topbar-right">

                        <button className="notification-button">
                            <Bell size={20} />
                            <span className="notification-dot"></span>
                        </button>


                        <div className="user-profile">

                            <div className="user-avatar">
                                {usuario?.name?.charAt(0).toUpperCase()}
                            </div>

                            <div className="user-info">

                                <strong>
                                    {usuario?.name}
                                </strong>

                                <span>
                                    {usuario?.roles?.join(', ')}
                                </span>

                            </div>

                            <ChevronDown size={16} />

                        </div>

                    </div>

                </header>


                {/* CONTENIDO */}

                <main className="content-area">

                    <Outlet />

                </main>

            </div>

        </div>
    );
}

export default Layout;