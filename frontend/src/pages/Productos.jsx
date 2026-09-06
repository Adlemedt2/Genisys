import { useEffect, useState } from 'react';

import {
    Package,
    Plus,
    Search,
    Pencil,
    Power,
    X,
    Save,
} from 'lucide-react';

import api from '../services/api';
import { tienePermiso } from '../utils/permisos';

function Productos() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [busqueda, setBusqueda] = useState('');

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [productoEditando, setProductoEditando] = useState(null);

    const [guardando, setGuardando] = useState(false);

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const [formulario, setFormulario] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria: '',
        unidad_medida: 'unidad',
        precio_compra: '',
        precio_venta: '',
        stock_minimo: '',
        stock_actual: '',
        activo: true,
    });

    const cargarProductos = async () => {
        setCargando(true);
        setError('');

        try {
            const respuesta = await api.get('/productos');

            setProductos(
                respuesta.data.productos || []
            );
        } catch (error) {
            console.error(
                'Error cargando productos:',
                error
            );

            setError(
                error.response?.data?.message ||
                'No fue posible cargar los productos.'
            );
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    const limpiarFormulario = () => {
        setFormulario({
            codigo: '',
            nombre: '',
            descripcion: '',
            categoria: '',
            unidad_medida: 'unidad',
            precio_compra: '',
            precio_venta: '',
            stock_minimo: '',
            stock_actual: '',
            activo: true,
        });

        setProductoEditando(null);
        setModoEdicion(false);
    };

    const abrirNuevo = () => {
        limpiarFormulario();

        setMensaje('');
        setError('');

        setModalAbierto(true);
    };

    const abrirEditar = (producto) => {
        setProductoEditando(producto);
        setModoEdicion(true);

        setFormulario({
            codigo: producto.codigo || '',
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            categoria: producto.categoria || '',
            unidad_medida:
                producto.unidad_medida || 'unidad',
            precio_compra:
                producto.precio_compra ?? '',
            precio_venta:
                producto.precio_venta ?? '',
            stock_minimo:
                producto.stock_minimo ?? '',
            stock_actual:
                producto.stock_actual ?? '',
            activo:
                Boolean(producto.activo),
        });

        setMensaje('');
        setError('');

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
            type,
            checked,
        } = e.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]:
                type === 'checkbox'
                    ? checked
                    : value,
        }));

        setError('');
        setMensaje('');
    };

    const guardarProducto = async (e) => {
        e.preventDefault();

        setGuardando(true);
        setError('');
        setMensaje('');

        try {
            const datos = {
                codigo: formulario.codigo.trim(),
                nombre: formulario.nombre.trim(),
                descripcion:
                    formulario.descripcion.trim() || null,
                categoria:
                    formulario.categoria.trim() || null,
                unidad_medida:
                    formulario.unidad_medida.trim(),
                precio_compra:
                    Number(formulario.precio_compra),
                precio_venta:
                    Number(formulario.precio_venta),
                stock_minimo:
                    Number(formulario.stock_minimo),
                stock_actual:
                    Number(formulario.stock_actual),
                activo:
                    formulario.activo,
            };

            let respuesta;

            if (modoEdicion && productoEditando) {
                respuesta = await api.put(
                    `/productos/${productoEditando.id}`,
                    datos
                );
            } else {
                respuesta = await api.post(
                    '/productos',
                    datos
                );
            }

            setMensaje(
                respuesta.data.message ||
                'Producto guardado correctamente.'
            );

            setModalAbierto(false);
            limpiarFormulario();

            await cargarProductos();

        } catch (error) {
            console.error(
                'Error guardando producto:',
                error
            );

            if (error.response?.status === 422) {
                const errores =
                    error.response.data.errors;

                if (errores) {
                    const primerError =
                        Object.values(errores)[0]?.[0];

                    setError(
                        primerError ||
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
                    'No fue posible guardar el producto.'
                );
            }
        } finally {
            setGuardando(false);
        }
    };

    const cambiarEstado = async (producto) => {
        const accion = producto.activo
            ? 'desactivar'
            : 'activar';

        const confirmar = window.confirm(
            `¿Deseas ${accion} el producto "${producto.nombre}"?`
        );

        if (!confirmar) {
            return;
        }

        setError('');
        setMensaje('');

        try {
            const respuesta = await api.patch(
                `/productos/${producto.id}/estado`
            );

            setMensaje(
                respuesta.data.message ||
                'Estado actualizado correctamente.'
            );

            await cargarProductos();

        } catch (error) {
            console.error(
                'Error cambiando estado:',
                error
            );

            setError(
                error.response?.data?.message ||
                'No fue posible cambiar el estado del producto.'
            );
        }
    };

    const productosFiltrados = productos.filter(
        (producto) => {
            const texto = busqueda
                .toLowerCase()
                .trim();

            if (!texto) {
                return true;
            }

            return (
                producto.codigo
                    ?.toLowerCase()
                    .includes(texto) ||
                producto.nombre
                    ?.toLowerCase()
                    .includes(texto) ||
                producto.categoria
                    ?.toLowerCase()
                    .includes(texto)
            );
        }
    );

    const formatearPrecio = (valor) => {
        return new Intl.NumberFormat(
            'es-CO',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        ).format(Number(valor || 0));
    };

    return (
        <div className="dashboard-page">

            <div className="dashboard-header">
                <div>
                    <h1>Productos</h1>

                    <p>
                        Administra los productos de tu negocio.
                    </p>
                </div>

                {tienePermiso('productos.crear') && (
                    <button
                        type="button"
                        className="config-save-button"
                        onClick={abrirNuevo}
                    >
                        <Plus size={18} />
                        Nuevo producto
                    </button>
                )}
            </div>

            {mensaje && (
                <div className="config-success">
                    {mensaje}
                </div>
            )}

            {error && !modalAbierto && (
                <div className="config-error">
                    {error}
                </div>
            )}

            <div className="dashboard-panel">

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            flex: 1,
                        }}
                    >
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '14px',
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
                            placeholder="Buscar por código, nombre o categoría..."
                            style={{
                                width: '100%',
                                padding:
                                    '12px 14px 12px 42px',
                                border:
                                    '1px solid #e2e8f0',
                                borderRadius: '10px',
                                outline: 'none',
                                fontSize: '14px',
                                boxSizing:
                                    'border-box',
                            }}
                        />
                    </div>
                </div>

                {cargando ? (
                    <div className="empty-state">
                        <Package size={42} />

                        <h3>
                            Cargando productos...
                        </h3>
                    </div>
                ) : productosFiltrados.length === 0 ? (
                    <div className="empty-state">
                        <Package size={42} />

                        <h3>
                            {busqueda
                                ? 'No se encontraron productos'
                                : 'No hay productos registrados'}
                        </h3>

                        <p>
                            {busqueda
                                ? 'Prueba con otro término de búsqueda.'
                                : tienePermiso('productos.crear')
                                    ? 'Crea tu primer producto para comenzar a trabajar con el catálogo.'
                                    : 'No hay productos disponibles para mostrar.'}
                        </p>
                    </div>
                ) : (
                    <div
                        style={{
                            overflowX: 'auto',
                        }}
                    >
                        <table
                            style={{
                                width: '100%',
                                borderCollapse:
                                    'collapse',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color: '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Código
                                    </th>

                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color: '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Producto
                                    </th>

                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color: '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Categoría
                                    </th>

                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color: '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Precio compra
                                    </th>

                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color: '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Precio venta
                                    </th>

                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color: '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Stock
                                    </th>

                                    <th
                                        style={{
                                            textAlign: 'center',
                                            padding: '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color: '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Estado
                                    </th>

                                    <th
                                        style={{
                                            textAlign: 'center',
                                            padding: '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color: '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {productosFiltrados.map(
                                    (producto) => (
                                        <tr
                                            key={
                                                producto.id
                                            }
                                        >
                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    fontSize:
                                                        '13px',
                                                    fontWeight:
                                                        '600',
                                                }}
                                            >
                                                {
                                                    producto.codigo
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight:
                                                            '600',
                                                        color:
                                                            '#1e293b',
                                                    }}
                                                >
                                                    {
                                                        producto.nombre
                                                    }
                                                </div>

                                                {producto.descripcion && (
                                                    <div
                                                        style={{
                                                            marginTop:
                                                                '3px',
                                                            fontSize:
                                                                '12px',
                                                            color:
                                                                '#94a3b8',
                                                        }}
                                                    >
                                                        {
                                                            producto.descripcion
                                                        }
                                                    </div>
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    fontSize:
                                                        '13px',
                                                    color:
                                                        '#64748b',
                                                }}
                                            >
                                                {producto.categoria ||
                                                    '—'}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    textAlign:
                                                        'right',
                                                    fontSize:
                                                        '13px',
                                                }}
                                            >
                                                $
                                                {formatearPrecio(
                                                    producto.precio_compra
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    textAlign:
                                                        'right',
                                                    fontSize:
                                                        '13px',
                                                    fontWeight:
                                                        '600',
                                                }}
                                            >
                                                $
                                                {formatearPrecio(
                                                    producto.precio_venta
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    textAlign:
                                                        'right',
                                                    fontSize:
                                                        '13px',
                                                }}
                                            >
                                                {
                                                    producto.stock_actual
                                                }{' '}
                                                {
                                                    producto.unidad_medida
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    textAlign:
                                                        'center',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display:
                                                            'inline-flex',
                                                        padding:
                                                            '5px 10px',
                                                        borderRadius:
                                                            '999px',
                                                        fontSize:
                                                            '11px',
                                                        fontWeight:
                                                            '600',
                                                    }}
                                                >
                                                    {producto.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    textAlign:
                                                        'center',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display:
                                                            'flex',
                                                        justifyContent:
                                                            'center',
                                                        gap: '6px',
                                                    }}
                                                >
                                                    {tienePermiso(
                                                        'productos.editar'
                                                    ) && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                abrirEditar(
                                                                    producto
                                                                )
                                                            }
                                                            title="Editar"
                                                            style={{
                                                                border:
                                                                    'none',
                                                                background:
                                                                    '#f1f5f9',
                                                                borderRadius:
                                                                    '8px',
                                                                padding:
                                                                    '8px',
                                                                cursor:
                                                                    'pointer',
                                                            }}
                                                        >
                                                            <Pencil
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>
                                                    )}

                                                    {tienePermiso(
                                                        'productos.eliminar'
                                                    ) && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                cambiarEstado(
                                                                    producto
                                                                )
                                                            }
                                                            title={
                                                                producto.activo
                                                                    ? 'Desactivar'
                                                                    : 'Activar'
                                                            }
                                                            style={{
                                                                border:
                                                                    'none',
                                                                background:
                                                                    '#f1f5f9',
                                                                borderRadius:
                                                                    '8px',
                                                                padding:
                                                                    '8px',
                                                                cursor:
                                                                    'pointer',
                                                            }}
                                                        >
                                                            <Power
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalAbierto && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background:
                            'rgba(15, 23, 42, 0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '760px',
                            maxHeight:
                                'calc(100vh - 48px)',
                            overflowY: 'auto',
                            background:
                                '#ffffff',
                            borderRadius:
                                '16px',
                            boxShadow:
                                '0 20px 50px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        <div
                            style={{
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'space-between',
                                padding:
                                    '20px 24px',
                                borderBottom:
                                    '1px solid #e2e8f0',
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        color:
                                            '#1e293b',
                                    }}
                                >
                                    {modoEdicion
                                        ? 'Editar producto'
                                        : 'Nuevo producto'}
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            '5px 0 0',
                                        color:
                                            '#64748b',
                                        fontSize:
                                            '13px',
                                    }}
                                >
                                    Información del producto
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    cerrarModal
                                }
                                disabled={
                                    guardando
                                }
                                style={{
                                    border:
                                        'none',
                                    background:
                                        '#f1f5f9',
                                    borderRadius:
                                        '8px',
                                    padding:
                                        '8px',
                                    cursor:
                                        'pointer',
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                guardarProducto
                            }
                        >
                            <div
                                style={{
                                    padding:
                                        '24px',
                                    display:
                                        'grid',
                                    gridTemplateColumns:
                                        '1fr 1fr',
                                    gap: '18px',
                                }}
                            >
                                <div>
                                    <label>
                                        Código
                                    </label>

                                    <input
                                        name="codigo"
                                        value={
                                            formulario.codigo
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        placeholder="Ej. TORN-001"
                                        maxLength={
                                            100
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label>
                                        Nombre
                                    </label>

                                    <input
                                        name="nombre"
                                        value={
                                            formulario.nombre
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        placeholder="Ej. Tornillo 1/4"
                                        maxLength={
                                            150
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label>
                                        Categoría
                                    </label>

                                    <input
                                        name="categoria"
                                        value={
                                            formulario.categoria
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        placeholder="Ej. Tornillería"
                                        maxLength={
                                            100
                                        }
                                    />
                                </div>

                                <div>
                                    <label>
                                        Unidad de medida
                                    </label>

                                    <input
                                        name="unidad_medida"
                                        value={
                                            formulario.unidad_medida
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        placeholder="Ej. unidad"
                                        maxLength={
                                            50
                                        }
                                        required
                                    />
                                </div>

                                <div
                                    style={{
                                        gridColumn:
                                            '1 / -1',
                                    }}
                                >
                                    <label>
                                        Descripción
                                    </label>

                                    <textarea
                                        name="descripcion"
                                        value={
                                            formulario.descripcion
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        placeholder="Descripción del producto"
                                        rows="3"
                                    />
                                </div>

                                <div>
                                    <label>
                                        Precio de compra
                                    </label>

                                    <input
                                        name="precio_compra"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            formulario.precio_compra
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label>
                                        Precio de venta
                                    </label>

                                    <input
                                        name="precio_venta"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            formulario.precio_venta
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label>
                                        Stock mínimo
                                    </label>

                                    <input
                                        name="stock_minimo"
                                        type="number"
                                        min="0"
                                        step="0.001"
                                        value={
                                            formulario.stock_minimo
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label>
                                        Stock actual
                                    </label>

                                    <input
                                        name="stock_actual"
                                        type="number"
                                        min="0"
                                        step="0.001"
                                        value={
                                            formulario.stock_actual
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        required
                                    />
                                </div>

                                <label
                                    style={{
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        gap: '8px',
                                        cursor:
                                            'pointer',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        name="activo"
                                        checked={
                                            formulario.activo
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                    />

                                    Producto activo
                                </label>

                                {error && (
                                    <div
                                        className="config-error"
                                        style={{
                                            gridColumn:
                                                '1 / -1',
                                        }}
                                    >
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div
                                style={{
                                    display:
                                        'flex',
                                    justifyContent:
                                        'flex-end',
                                    gap: '10px',
                                    padding:
                                        '18px 24px',
                                    borderTop:
                                        '1px solid #e2e8f0',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={
                                        cerrarModal
                                    }
                                    disabled={
                                        guardando
                                    }
                                    style={{
                                        border:
                                            '1px solid #e2e8f0',
                                        background:
                                            '#ffffff',
                                        borderRadius:
                                            '9px',
                                        padding:
                                            '10px 16px',
                                        cursor:
                                            'pointer',
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="config-save-button"
                                    disabled={
                                        guardando
                                    }
                                >
                                    <Save
                                        size={17}
                                    />

                                    {guardando
                                        ? 'Guardando...'
                                        : 'Guardar producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Productos;