import { useEffect, useMemo, useState } from 'react';

import {
    Package,
    ArrowDownToLine,
    ArrowUpFromLine,
    SlidersHorizontal,
    Search,
    History,
    X,
    Save,
} from 'lucide-react';

import api from '../services/api';
import { tienePermiso } from '../utils/permisos';

function Inventario() {
    const [productos, setProductos] = useState([]);
    const [movimientos, setMovimientos] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [cargandoMovimientos, setCargandoMovimientos] =
        useState(false);

    const [busqueda, setBusqueda] = useState('');

    const [modalAbierto, setModalAbierto] = useState(false);
    const [tipoMovimiento, setTipoMovimiento] = useState(null);

    const [guardando, setGuardando] = useState(false);

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const [formulario, setFormulario] = useState({
        producto_id: '',
        cantidad: '',
        motivo: '',
        observaciones: '',
    });

    const cargarInventario = async () => {
        setCargando(true);
        setError('');

        try {
            const respuesta =
                await api.get('/inventario');

            setProductos(
                respuesta.data.productos || []
            );
        } catch (error) {
            console.error(
                'Error cargando inventario:',
                error
            );

            setError(
                error.response?.data?.message ||
                'No fue posible cargar el inventario.'
            );
        } finally {
            setCargando(false);
        }
    };

    const cargarMovimientos = async () => {
        setCargandoMovimientos(true);

        try {
            const respuesta =
                await api.get(
                    '/inventario/movimientos'
                );

            setMovimientos(
                respuesta.data.movimientos || []
            );
        } catch (error) {
            console.error(
                'Error cargando movimientos:',
                error
            );

            setError(
                error.response?.data?.message ||
                'No fue posible cargar los movimientos.'
            );
        } finally {
            setCargandoMovimientos(false);
        }
    };

    useEffect(() => {
        cargarInventario();
        cargarMovimientos();
    }, []);

    const limpiarFormulario = () => {
        setFormulario({
            producto_id: '',
            cantidad: '',
            motivo: '',
            observaciones: '',
        });

        setTipoMovimiento(null);
    };

    const abrirMovimiento = (tipo) => {
        limpiarFormulario();

        setMensaje('');
        setError('');

        setTipoMovimiento(tipo);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        if (guardando) {
            return;
        }

        setModalAbierto(false);
        limpiarFormulario();
    };

    const cambiarCampo = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value,
        }));

        setError('');
        setMensaje('');
    };

    const guardarMovimiento = async (e) => {
        e.preventDefault();

        if (!tipoMovimiento) {
            return;
        }

        setGuardando(true);
        setError('');
        setMensaje('');

        try {
            const datos = {
                producto_id:
                    Number(formulario.producto_id),

                cantidad:
                    Number(formulario.cantidad),

                motivo:
                    formulario.motivo.trim() ||
                    null,

                observaciones:
                    formulario.observaciones.trim() ||
                    null,
            };

            let respuesta;

            if (tipoMovimiento === 'entrada') {
                respuesta = await api.post(
                    '/inventario/entrada',
                    datos
                );
            }

            if (tipoMovimiento === 'salida') {
                respuesta = await api.post(
                    '/inventario/salida',
                    datos
                );
            }

            if (tipoMovimiento === 'ajuste') {
                respuesta = await api.post(
                    '/inventario/ajuste',
                    datos
                );
            }

            setMensaje(
                respuesta.data.message ||
                'Movimiento registrado correctamente.'
            );

            setModalAbierto(false);
            limpiarFormulario();

            await Promise.all([
                cargarInventario(),
                cargarMovimientos(),
            ]);
        } catch (error) {
            console.error(
                'Error guardando movimiento:',
                error
            );

            if (
                error.response?.status === 422
            ) {
                const errores =
                    error.response.data.errors;

                if (errores) {
                    const primerError =
                        Object.values(
                            errores
                        )[0]?.[0];

                    setError(
                        primerError ||
                        error.response?.data?.message ||
                        'Revisa los datos ingresados.'
                    );
                } else {
                    setError(
                        error.response?.data?.message ||
                        'Revisa los datos ingresados.'
                    );
                }
            } else {
                setError(
                    error.response?.data?.message ||
                    'No fue posible registrar el movimiento.'
                );
            }
        } finally {
            setGuardando(false);
        }
    };

    const productosFiltrados = useMemo(() => {
        const texto =
            busqueda.trim().toLowerCase();

        if (!texto) {
            return productos;
        }

        return productos.filter((producto) =>
            [
                producto.codigo,
                producto.nombre,
                producto.categoria,
                producto.unidad_medida,
            ]
                .filter(Boolean)
                .some((valor) =>
                    String(valor)
                        .toLowerCase()
                        .includes(texto)
                )
        );
    }, [productos, busqueda]);

    const estadisticas = useMemo(() => {
        const totalProductos =
            productos.length;

        const stockTotal =
            productos.reduce(
                (total, producto) =>
                    total +
                    Number(
                        producto.stock_actual || 0
                    ),
                0
            );

        const bajoStock =
            productos.filter(
                (producto) =>
                    Number(
                        producto.stock_actual || 0
                    ) <=
                    Number(
                        producto.stock_minimo || 0
                    )
            ).length;

        const sinStock =
            productos.filter(
                (producto) =>
                    Number(
                        producto.stock_actual || 0
                    ) <= 0
            ).length;

        return {
            totalProductos,
            stockTotal,
            bajoStock,
            sinStock,
        };
    }, [productos]);

    const obtenerClaseStock = (producto) => {
        const stock =
            Number(
                producto.stock_actual || 0
            );

        const minimo =
            Number(
                producto.stock_minimo || 0
            );

        if (stock <= 0) {
            return 'inventario-stock critico';
        }

        if (stock <= minimo) {
            return 'inventario-stock bajo';
        }

        return 'inventario-stock normal';
    };

    const obtenerTextoStock = (producto) => {
        const stock =
            Number(
                producto.stock_actual || 0
            );

        const minimo =
            Number(
                producto.stock_minimo || 0
            );

        if (stock <= 0) {
            return 'Sin stock';
        }

        if (stock <= minimo) {
            return 'Stock bajo';
        }

        return 'Disponible';
    };

    const obtenerTipoMovimiento = (tipo) => {
        if (tipo === 'entrada') {
            return 'Entrada';
        }

        if (tipo === 'salida') {
            return 'Salida';
        }

        return 'Ajuste';
    };

    const obtenerSigno = (tipo) => {
        if (tipo === 'entrada') {
            return '+';
        }

        if (tipo === 'salida') {
            return '-';
        }

        return '=';
    };

    const formatearFecha = (fecha) => {
        if (!fecha) {
            return '-';
        }

        return new Date(fecha).toLocaleString(
            'es-CO',
            {
                dateStyle: 'short',
                timeStyle: 'short',
            }
        );
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Inventario</h1>

                    <p>
                        Control de existencias y movimientos
                        de productos.
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                    }}
                >
                    {tienePermiso(
                        'inventario.entradas'
                    ) && (
                        <button
                            type="button"
                            onClick={() =>
                                abrirMovimiento(
                                    'entrada'
                                )
                            }
                            className="config-save-button"
                        >
                            <ArrowDownToLine
                                size={18}
                            />
                            Entrada
                        </button>
                    )}

                    {tienePermiso(
                        'inventario.salidas'
                    ) && (
                        <button
                            type="button"
                            onClick={() =>
                                abrirMovimiento(
                                    'salida'
                                )
                            }
                            className="config-save-button"
                        >
                            <ArrowUpFromLine
                                size={18}
                            />
                            Salida
                        </button>
                    )}

                    {tienePermiso(
                        'inventario.ajustes'
                    ) && (
                        <button
                            type="button"
                            onClick={() =>
                                abrirMovimiento(
                                    'ajuste'
                                )
                            }
                            className="config-save-button"
                        >
                            <SlidersHorizontal
                                size={18}
                            />
                            Ajuste
                        </button>
                    )}
                </div>
            </div>

            {mensaje && (
                <div className="config-success-message">
                    {mensaje}
                </div>
            )}

            {error && (
                <div className="config-error-message">
                    {error}
                </div>
            )}

            <div className="dashboard-grid">
                <div className="dashboard-panel">
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <Package size={22} />

                        <div>
                            <strong>
                                Productos
                            </strong>

                            <div>
                                {estadisticas.totalProductos}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-panel">
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <Package size={22} />

                        <div>
                            <strong>
                                Existencias
                            </strong>

                            <div>
                                {estadisticas.stockTotal.toFixed(
                                    3
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-panel">
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <SlidersHorizontal
                            size={22}
                        />

                        <div>
                            <strong>
                                Stock bajo
                            </strong>

                            <div>
                                {estadisticas.bajoStock}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-panel">
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <Package size={22} />

                        <div>
                            <strong>
                                Sin stock
                            </strong>

                            <div>
                                {estadisticas.sinStock}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="dashboard-panel"
                style={{
                    marginTop: '24px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '18px',
                    }}
                >
                    <Package size={21} />

                    <h2
                        style={{
                            margin: 0,
                        }}
                    >
                        Existencias
                    </h2>
                </div>

                <div
                    style={{
                        position: 'relative',
                        marginBottom: '18px',
                    }}
                >
                    <Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '13px',
                            top: '50%',
                            transform:
                                'translateY(-50%)',
                            color: '#94a3b8',
                        }}
                    />

                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) =>
                            setBusqueda(
                                e.target.value
                            )
                        }
                        placeholder="Buscar producto por código, nombre o categoría..."
                        className="producto-form-input"
                        style={{
                            paddingLeft: '40px',
                        }}
                    />
                </div>

                {cargando ? (
                    <p>Cargando inventario...</p>
                ) : (
                    <div
                        style={{
                            overflowX: 'auto',
                        }}
                    >
                        <table className="productos-table">
                            <thead>
                                <tr>
                                    <th>
                                        Código
                                    </th>

                                    <th>
                                        Producto
                                    </th>

                                    <th>
                                        Unidad
                                    </th>

                                    <th>
                                        Stock
                                    </th>

                                    <th>
                                        Mínimo
                                    </th>

                                    <th>
                                        Estado
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {productosFiltrados.length ===
                                0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            style={{
                                                textAlign:
                                                    'center',
                                                padding:
                                                    '30px',
                                            }}
                                        >
                                            No hay productos
                                            para mostrar.
                                        </td>
                                    </tr>
                                ) : (
                                    productosFiltrados.map(
                                        (producto) => (
                                            <tr
                                                key={
                                                    producto.id
                                                }
                                            >
                                                <td>
                                                    {producto.codigo ||
                                                        '-'}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            producto.nombre
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        producto.unidad_medida
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        {Number(
                                                            producto.stock_actual ||
                                                                0
                                                        ).toFixed(
                                                            3
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {Number(
                                                        producto.stock_minimo ||
                                                            0
                                                    ).toFixed(
                                                        3
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={obtenerClaseStock(
                                                            producto
                                                        )}
                                                    >
                                                        {obtenerTextoStock(
                                                            producto
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div
                className="dashboard-panel"
                style={{
                    marginTop: '24px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '18px',
                    }}
                >
                    <History size={21} />

                    <h2
                        style={{
                            margin: 0,
                        }}
                    >
                        Últimos movimientos
                    </h2>
                </div>

                {cargandoMovimientos ? (
                    <p>
                        Cargando movimientos...
                    </p>
                ) : (
                    <div
                        style={{
                            overflowX: 'auto',
                        }}
                    >
                        <table className="productos-table">
                            <thead>
                                <tr>
                                    <th>
                                        Fecha
                                    </th>

                                    <th>
                                        Producto
                                    </th>

                                    <th>
                                        Tipo
                                    </th>

                                    <th>
                                        Cantidad
                                    </th>

                                    <th>
                                        Stock anterior
                                    </th>

                                    <th>
                                        Stock nuevo
                                    </th>

                                    <th>
                                        Usuario
                                    </th>

                                    <th>
                                        Motivo
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {movimientos.length ===
                                0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            style={{
                                                textAlign:
                                                    'center',
                                                padding:
                                                    '30px',
                                            }}
                                        >
                                            No hay movimientos
                                            registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    movimientos
                                        .slice(0, 20)
                                        .map(
                                            (
                                                movimiento
                                            ) => (
                                                <tr
                                                    key={
                                                        movimiento.id
                                                    }
                                                >
                                                    <td>
                                                        {formatearFecha(
                                                            movimiento.created_at
                                                        )}
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {
                                                                movimiento
                                                                    .producto
                                                                    ?.nombre
                                                            }
                                                        </strong>

                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    '12px',
                                                                color:
                                                                    '#64748b',
                                                            }}
                                                        >
                                                            {
                                                                movimiento
                                                                    .producto
                                                                    ?.codigo
                                                            }
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {
                                                            obtenerTipoMovimiento(
                                                                movimiento.tipo
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {
                                                                obtenerSigno(
                                                                    movimiento.tipo
                                                                )
                                                            }{' '}
                                                            {Number(
                                                                movimiento.cantidad
                                                            ).toFixed(
                                                                3
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {Number(
                                                            movimiento.stock_anterior
                                                        ).toFixed(
                                                            3
                                                        )}
                                                    </td>

                                                    <td>
                                                        {Number(
                                                            movimiento.stock_nuevo
                                                        ).toFixed(
                                                            3
                                                        )}
                                                    </td>

                                                    <td>
                                                        {
                                                            movimiento
                                                                .usuario
                                                                ?.name
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            movimiento.motivo ||
                                                            '-'
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalAbierto && (
                <div className="tipos-negocio-modal-overlay">
                    <div className="productos-modal">

                        <div className="productos-modal-header">
                            <div>
                                <h2>
                                    {tipoMovimiento === 'entrada'
                                        ? 'Registrar entrada'
                                        : tipoMovimiento === 'salida'
                                        ? 'Registrar salida'
                                        : 'Realizar ajuste'}
                                </h2>

                                <p>
                                    Actualiza las existencias del producto.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={cerrarModal}
                                className="productos-modal-close"
                                disabled={guardando}
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form onSubmit={guardarMovimiento}>

                            <div className="producto-form-grid">

                                <div className="producto-form-field producto-form-field-full">
                                    <label htmlFor="inventario-producto">
                                        Producto
                                    </label>

                                    <div className="inventario-select-wrapper">
                                        <select
                                            id="inventario-producto"
                                            name="producto_id"
                                            value={formulario.producto_id}
                                            onChange={cambiarCampo}
                                            className="producto-form-select inventario-select"
                                            required
                                        >
                                            <option value="">
                                                Selecciona un producto
                                            </option>

                                            {productos
                                                .filter(
                                                    (producto) =>
                                                        producto.activo
                                                )
                                                .map((producto) => (
                                                    <option
                                                        key={producto.id}
                                                        value={producto.id}
                                                    >
                                                        {producto.codigo} -{' '}
                                                        {producto.nombre} | Stock:{' '}
                                                        {Number(
                                                            producto.stock_actual || 0
                                                        ).toFixed(3)}
                                                    </option>
                                                ))}
                                        </select>

                                        <span className="inventario-select-icon">
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>

                                <div className="producto-form-field">
                                    <label htmlFor="inventario-cantidad">
                                        {tipoMovimiento === 'ajuste'
                                            ? 'Nuevo stock'
                                            : 'Cantidad'}
                                    </label>

                                    <input
                                        id="inventario-cantidad"
                                        className="producto-form-input"
                                        name="cantidad"
                                        type="number"
                                        min="0.001"
                                        step="0.001"
                                        value={formulario.cantidad}
                                        onChange={cambiarCampo}
                                        placeholder="0.000"
                                        required
                                    />
                                </div>

                                <div className="producto-form-field">
                                    <label htmlFor="inventario-motivo">
                                        Motivo
                                    </label>

                                    <input
                                        id="inventario-motivo"
                                        className="producto-form-input"
                                        name="motivo"
                                        type="text"
                                        maxLength="150"
                                        value={formulario.motivo}
                                        onChange={cambiarCampo}
                                        placeholder={
                                            tipoMovimiento === 'entrada'
                                                ? 'Compra, devolución...'
                                                : tipoMovimiento === 'salida'
                                                ? 'Daño, pérdida...'
                                                : 'Conteo físico...'
                                        }
                                    />
                                </div>

                                <div className="producto-form-field producto-form-field-full">
                                    <label htmlFor="inventario-observaciones">
                                        Observaciones
                                    </label>

                                    <textarea
                                        id="inventario-observaciones"
                                        className="producto-form-textarea"
                                        name="observaciones"
                                        value={formulario.observaciones}
                                        onChange={cambiarCampo}
                                        placeholder="Observaciones adicionales..."
                                    />
                                </div>

                            </div>

                            <div className="productos-modal-footer">

                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="tipos-negocio-secondary-button"
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="config-save-button"
                                    disabled={guardando}
                                >
                                    <Save size={18} />

                                    {guardando
                                        ? 'Guardando...'
                                        : 'Registrar movimiento'}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventario;