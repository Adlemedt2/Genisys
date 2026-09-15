import { useEffect, useMemo, useState } from 'react';

import {
    ShoppingCart,
    Plus,
    Search,
    Eye,
    CheckCircle2,
    XCircle,
    X,
    Save,
    Trash2,
} from 'lucide-react';

import api from '../services/api';


const Compras = () => {

    // =========================================================
    // ESTADOS
    // =========================================================

    const [compras, setCompras] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [productos, setProductos] = useState([]);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalDetalleAbierto, setModalDetalleAbierto] =
        useState(false);

    const [compraSeleccionada, setCompraSeleccionada] =
        useState(null);

    const [busqueda, setBusqueda] = useState('');

    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        proveedor_id: '',
        numero: '',
        fecha: new Date()
            .toISOString()
            .split('T')[0],
        impuesto: '',
        observaciones: '',
    });

    const [detalleActual, setDetalleActual] = useState({
        producto_id: '',
        cantidad: '',
        precio_unitario: '',
    });

    const [detalles, setDetalles] = useState([]);


    // =========================================================
    // PERMISOS
    // =========================================================

    const usuario = JSON.parse(
        localStorage.getItem('usuario') || 'null'
    );

    const permisos = usuario?.permisos || [];

    const tienePermiso = (permiso) =>
        permisos.includes(permiso);


    // =========================================================
    // FORMATO
    // =========================================================

    const formatearMoneda = (valor) => {
        const numero = Number(valor || 0);

        return numero.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };


    const formatearFecha = (fecha) => {
        if (!fecha) {
            return '-';
        }

        const fechaNormalizada = String(fecha).includes('T')
            ? fecha
            : `${fecha}T00:00:00`;

        const resultado = new Date(
            fechaNormalizada
        );

        if (Number.isNaN(resultado.getTime())) {
            return 'Fecha inválida';
        }

        return resultado.toLocaleDateString('es-CO');
    };


    const obtenerTextoEstado = (estado) => {
        switch (estado) {
            case 'pendiente':
                return 'Pendiente';

            case 'recibida':
                return 'Recibida';

            case 'anulada':
                return 'Anulada';

            default:
                return estado || '-';
        }
    };


    const obtenerClaseEstado = (estado) => {
        return `compra-estado ${estado || ''}`;
    };


    // =========================================================
    // CARGAR DATOS
    // =========================================================

    const cargarCompras = async () => {
        try {
            const respuesta = await api.get('/compras');

            setCompras(
                respuesta.data?.compras || []
            );

        } catch (err) {

            console.error(
                'Error cargando compras:',
                err
            );

            setError(
                err.response?.data?.message ||
                'No fue posible cargar las compras.'
            );
        }
    };


    const cargarProveedores = async () => {
        try {
            const respuesta = await api.get(
                '/proveedores'
            );

            setProveedores(
                respuesta.data?.proveedores || []
            );

        } catch (err) {

            console.error(
                'Error cargando proveedores:',
                err
            );
        }
    };


    const cargarProductos = async () => {
        try {
            const respuesta = await api.get(
                '/productos'
            );

            setProductos(
                respuesta.data?.productos || []
            );

        } catch (err) {

            console.error(
                'Error cargando productos:',
                err
            );
        }
    };


    const cargarDatos = async () => {
        setCargando(true);
        setError('');

        await Promise.all([
            cargarCompras(),
            cargarProveedores(),
            cargarProductos(),
        ]);

        setCargando(false);
    };


    useEffect(() => {
        cargarDatos();
    }, []);


    // =========================================================
    // FILTRO
    // =========================================================

    const comprasFiltradas = useMemo(() => {

        const texto = busqueda
            .trim()
            .toLowerCase();

        if (!texto) {
            return compras;
        }

        return compras.filter((compra) => {

            const numero =
                String(
                    compra.numero || ''
                ).toLowerCase();

            const proveedor =
                String(
                    compra.proveedor?.nombre || ''
                ).toLowerCase();

            const estado =
                String(
                    obtenerTextoEstado(
                        compra.estado
                    )
                ).toLowerCase();

            return (
                numero.includes(texto) ||
                proveedor.includes(texto) ||
                estado.includes(texto)
            );
        });

    }, [compras, busqueda]);


    // =========================================================
    // TOTALES DEL FORMULARIO
    // =========================================================

    const subtotal = useMemo(() => {

        return detalles.reduce(
            (total, detalle) =>
                total +
                Number(detalle.subtotal || 0),
            0
        );

    }, [detalles]);


    const impuesto = Number(
        form.impuesto || 0
    );


    const total = subtotal + impuesto;


    // =========================================================
    // ABRIR NUEVA COMPRA
    // =========================================================

    const abrirNuevaCompra = () => {

        setMensaje('');
        setError('');

        setForm({
            proveedor_id: '',
            numero: '',
            fecha: new Date()
                .toISOString()
                .split('T')[0],
            impuesto: '',
            observaciones: '',
        });

        setDetalleActual({
            producto_id: '',
            cantidad: '',
            precio_unitario: '',
        });

        setDetalles([]);

        setModalAbierto(true);
    };


    const cerrarModal = () => {

        if (procesando) {
            return;
        }

        setModalAbierto(false);

        setDetalleActual({
            producto_id: '',
            cantidad: '',
            precio_unitario: '',
        });

        setDetalles([]);
    };


    // =========================================================
    // CAMBIOS DEL FORMULARIO
    // =========================================================

    const cambiarFormulario = (campo, valor) => {

        setForm((actual) => ({
            ...actual,
            [campo]: valor,
        }));
    };


    const cambiarDetalle = (campo, valor) => {

        setDetalleActual((actual) => ({
            ...actual,
            [campo]: valor,
        }));
    };


    // =========================================================
    // AGREGAR PRODUCTO
    // =========================================================

    const agregarDetalle = () => {

        setError('');

        if (!detalleActual.producto_id) {

            setError(
                'Selecciona un producto.'
            );

            return;
        }

        const cantidad = Number(
            detalleActual.cantidad
        );

        const precioUnitario = Number(
            detalleActual.precio_unitario
        );

        if (
            !cantidad ||
            cantidad <= 0
        ) {

            setError(
                'La cantidad debe ser mayor que cero.'
            );

            return;
        }

        if (
            Number.isNaN(precioUnitario) ||
            precioUnitario < 0
        ) {

            setError(
                'El precio de compra no puede ser negativo.'
            );

            return;
        }

        const producto = productos.find(
            (item) =>
                Number(item.id) ===
                Number(
                    detalleActual.producto_id
                )
        );

        if (!producto) {

            setError(
                'El producto seleccionado no existe.'
            );

            return;
        }

        const yaExiste = detalles.some(
            (detalle) =>
                Number(detalle.producto_id) ===
                Number(
                    detalleActual.producto_id
                )
        );

        if (yaExiste) {

            setError(
                'Ese producto ya está agregado a la compra.'
            );

            return;
        }

        const subtotalDetalle =
            cantidad * precioUnitario;

        setDetalles((actuales) => [
            ...actuales,
            {
                producto_id:
                    Number(
                        detalleActual.producto_id
                    ),

                producto,

                cantidad,

                precio_unitario:
                    precioUnitario,

                subtotal:
                    subtotalDetalle,
            },
        ]);

        setDetalleActual({
            producto_id: '',
            cantidad: '',
            precio_unitario: '',
        });
    };


    // =========================================================
    // ELIMINAR DETALLE
    // =========================================================

    const eliminarDetalle = (indice) => {

        setDetalles((actuales) =>
            actuales.filter(
                (_, index) =>
                    index !== indice
            )
        );
    };


    // =========================================================
    // GUARDAR COMPRA
    // =========================================================

    const guardarCompra = async (evento) => {

        evento.preventDefault();

        setMensaje('');
        setError('');

        if (!tienePermiso('compras.crear')) {

            setError(
                'No tienes permisos para crear compras.'
            );

            return;
        }

        if (!form.proveedor_id) {

            setError(
                'Selecciona un proveedor.'
            );

            return;
        }

        if (!form.numero.trim()) {

            setError(
                'Ingresa el número de la compra.'
            );

            return;
        }

        if (!form.fecha) {

            setError(
                'Selecciona la fecha de la compra.'
            );

            return;
        }

        if (detalles.length === 0) {

            setError(
                'Debes agregar al menos un producto.'
            );

            return;
        }

        setProcesando(true);

        try {

            const respuesta = await api.post(
                '/compras',
                {
                    proveedor_id:
                        Number(
                            form.proveedor_id
                        ),

                    numero:
                        form.numero.trim(),

                    fecha:
                        form.fecha,

                    impuesto:
                        Number(
                            form.impuesto || 0
                        ),

                    observaciones:
                        form.observaciones.trim() ||
                        null,

                    detalles:
                        detalles.map(
                            (detalle) => ({
                                producto_id:
                                    Number(
                                        detalle.producto_id
                                    ),

                                cantidad:
                                    Number(
                                        detalle.cantidad
                                    ),

                                precio_unitario:
                                    Number(
                                        detalle.precio_unitario
                                    ),
                            })
                        ),
                }
            );

            setModalAbierto(false);

            setForm({
                proveedor_id: '',
                numero: '',
                fecha: new Date()
                    .toISOString()
                    .split('T')[0],
                impuesto: '',
                observaciones: '',
            });

            setDetalles([]);

            setDetalleActual({
                producto_id: '',
                cantidad: '',
                precio_unitario: '',
            });

            setMensaje(
                respuesta.data?.message ||
                'Compra creada correctamente.'
            );

            await cargarCompras();

        } catch (err) {

            console.error(
                'Error guardando compra:',
                err
            );

            setError(
                err.response?.data?.message ||
                'No fue posible guardar la compra.'
            );

        } finally {

            setProcesando(false);
        }
    };


    // =========================================================
    // VER COMPRA
    // =========================================================

    const verCompra = async (compra) => {

        setMensaje('');
        setError('');

        try {

            const respuesta = await api.get(
                `/compras/${compra.id}`
            );

            setCompraSeleccionada(
                respuesta.data?.compra ||
                respuesta.data
            );

            setModalDetalleAbierto(true);

        } catch (err) {

            console.error(
                'Error consultando compra:',
                err
            );

            setError(
                err.response?.data?.message ||
                'No fue posible consultar la compra.'
            );
        }
    };


    // =========================================================
    // RECIBIR COMPRA
    // =========================================================

    const recibirCompra = async (compra) => {

        if (
            !window.confirm(
                `¿Deseas recibir la compra ${compra.numero}?`
            )
        ) {
            return;
        }

        setMensaje('');
        setError('');
        setProcesando(true);

        try {

            const respuesta = await api.patch(
                `/compras/${compra.id}/recibir`
            );

            setMensaje(
                respuesta.data?.message ||
                'Compra recibida correctamente.'
            );

            await cargarCompras();

        } catch (err) {

            console.error(
                'Error recibiendo compra:',
                err
            );

            setError(
                err.response?.data?.message ||
                'No fue posible recibir la compra.'
            );

        } finally {

            setProcesando(false);
        }
    };


    // =========================================================
    // ANULAR COMPRA
    // =========================================================

    const anularCompra = async (compra) => {

        if (
            !window.confirm(
                `¿Deseas anular la compra ${compra.numero}?`
            )
        ) {
            return;
        }

        setMensaje('');
        setError('');
        setProcesando(true);

        try {

            const respuesta = await api.patch(
                `/compras/${compra.id}/anular`
            );

            setMensaje(
                respuesta.data?.message ||
                'Compra anulada correctamente.'
            );

            await cargarCompras();

        } catch (err) {

            console.error(
                'Error anulando compra:',
                err
            );

            setError(
                err.response?.data?.message ||
                'No fue posible anular la compra.'
            );

        } finally {

            setProcesando(false);
        }
    };


    // =========================================================
    // CERRAR DETALLE
    // =========================================================

    const cerrarModalDetalle = () => {

        setModalDetalleAbierto(false);
        setCompraSeleccionada(null);
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="dashboard-page">

            {/* =================================================
                ENCABEZADO
                ================================================= */}
            <div className="compras-page-header">
                <div className="compras-page-title">
                    <h1>Compras</h1>

                    <p>
                        Registra y controla las compras de productos.
                    </p>
                </div>

                <button
                    type="button"
                    className="config-save-button compras-nueva-button"
                    onClick={abrirNuevaCompra}
                >
                    <Plus size={18} />
                    Nueva compra
                </button>
            </div>


            {/* =================================================
                MENSAJES
                ================================================= */}

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


            {/* =================================================
                PANEL DE COMPRAS
                ================================================= */}

            <div className="dashboard-panel">

                <div className="dashboard-panel-header">

                    <div className="dashboard-panel-title">

                        <ShoppingCart size={21} />

                        <h2>
                            Compras registradas
                        </h2>

                    </div>

                </div>


                {/* BUSCADOR */}

                <div className="compras-buscador">

                    <Search size={18} />

                    <input
                        type="text"
                        value={busqueda}
                        onChange={(evento) =>
                            setBusqueda(
                                evento.target.value
                            )
                        }
                        placeholder="Buscar por número, proveedor o estado..."
                    />

                </div>


                {/* TABLA */}

                {cargando ? (

                    <div className="compras-vacio">
                        Cargando compras...
                    </div>

                ) : (

                    <div className="compras-table-wrapper">

                        <table className="compras-table">

                            <thead>

                                <tr>

                                    <th>
                                        Número
                                    </th>

                                    <th>
                                        Fecha
                                    </th>

                                    <th>
                                        Proveedor
                                    </th>

                                    <th className="compras-th-monto">
                                        Subtotal
                                    </th>

                                    <th className="compras-th-monto">
                                        Impuesto
                                    </th>

                                    <th className="compras-th-monto">
                                        Total
                                    </th>

                                    <th className="compras-th-estado">
                                        Estado
                                    </th>

                                    <th className="compras-th-acciones">
                                        Acciones
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {comprasFiltradas.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="compras-vacio-celda"
                                        >
                                            No hay compras
                                            registradas.
                                        </td>

                                    </tr>

                                ) : (

                                    comprasFiltradas.map(
                                        (compra) => (

                                            <tr
                                                key={
                                                    compra.id
                                                }
                                            >

                                                {/* NÚMERO */}

                                                <td className="compras-numero">

                                                    {compra.numero}

                                                </td>


                                                {/* FECHA */}

                                                <td className="compras-fecha">

                                                    {formatearFecha(
                                                        compra.fecha
                                                    )}

                                                </td>


                                                {/* PROVEEDOR */}

                                                <td className="compras-proveedor">

                                                    {compra.proveedor?.nombre ||
                                                        'Sin proveedor'}

                                                </td>


                                                {/* SUBTOTAL */}

                                                <td className="compras-monto">

                                                    {formatearMoneda(
                                                        compra.subtotal
                                                    )}

                                                </td>


                                                {/* IMPUESTO */}

                                                <td className="compras-monto">

                                                    {formatearMoneda(
                                                        compra.impuesto
                                                    )}

                                                </td>


                                                {/* TOTAL */}

                                                <td className="compras-monto compras-total">

                                                    {formatearMoneda(
                                                        compra.total
                                                    )}

                                                </td>


                                                {/* ESTADO */}

                                                <td className="compras-estado-celda">

                                                    <span
                                                        className={obtenerClaseEstado(
                                                            compra.estado
                                                        )}
                                                    >
                                                        {obtenerTextoEstado(
                                                            compra.estado
                                                        )}
                                                    </span>

                                                </td>


                                                {/* ACCIONES */}

                                                <td className="compras-acciones">

                                                    <button
                                                        type="button"
                                                        className="compra-accion ver"
                                                        onClick={() =>
                                                            verCompra(
                                                                compra
                                                            )
                                                        }
                                                    >
                                                        <Eye
                                                            size={15}
                                                        />
                                                        Ver
                                                    </button>


                                                    {compra.estado ===
                                                        'pendiente' &&
                                                        tienePermiso(
                                                            'compras.editar'
                                                        ) && (
                                                            <>

                                                                <button
                                                                    type="button"
                                                                    className="compra-accion recibir"
                                                                    onClick={() =>
                                                                        recibirCompra(
                                                                            compra
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        procesando
                                                                    }
                                                                >
                                                                    <CheckCircle2
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                    Recibir
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="compra-accion anular"
                                                                    onClick={() =>
                                                                        anularCompra(
                                                                            compra
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        procesando
                                                                    }
                                                                >
                                                                    <XCircle
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                    Anular
                                                                </button>

                                                            </>
                                                        )}

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


            {/* =================================================
                MODAL NUEVA COMPRA
                ================================================= */}

            {modalAbierto && (

                <div className="tipos-negocio-modal-overlay">

                    <div className="productos-modal compra-modal">

                        <div className="productos-modal-header">

                            <div>

                                <h2>
                                    Nueva compra
                                </h2>

                                <p>
                                    Registra los productos
                                    adquiridos al proveedor.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="productos-modal-close"
                                onClick={cerrarModal}
                                disabled={procesando}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            onSubmit={guardarCompra}
                        >

                            <div className="producto-form-grid">


                                {/* PROVEEDOR */}

                                <div className="producto-form-field">

                                    <label>
                                        Proveedor
                                    </label>

                                    <select
                                        className="producto-form-select"
                                        value={
                                            form.proveedor_id
                                        }
                                        onChange={(evento) =>
                                            cambiarFormulario(
                                                'proveedor_id',
                                                evento.target.value
                                            )
                                        }
                                        disabled={
                                            procesando
                                        }
                                    >

                                        <option value="">
                                            Selecciona
                                        </option>

                                        {proveedores.map(
                                            (proveedor) => (
                                                <option
                                                    key={
                                                        proveedor.id
                                                    }
                                                    value={
                                                        proveedor.id
                                                    }
                                                >
                                                    {
                                                        proveedor.nombre
                                                    }

                                                    {proveedor.numero_documento
                                                        ? ` - ${proveedor.numero_documento}`
                                                        : ''}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>


                                {/* NÚMERO */}

                                <div className="producto-form-field">

                                    <label>
                                        Número
                                    </label>

                                    <input
                                        type="text"
                                        className="producto-form-input"
                                        value={
                                            form.numero
                                        }
                                        onChange={(evento) =>
                                            cambiarFormulario(
                                                'numero',
                                                evento.target.value
                                            )
                                        }
                                        placeholder="Ej: COMP-001"
                                        disabled={
                                            procesando
                                        }
                                    />

                                </div>


                                {/* FECHA */}

                                <div className="producto-form-field">

                                    <label>
                                        Fecha
                                    </label>

                                    <input
                                        type="date"
                                        className="producto-form-input"
                                        value={
                                            form.fecha
                                        }
                                        onChange={(evento) =>
                                            cambiarFormulario(
                                                'fecha',
                                                evento.target.value
                                            )
                                        }
                                        disabled={
                                            procesando
                                        }
                                    />

                                </div>


                                {/* IMPUESTO */}

                                <div className="producto-form-field">

                                    <label>
                                        Impuesto
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="producto-form-input"
                                        value={
                                            form.impuesto
                                        }
                                        onChange={(evento) =>
                                            cambiarFormulario(
                                                'impuesto',
                                                evento.target.value
                                            )
                                        }
                                        placeholder="0.00"
                                        disabled={
                                            procesando
                                        }
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                AGREGAR PRODUCTOS
                                ================================================= */}

                            <div className="compra-productos-section">

                                <div className="compra-section-title">
                                    Productos
                                </div>


                                <div className="compra-agregar-grid">


                                    {/* PRODUCTO */}

                                    <div className="producto-form-field">

                                        <label>
                                            Producto
                                        </label>

                                        <select
                                            className="producto-form-select"
                                            value={
                                                detalleActual.producto_id
                                            }
                                            onChange={(evento) =>
                                                cambiarDetalle(
                                                    'producto_id',
                                                    evento.target.value
                                                )
                                            }
                                            disabled={
                                                procesando
                                            }
                                        >

                                            <option value="">
                                                Selecciona
                                            </option>

                                            {productos.map(
                                                (producto) => (
                                                    <option
                                                        key={
                                                            producto.id
                                                        }
                                                        value={
                                                            producto.id
                                                        }
                                                    >
                                                        {
                                                            producto.nombre
                                                        }
                                                        {producto.codigo
                                                            ? ` - ${producto.codigo}`
                                                            : ''}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>


                                    {/* CANTIDAD */}

                                    <div className="producto-form-field">

                                        <label>
                                            Cantidad
                                        </label>

                                        <input
                                            type="number"
                                            min="0.001"
                                            step="0.001"
                                            className="producto-form-input"
                                            value={
                                                detalleActual.cantidad
                                            }
                                            onChange={(evento) =>
                                                cambiarDetalle(
                                                    'cantidad',
                                                    evento.target.value
                                                )
                                            }
                                            placeholder="0.000"
                                            disabled={
                                                procesando
                                            }
                                        />

                                    </div>


                                    {/* PRECIO */}

                                    <div className="producto-form-field">

                                        <label>
                                            Precio compra
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="producto-form-input"
                                            value={
                                                detalleActual.precio_unitario
                                            }
                                            onChange={(evento) =>
                                                cambiarDetalle(
                                                    'precio_unitario',
                                                    evento.target.value
                                                )
                                            }
                                            placeholder="0.00"
                                            disabled={
                                                procesando
                                            }
                                        />

                                    </div>


                                    {/* AGREGAR */}

                                    <div className="compra-agregar-button">

                                        <button
                                            type="button"
                                            className="config-save-button"
                                            onClick={
                                                agregarDetalle
                                            }
                                            disabled={
                                                procesando
                                            }
                                        >
                                            <Plus
                                                size={17}
                                            />
                                            Agregar
                                        </button>

                                    </div>

                                </div>


                                {/* =================================================
                                    DETALLES AGREGADOS
                                    ================================================= */}

                                <div className="compra-detalles-wrapper">

                                    {detalles.length === 0 ? (

                                        <div className="compra-detalles-vacio">
                                            Aún no has agregado
                                            productos a la compra.
                                        </div>

                                    ) : (

                                        <table className="compra-detalles-table">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        Producto
                                                    </th>

                                                    <th>
                                                        Cantidad
                                                    </th>

                                                    <th>
                                                        Precio
                                                    </th>

                                                    <th>
                                                        Subtotal
                                                    </th>

                                                    <th>
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {detalles.map(
                                                    (
                                                        detalle,
                                                        indice
                                                    ) => (

                                                        <tr
                                                            key={`${detalle.producto_id}-${indice}`}
                                                        >

                                                            <td>

                                                                <div className="compra-producto-nombre">

                                                                    {
                                                                        detalle
                                                                            .producto
                                                                            ?.nombre
                                                                    }

                                                                </div>

                                                                {detalle
                                                                    .producto
                                                                    ?.codigo && (
                                                                        <div className="compra-producto-codigo">

                                                                            {
                                                                                detalle
                                                                                    .producto
                                                                                    .codigo
                                                                            }

                                                                        </div>
                                                                    )}

                                                            </td>


                                                            <td>

                                                                {Number(
                                                                    detalle.cantidad
                                                                ).toLocaleString(
                                                                    'es-CO',
                                                                    {
                                                                        minimumFractionDigits: 3,
                                                                        maximumFractionDigits: 3,
                                                                    }
                                                                )}

                                                                {detalle
                                                                    .producto
                                                                    ?.unidad_medida && (
                                                                        <span className="compra-unidad">

                                                                            {' '}
                                                                            {
                                                                                detalle
                                                                                    .producto
                                                                                    .unidad_medida
                                                                            }

                                                                        </span>
                                                                    )}

                                                            </td>


                                                            <td>

                                                                {formatearMoneda(
                                                                    detalle.precio_unitario
                                                                )}

                                                            </td>


                                                            <td className="compra-detalle-subtotal">

                                                                {formatearMoneda(
                                                                    detalle.subtotal
                                                                )}

                                                            </td>


                                                            <td>

                                                                <button
                                                                    type="button"
                                                                    className="compra-eliminar-detalle"
                                                                    onClick={() =>
                                                                        eliminarDetalle(
                                                                            indice
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        procesando
                                                                    }
                                                                    title="Eliminar producto"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>

                                                            </td>

                                                        </tr>

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    )}

                                </div>

                            </div>


                            {/* =================================================
                                OBSERVACIONES
                                ================================================= */}

                            <div className="producto-form-field compra-observaciones">

                                <label>
                                    Observaciones
                                </label>

                                <textarea
                                    className="producto-form-textarea"
                                    value={
                                        form.observaciones
                                    }
                                    onChange={(evento) =>
                                        cambiarFormulario(
                                            'observaciones',
                                            evento.target.value
                                        )
                                    }
                                    placeholder="Observaciones adicionales..."
                                    rows="4"
                                    disabled={
                                        procesando
                                    }
                                />

                            </div>


                            {/* =================================================
                                TOTALES
                                ================================================= */}

                            <div className="compra-totales">

                                <div className="compra-total-linea">

                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        {formatearMoneda(
                                            subtotal
                                        )}
                                    </strong>

                                </div>


                                <div className="compra-total-linea">

                                    <span>
                                        Impuesto
                                    </span>

                                    <strong>
                                        {formatearMoneda(
                                            impuesto
                                        )}
                                    </strong>

                                </div>


                                <div className="compra-total-linea compra-total-final">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {formatearMoneda(
                                            total
                                        )}
                                    </strong>

                                </div>

                            </div>


                            {/* =================================================
                                FOOTER
                                ================================================= */}

                            <div className="productos-modal-footer">

                                <button
                                    type="button"
                                    className="tipos-negocio-secondary-button"
                                    onClick={
                                        cerrarModal
                                    }
                                    disabled={
                                        procesando
                                    }
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="submit"
                                    className="config-save-button"
                                    disabled={
                                        procesando ||
                                        detalles.length === 0
                                    }
                                >
                                    <Save
                                        size={17}
                                    />

                                    {procesando
                                        ? 'Guardando...'
                                        : 'Guardar compra'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                MODAL DETALLE DE COMPRA
                ================================================= */}

            {modalDetalleAbierto &&
                compraSeleccionada && (

                    <div className="tipos-negocio-modal-overlay">

                        <div className="productos-modal compra-modal">

                            <div className="productos-modal-header">

                                <div>

                                    <h2>
                                        Compra{' '}
                                        {
                                            compraSeleccionada.numero
                                        }
                                    </h2>

                                    <p>
                                        Detalle de la compra
                                        registrada.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="productos-modal-close"
                                    onClick={
                                        cerrarModalDetalle
                                    }
                                >
                                    <X size={20} />
                                </button>

                            </div>


                            <div className="compra-detalle-resumen">

                                <div>
                                    <span>
                                        Proveedor
                                    </span>

                                    <strong>
                                        {
                                            compraSeleccionada
                                                .proveedor
                                                ?.nombre ||
                                            'Sin proveedor'
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Fecha
                                    </span>

                                    <strong>
                                        {formatearFecha(
                                            compraSeleccionada.fecha
                                        )}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Estado
                                    </span>

                                    <strong>
                                        <span
                                            className={obtenerClaseEstado(
                                                compraSeleccionada.estado
                                            )}
                                        >
                                            {obtenerTextoEstado(
                                                compraSeleccionada.estado
                                            )}
                                        </span>
                                    </strong>
                                </div>

                            </div>


                            <div className="compra-detalles-wrapper">

                                <table className="compra-detalles-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Producto
                                            </th>

                                            <th>
                                                Cantidad
                                            </th>

                                            <th>
                                                Precio
                                            </th>

                                            <th>
                                                Subtotal
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {(
                                            compraSeleccionada
                                                .detalles ||
                                            []
                                        ).map(
                                            (detalle) => (

                                                <tr
                                                    key={
                                                        detalle.id
                                                    }
                                                >

                                                    <td>

                                                        <div className="compra-producto-nombre">

                                                            {
                                                                detalle
                                                                    .producto
                                                                    ?.nombre
                                                            }

                                                        </div>

                                                        {detalle
                                                            .producto
                                                            ?.codigo && (
                                                                <div className="compra-producto-codigo">

                                                                    {
                                                                        detalle
                                                                            .producto
                                                                            .codigo
                                                                    }

                                                                </div>
                                                            )}

                                                    </td>


                                                    <td>

                                                        {Number(
                                                            detalle.cantidad
                                                        ).toLocaleString(
                                                            'es-CO',
                                                            {
                                                                minimumFractionDigits: 3,
                                                                maximumFractionDigits: 3,
                                                            }
                                                        )}

                                                    </td>


                                                    <td>

                                                        {formatearMoneda(
                                                            detalle.precio_unitario
                                                        )}

                                                    </td>


                                                    <td className="compra-detalle-subtotal">

                                                        {formatearMoneda(
                                                            detalle.subtotal
                                                        )}

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>


                            <div className="compra-totales compra-totales-detalle">

                                <div className="compra-total-linea">

                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        {formatearMoneda(
                                            compraSeleccionada.subtotal
                                        )}
                                    </strong>

                                </div>


                                <div className="compra-total-linea">

                                    <span>
                                        Impuesto
                                    </span>

                                    <strong>
                                        {formatearMoneda(
                                            compraSeleccionada.impuesto
                                        )}
                                    </strong>

                                </div>


                                <div className="compra-total-linea compra-total-final">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {formatearMoneda(
                                            compraSeleccionada.total
                                        )}
                                    </strong>

                                </div>

                            </div>


                            {compraSeleccionada.observaciones && (

                                <div className="compra-observaciones-detalle">

                                    <strong>
                                        Observaciones
                                    </strong>

                                    <p>
                                        {
                                            compraSeleccionada.observaciones
                                        }
                                    </p>

                                </div>

                            )}


                            <div className="productos-modal-footer">

                                <button
                                    type="button"
                                    className="tipos-negocio-secondary-button"
                                    onClick={
                                        cerrarModalDetalle
                                    }
                                >
                                    Cerrar
                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
};
export default Compras;