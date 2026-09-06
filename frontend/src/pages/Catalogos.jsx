import {
    Package,
    Users,
    Truck,
    ChevronRight,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { tienePermiso } from '../utils/permisos';

function Catalogos() {
    const navigate = useNavigate();

    const catalogos = [
        {
            nombre: 'Productos',
            descripcion: 'Administra los productos y artículos del negocio.',
            icono: Package,
            ruta: '/catalogos/productos',
            permiso: 'productos.ver',
        },
        {
            nombre: 'Clientes',
            descripcion: 'Administra la información de los clientes.',
            icono: Users,
            ruta: '/catalogos/clientes',
            permiso: 'clientes.ver',
        },
        {
            nombre: 'Proveedores',
            descripcion: 'Administra la información de los proveedores.',
            icono: Truck,
            ruta: '/catalogos/proveedores',
            permiso: 'proveedores.ver',
        },
    ];

    const catalogosDisponibles = catalogos.filter((catalogo) =>
        tienePermiso(catalogo.permiso)
    );

    return (
        <div className="dashboard-page">

            <div className="dashboard-header">
                <div>
                    <h1>Catálogos</h1>

                    <p>
                        Administra la información principal de tu negocio.
                    </p>
                </div>
            </div>

            <div className="dashboard-grid">

                {catalogosDisponibles.map((catalogo) => {
                    const Icono = catalogo.icono;

                    return (
                        <button
                            key={catalogo.ruta}
                            type="button"
                            onClick={() => navigate(catalogo.ruta)}
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '14px',
                                padding: '24px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '18px',
                                width: '100%',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <div
                                style={{
                                    width: '52px',
                                    height: '52px',
                                    minWidth: '52px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f1f5f9',
                                    color: '#334155',
                                }}
                            >
                                <Icono size={25} />
                            </div>

                            <div
                                style={{
                                    flex: 1,
                                }}
                            >
                                <h2
                                    style={{
                                        margin: '0 0 6px',
                                        fontSize: '17px',
                                        color: '#1e293b',
                                    }}
                                >
                                    {catalogo.nombre}
                                </h2>

                                <p
                                    style={{
                                        margin: 0,
                                        color: '#64748b',
                                        fontSize: '13px',
                                        lineHeight: '1.5',
                                    }}
                                >
                                    {catalogo.descripcion}
                                </p>
                            </div>

                            <ChevronRight
                                size={20}
                                color="#94a3b8"
                            />
                        </button>
                    );
                })}

            </div>

            {catalogosDisponibles.length === 0 && (
                <div
                    className="dashboard-panel"
                    style={{
                        marginTop: '24px',
                        textAlign: 'center',
                    }}
                >
                    <div className="empty-state">
                        <Package size={42} />

                        <h3>
                            No tienes catálogos disponibles
                        </h3>

                        <p>
                            Tu usuario no tiene permisos para acceder
                            a los catálogos.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Catalogos;