import {
    ShoppingCart,
    ShoppingBag,
    Package,
    Users,
    AlertTriangle,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';

function Dashboard() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const tarjetas = [
        {
            titulo: 'Ventas del día',
            valor: '$0',
            cambio: 'Sin datos',
            positivo: true,
            icono: ShoppingCart,
        },
        {
            titulo: 'Compras del día',
            valor: '$0',
            cambio: 'Sin datos',
            positivo: true,
            icono: ShoppingBag,
        },
        {
            titulo: 'Productos',
            valor: '0',
            cambio: 'Registrados',
            positivo: true,
            icono: Package,
        },
        {
            titulo: 'Clientes',
            valor: '0',
            cambio: 'Registrados',
            positivo: true,
            icono: Users,
        },
    ];

    return (
        <div className="dashboard">

            {/* Encabezado */}

            <header className="dashboard-header">

                <div>
                    <h1>
                        Buenos días, {usuario?.name}
                    </h1>

                    <p>
                        Este es el resumen general de tu negocio.
                    </p>
                </div>

                <div className="dashboard-date">
                    <span>Hoy</span>
                    <strong>
                        {new Date().toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </strong>
                </div>

            </header>


            {/* Tarjetas */}

            <section className="dashboard-cards">

                {tarjetas.map((tarjeta) => {

                    const Icono = tarjeta.icono;

                    return (
                        <div
                            className="dashboard-card"
                            key={tarjeta.titulo}
                        >

                            <div className="card-top">

                                <div className="card-icon">
                                    <Icono size={22} />
                                </div>

                                <span>
                                    {tarjeta.titulo}
                                </span>

                            </div>

                            <div className="card-value">
                                {tarjeta.valor}
                            </div>

                            <div className="card-change">

                                {tarjeta.positivo
                                    ? <ArrowUpRight size={16} />
                                    : <ArrowDownRight size={16} />
                                }

                                {tarjeta.cambio}

                            </div>

                        </div>
                    );

                })}

            </section>


            {/* Contenido */}

            <section className="dashboard-grid">

                {/* Ventas */}

                <div className="dashboard-panel">

                    <div className="panel-header">

                        <div>
                            <h2>Ventas recientes</h2>
                            <p>
                                Últimas operaciones registradas
                            </p>
                        </div>

                        <TrendingUp size={22} />

                    </div>

                    <div className="empty-state">

                        <ShoppingCart size={40} />

                        <h3>
                            No hay ventas todavía
                        </h3>

                        <p>
                            Las ventas aparecerán aquí cuando
                            comiencen a registrarse.
                        </p>

                    </div>

                </div>


                {/* Inventario */}

                <div className="dashboard-panel">

                    <div className="panel-header">

                        <div>
                            <h2>Inventario</h2>
                            <p>
                                Estado del inventario
                            </p>
                        </div>

                        <AlertTriangle size={22} />

                    </div>

                    <div className="empty-state">

                        <Package size={40} />

                        <h3>
                            Sin productos registrados
                        </h3>

                        <p>
                            Cuando agregues productos,
                            aquí aparecerán las alertas.
                        </p>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Dashboard;